import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ 
    message: 'Odessa Telegram Bot is working!',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
} 