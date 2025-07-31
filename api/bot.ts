import { VercelRequest, VercelResponse } from '@vercel/node';

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

    // Handle Telegram webhook updates
    const update = req.body;
    
    if (update.message) {
      const { text, chat, from } = update.message;
      
      // Simple response for now - we'll enhance this later
      if (text === '/start') {
        await sendTelegramMessage(chat.id, '🤖 Welcome to the Odessa Schedule Bot!\n\nSend /schedule to get the current week\'s schedule.');
      } else if (text === '/help') {
        await sendTelegramMessage(chat.id, '🤖 Available commands:\n• /schedule - Get the current week\'s schedule\n• /help - Show this help message');
      } else if (text === '/schedule') {
        await sendTelegramMessage(chat.id, '🪩 Schedule 🌴🎶\n\n🗓️ Wed: ED W/ Jethro\n🗓️ Thu: ED W/ Samaya\n🗓️ Fri: Cacao ED + Live Music W/ Inphiknight\n🗓️ Sat: ED W/ Samaya\n🗓️ Sun: Morning ED W/ Henners\n\n[TICKETS BUTTON]');
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  const { TELEGRAM_BOT_TOKEN } = process.env;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
} 