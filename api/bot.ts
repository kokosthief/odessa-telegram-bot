import { VercelRequest, VercelResponse } from '@vercel/node';
import { OdessaTelegramBot } from '../src/telegram/bot';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing environment variables');
      return res.status(500).json({ error: 'Bot not configured' });
    }

    // Create bot instance
    const bot = new OdessaTelegramBot(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID);

    // Handle Telegram webhook updates
    const update = req.body;
    
    if (update.message) {
      const { text, chat, from } = update.message;
      
      // Handle commands
      if (text === '/start') {
        await bot.handleStartCommand(update.message);
      } else if (text === '/help') {
        await bot.handleHelpCommand(update.message);
      } else if (text === '/schedule') {
        await bot.handleScheduleCommand(update.message);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 