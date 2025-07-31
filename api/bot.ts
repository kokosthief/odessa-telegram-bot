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
      
      // Handle commands with full formatting
      if (text === '/start') {
        const welcomeMessage = `🤖 <b>Welcome to the Odessa Schedule Bot!</b>

I can help you get the latest schedule for Odessa boat events in Amsterdam.

<b>Available commands:</b>
• /schedule - Get the current week's schedule
• /help - Show this help message

Just send /schedule to get started! 🌴🎶`;
        
        await sendTelegramMessage(chat.id, welcomeMessage);
      } else if (text === '/help') {
        const helpMessage = `🤖 <b>Odessa Schedule Bot Help</b>

<b>Commands:</b>
• /schedule - Get the current week's schedule with DJ information and ticket links
• /help - Show this help message

<b>Features:</b>
• Real-time schedule generation from Hipsy.no
• DJ information with social media links
• Direct ticket booking links
• Works in groups and direct messages

<b>Rate Limiting:</b>
• You can request a schedule once every 60 seconds to prevent spam

Need help? Contact the bot administrator.`;
        
        await sendTelegramMessage(chat.id, helpMessage);
      } else if (text === '/schedule') {
        // Generate full schedule with intro text and inline keyboard
        const scheduleMessage = `🪩 <b>Schedule 🌴🎶</b>

Amsterdam's buzzing as the Summer Festival hits this weekend—last tickets available, so snag yours quick!  

We're spinning vibrant melodies and free-spirited dance flows all week, with this Sunday morning session now a Sunday evening groove starting at 7pm!

Jump into the city's rhythm and make this week epic!

🗓️ <b>Wed:</b> ED W/ <a href="https://soundcloud.com/jethro">Jethro</a>
🗓️ <b>Thu:</b> ED W/ <a href="https://soundcloud.com/samaya">Samaya</a>
🗓️ <b>Fri:</b> Cacao ED + Live Music W/ <a href="https://soundcloud.com/inphiknight">Inphiknight</a>
🗓️ <b>Sat:</b> ED W/ <a href="https://soundcloud.com/samaya">Samaya</a>
🗓️ <b>Sun:</b> Morning ED W/ <a href="https://soundcloud.com/henners">Henners</a>`;
        
        // Create inline keyboard with tickets button
        const inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: 'TICKETS 🎟️',
                url: 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance'
              }
            ]
          ]
        };
        
        await sendTelegramMessageWithKeyboard(chat.id, scheduleMessage, inlineKeyboard);
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
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

async function sendTelegramMessageWithKeyboard(chatId: number, text: string, replyMarkup: any) {
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
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: replyMarkup
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message with keyboard:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message with keyboard:', error);
  }
} 