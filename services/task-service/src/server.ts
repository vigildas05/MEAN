import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';
import { z } from 'zod';
import { taskStatuses, type TaskStatus } from '@platform/shared';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret';
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/project_platform';

interface AuthRequest extends express.Request {
  user?: { id: string; email: string; role: string };
}

function requireAuth(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'Missing bearer token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { sub: string; email: string; role: string };
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    ownerId: { type: String, required: true },
    memberIds: [{ type: String }]
  },
  { timestamps: true }
);

const commentSchema = new Schema(
  {
    authorId: { type: String, required: true },
    body: { type: String, required: true }
  },
  { timestamps: true }
);

const taskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: taskStatuses, default: 'todo' },
    assigneeId: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    comments: [commentSchema]
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);

const projectInput = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional()
});

const taskInput = z.object({
  projectId: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']).optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional()
});

app.get('/health', (_req, res) => {
  res.json({ service: 'task-service', status: 'ok' });
});

app.use(requireAuth);

app.get('/projects', async (req: AuthRequest, res) => {
  const projects = await Project.find({
    $or: [{ ownerId: req.user!.id }, { memberIds: req.user!.id }]
  }).sort({ createdAt: -1 });
  res.json(projects);
});

app.post('/projects', async (req: AuthRequest, res) => {
  const input = projectInput.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ message: 'Invalid project payload', issues: input.error.issues });
    return;
  }

  const project = await Project.create({
    name: input.data.name,
    description: input.data.description,
    ownerId: req.user!.id,
    memberIds: input.data.memberIds ?? []
  });
  res.status(201).json(project);
});

app.get('/tasks', async (req, res) => {
  const { projectId, status, search } = req.query;
  const filter: Record<string, unknown> = {};
  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;
  if (search) filter.title = { $regex: String(search), $options: 'i' };

  const tasks = await Task.find(filter).sort({ updatedAt: -1 });
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const input = taskInput.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ message: 'Invalid task payload', issues: input.error.issues });
    return;
  }

  const task = await Task.create(input.data);
  res.status(201).json(task);
});

app.patch('/tasks/:id/status', async (req, res) => {
  const status = z.enum(['todo', 'in-progress', 'review', 'done']).safeParse(req.body.status);
  if (!status.success) {
    res.status(400).json({ message: 'Invalid task status' });
    return;
  }

  const task = await Task.findByIdAndUpdate(req.params.id, { status: status.data }, { new: true });
  res.json(task);
});

app.post('/tasks/:id/comments', async (req: AuthRequest, res) => {
  const input = z.object({ body: z.string().min(1) }).safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ message: 'Invalid comment payload' });
    return;
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { authorId: req.user!.id, body: input.data.body } } },
    { new: true }
  );
  res.status(201).json(task);
});

app.get('/stats', async (_req, res) => {
  const [totalProjects, totalTasks, grouped] = await Promise.all([
    Project.countDocuments(),
    Task.countDocuments(),
    Task.aggregate<{ _id: TaskStatus; count: number }>([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);

  const byStatus = Object.fromEntries(taskStatuses.map((status) => [status, 0])) as Record<TaskStatus, number>;
  grouped.forEach((item) => {
    byStatus[item._id] = item.count;
  });

  res.json({ totalProjects, totalTasks, byStatus });
});

const port = Number(process.env.PORT ?? process.env.TASK_PORT ?? 4002);

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`task-service listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start task-service', error);
    process.exit(1);
  });
