const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const taskStatuses = ['todo', 'in-progress', 'review', 'done'];

async function connectDb() {
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(uri);
}

function model(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

const User = model(
  'User',
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ['admin', 'member'], default: 'member' }
    },
    { timestamps: true }
  )
);

const Profile = model(
  'Profile',
  new mongoose.Schema(
    {
      authUserId: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      role: { type: String, enum: ['admin', 'member'], default: 'member' },
      avatarUrl: { type: String }
    },
    { timestamps: true }
  )
);

const Project = model(
  'Project',
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      description: { type: String, default: '' },
      ownerId: { type: String, required: true },
      memberIds: [{ type: String }]
    },
    { timestamps: true }
  )
);

const commentSchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true },
    body: { type: String, required: true }
  },
  { timestamps: true }
);

const Task = model(
  'Task',
  new mongoose.Schema(
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
      title: { type: String, required: true },
      description: { type: String, default: '' },
      status: { type: String, enum: taskStatuses, default: 'todo' },
      assigneeId: { type: String },
      priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      dueDate: { type: Date },
      comments: [commentSchema]
    },
    { timestamps: true }
  )
);

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function signToken(user) {
  return jwt.sign({ sub: String(user._id), email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '8h'
  });
}

function requireAuth(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    json(res, 401, { message: 'Missing bearer token' });
    return undefined;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    return { id: decoded.sub, email: decoded.email, role: decoded.role };
  } catch {
    json(res, 401, { message: 'Invalid token' });
    return undefined;
  }
}

module.exports = {
  bcrypt,
  connectDb,
  json,
  Profile,
  Project,
  requireAuth,
  signToken,
  Task,
  taskStatuses,
  User
};
