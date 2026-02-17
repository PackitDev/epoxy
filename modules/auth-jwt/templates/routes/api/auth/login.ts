import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../../../src/middleware/auth';

// Replace with your actual user lookup
async function findUserByEmail(_email: string) {
  // TODO: Replace with database query
  return null as any;
}

export async function POST(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken({ id: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email } });
}
