import { Request, Response } from 'express';
import { createCheckoutSession } from '../../../src/stripe';

export async function POST(req: Request, res: Response) {
  const { priceId } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'priceId is required' });
  }

  try {
    const session = await createCheckoutSession(
      priceId,
      `${req.headers.origin}/success`,
      `${req.headers.origin}/cancel`
    );
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
