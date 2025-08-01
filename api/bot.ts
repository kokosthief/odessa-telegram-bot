import { VercelRequest, VercelResponse } from '@vercel/node';
import { OdessaScheduleGenerator } from '../src/index';
import fs from 'fs';
import path from 'path';

// Store the video file_id for reuse
let videoFileId: string | null = null;

// Function to manually set the video file_id (for admin use)
function setVideoFileId(fileId: string) {
  videoFileId = fileId;
  console.log('Manually set video file_id:', fileId);
}

// Function to extract file_id from a message (for admin use)
function extractVideoFileId(message: any): string | null {
  if (message && message.video && message.video.file_id) {
    return message.video.file_id;
  }
  return null;
}

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

<b>Usage:</b>
• In DMs: Just send /schedule
• In groups: Send /schedule@Odessa_Schedule_Bot

Just send /schedule to get started! 🌴🎶`;
        
        await sendTelegramMessage(chat.id, welcomeMessage);
      } else if (text === '/help') {
        const helpMessage = `🤖 <b>Odessa Schedule Bot Help</b>

<b>Commands:</b>
• /schedule - Get the current week's schedule with DJ information and ticket links
• /help - Show this help message
• /getfileid - (Admin) Store video file_id for faster uploads

<b>Usage:</b>
• In DMs: Just send /schedule
• In groups: Send /schedule@Odessa_Schedule_Bot

<b>Features:</b>
• Real-time schedule generation from Hipsy.no
• DJ information with social media links
• Direct ticket booking links
• Works in groups and direct messages
• Optimized video uploads using cached file_id

<b>Rate Limiting:</b>
• You can request a schedule once every 60 seconds to prevent spam

Need help? Contact the bot administrator.`;
        
        await sendTelegramMessage(chat.id, helpMessage);
      } else if (text === '/schedule' || text.startsWith('/schedule@')) {
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
      } else if (text === '/getfileid' || text.startsWith('/getfileid@')) {
        // Admin command to get file_id from a video message
        // Reply to a video message with this command to get its file_id
        if (update.message && update.message.reply_to_message && update.message.reply_to_message.video) {
          const fileId = extractVideoFileId(update.message.reply_to_message);
          if (fileId) {
            setVideoFileId(fileId);
            await sendTelegramMessage(chat.id, `✅ <b>Video file_id stored!</b>\n\nFile ID: <code>${fileId}</code>\n\nFuture schedule messages will use this cached video.`);
          } else {
            await sendTelegramMessage(chat.id, `❌ <b>No video found</b>\n\nPlease reply to a video message with this command.`);
          }
        } else {
          await sendTelegramMessage(chat.id, `📋 <b>How to get file_id:</b>\n\n1. Send a video to this chat\n2. Reply to that video with /getfileid\n3. The bot will store the file_id for future use\n\nThis makes future schedule messages much faster!`);
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
    // If we have a stored file_id, use it (much faster)
    if (videoFileId) {
      console.log('Using cached file_id for video upload');
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          video: videoFileId,
          caption: caption,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });

      if (response.ok) {
        console.log('Successfully sent video using cached file_id');
        return;
      } else {
        console.log('Cached file_id failed, falling back to file upload');
        // If file_id fails, clear it and fall back to file upload
        videoFileId = null;
      }
    }
    
    // First time or fallback: Upload the video file
    console.log('Uploading video file to Telegram');
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

    if (response.ok) {
      const result = await response.json();
      // Store the file_id for future use
      if (result.ok && result.result.video && result.result.video.file_id) {
        videoFileId = result.result.video.file_id;
        console.log('Stored video file_id for future use:', videoFileId);
      }
    } else {
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