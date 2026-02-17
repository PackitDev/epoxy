import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../../../src/middleware/auth';

// Replace with your actual user creation logic
async function createUser(_email: string, _hashedPassword: string) {
  // TODO: Replace with database insert
  return { id: 'new-user-id', email: _email } as any;
}

export async function POST(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await createUser(email, hashedPassword);

  const token = generateToken({ id: user.id, email: user.email });
  res.status(201).json({ token, user: { id: user.id, email: user.email } });
}
