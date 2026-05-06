import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';
import { z } from 'zod';

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

const profileSchema = new Schema(
  {
    authUserId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    avatarUrl: { type: String }
  },
  { timestamps: true }
);

const Profile = mongoose.model('Profile', profileSchema);

app.get('/health', (_req, res) => {
  res.json({ service: 'user-service', status: 'ok' });
});

app.use(requireAuth);

app.get('/users/me', async (req: AuthRequest, res) => {
  const profile = await Profile.findOne({ authUserId: req.user!.id });
  res.json(profile ?? { authUserId: req.user!.id, email: req.user!.email, role: req.user!.role });
});

app.put('/users/me', async (req: AuthRequest, res) => {
  const input = z
    .object({
      name: z.string().min(2),
      avatarUrl: z.string().url().optional().or(z.literal(''))
    })
    .safeParse(req.body);

  if (!input.success) {
    res.status(400).json({ message: 'Invalid profile payload', issues: input.error.issues });
    return;
  }

  const profile = await Profile.findOneAndUpdate(
    { authUserId: req.user!.id },
    {
      authUserId: req.user!.id,
      email: req.user!.email,
      role: req.user!.role,
      ...input.data
    },
    { new: true, upsert: true }
  );
  res.json(profile);
});

app.get('/users', async (_req, res) => {
  const users = await Profile.find().sort({ name: 1 });
  res.json(users);
});

const port = Number(process.env.PORT ?? process.env.USER_PORT ?? 4003);

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`user-service listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start user-service', error);
    process.exit(1);
  });
