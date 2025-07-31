import { VercelRequest, VercelResponse } from '@vercel/node';
import { OdessaScheduleGenerator } from '../src/index';
import fs from 'fs';
import path from 'path';

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
        try {
          // Generate real schedule from Hipsy data
          const generator = new OdessaScheduleGenerator();
          const scheduleMessage = await generator.generateSchedule();
          
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
          
          // Send video with schedule message
          await sendTelegramVideoWithCaption(chat.id, scheduleMessage, inlineKeyboard);
        } catch (error) {
          console.error('Error generating schedule:', error);
          const errorMessage = `❌ <b>Error generating schedule</b>

Sorry, I couldn't fetch the current schedule. Please try again later.

If this problem persists, contact the bot administrator.`;
          await sendTelegramMessage(chat.id, errorMessage);
        }
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

async function sendTelegramVideoWithCaption(chatId: number, caption: string, replyMarkup: any) {
  const { TELEGRAM_BOT_TOKEN } = process.env;
  
  try {
    // Read the video file from the project directory
    const videoPath = path.join(process.cwd(), 'Odessa Hero.mp4');
    
    if (!fs.existsSync(videoPath)) {
      console.error('Video file not found:', videoPath);
      // Fallback to text message if video not found
      await sendTelegramMessageWithKeyboard(chatId, caption, replyMarkup);
      return;
    }
    
    const videoBuffer = fs.readFileSync(videoPath);
    
    // Create form data for video upload
    const formData = new FormData();
    const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
    formData.append('video', videoBlob, 'Odessa Hero.mp4');
    formData.append('chat_id', chatId.toString());
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
    formData.append('reply_markup', JSON.stringify(replyMarkup));
    
    // Upload video to Telegram
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      console.error('Failed to send video:', await response.text());
      // Fallback to text message if video fails
      await sendTelegramMessageWithKeyboard(chatId, caption, replyMarkup);
    }
    
  } catch (error) {
    console.error('Error sending Telegram video:', error);
    // Fallback to text message if video fails
    await sendTelegramMessageWithKeyboard(chatId, caption, replyMarkup);
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