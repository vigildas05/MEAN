import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret';
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/project_platform';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function signToken(user: { _id: unknown; email: string; role: string }) {
  return jwt.sign({ sub: String(user._id), email: user.email, role: user.role }, jwtSecret, {
    expiresIn: '8h'
  });
}

app.get('/health', (_req, res) => {
  res.json({ service: 'auth-service', status: 'ok' });
});

app.post('/auth/register', async (req, res) => {
  const input = registerSchema.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ message: 'Invalid registration payload', issues: input.error.issues });
    return;
  }

  const existing = await User.findOne({ email: input.data.email });
  if (existing) {
    res.status(409).json({ message: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(input.data.password, 12);
  const user = await User.create({ ...input.data, passwordHash });
  const token = signToken(user);

  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

app.post('/auth/login', async (req, res) => {
  const input = loginSchema.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ message: 'Invalid login payload' });
    return;
  }

  const user = await User.findOne({ email: input.data.email });
  const valid = user ? await bcrypt.compare(input.data.password, user.passwordHash) : false;
  if (!user || !valid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  res.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

const port = Number(process.env.PORT ?? process.env.AUTH_PORT ?? 4001);

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`auth-service listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start auth-service', error);
    process.exit(1);
  });
