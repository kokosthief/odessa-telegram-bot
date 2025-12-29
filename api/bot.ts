import { VercelRequest, VercelResponse } from '@vercel/node';
import { OdessaTodayGenerator } from '../src/index';
import { WeeklyScheduleGenerator } from '../src/weekly-schedule-generator';
import { GroupTracker } from '../src/utils/group-tracker';
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
    
    // Track groups/channels when bot receives messages
    if (update.message) {
      const { text, chat, from } = update.message;
      
      // Automatically track group chats and channels
      const groupTracker = new GroupTracker();
      if (groupTracker.isGroupOrChannel(chat.id)) {
        groupTracker.addGroup(chat.id);
      }
      
      // Handle commands with full formatting
      if (text === '/start') {
        const welcomeMessage = `🤖 <b>Welcome to the Odessa Schedule Bot!</b>

I can help you check who's playing today at Odessa boat events in Amsterdam.

<b>Available commands:</b>
• /whosplaying - Check who is facilitating today
• /schedule - View this week's schedule
• /help - Show this help message

Just send /whosplaying to get started! 🌴🎶`;
        
        await sendTelegramMessage(chat.id, welcomeMessage);
      } else if (text === '/help') {
        const helpMessage = `🤖 <b>Odessa Schedule Bot Help</b>

<b>Commands:</b>
• /whosplaying - Check who is facilitating today
• /schedule - View the week's schedule
• /help - Show this help message`;
        
        await sendTelegramMessage(chat.id, helpMessage);
      } else if (text === '/whosplaying') {
        try {
          console.log('🎭 /whosplaying command received - generating enhanced schedule...');
          
          // Generate enhanced today's schedule with Wix DJ data
          const generator = new OdessaTodayGenerator();
          const todaySchedule = await generator.generateEnhancedTodaySchedule();
          
          console.log(`📋 Enhanced schedule generated:`);
          console.log(`   Text length: ${todaySchedule.text.length} characters`);
          console.log(`   Photos: ${todaySchedule.photos ? todaySchedule.photos.length : 0} photos`);
          console.log(`   Messages: ${todaySchedule.messages ? todaySchedule.messages.length : 0} messages`);
          console.log(`   Keyboard: ${todaySchedule.keyboard ? 'Available' : 'Not available'}`);
          
          // Handle multiple messages for multiple DJs
          if (todaySchedule.messages && todaySchedule.messages.length > 0) {
            console.log('📤 Sending multiple messages for multiple DJs');
            
            // Send intro message first
            await sendTelegramMessage(chat.id, todaySchedule.text);
            
            // Send separate message for each DJ with their photo
            for (const message of todaySchedule.messages) {
              console.log(`📤 Sending message: ${message.text.substring(0, 50)}...`);
              
              if (message.photo) {
                console.log(`📸 Sending with photo: ${message.photo}`);
                await sendTelegramMessageWithPhoto(chat.id, message.text, message.photo, message.keyboard);
              } else {
                console.log(`📝 Sending without photo`);
                await sendTelegramMessageWithKeyboard(chat.id, message.text, message.keyboard);
              }
            }
          } else {
            console.log('📤 Using single message logic');
            
            // Send the schedule with photos if available (original logic)
            if (todaySchedule.photos && todaySchedule.photos.length > 0) {
              console.log('📸 Sending schedule with photos...');
              await sendTelegramMessageWithPhotos(chat.id, todaySchedule.text, todaySchedule.photos, todaySchedule.keyboard);
            } else if (todaySchedule.keyboard) {
              console.log('⌨️ Sending schedule with keyboard...');
              await sendTelegramMessageWithKeyboard(chat.id, todaySchedule.text, todaySchedule.keyboard);
            } else {
              console.log('📝 Sending plain text schedule...');
              await sendTelegramMessage(chat.id, todaySchedule.text);
            }
          }
          
        } catch (error) {
          console.error('Error generating enhanced today schedule:', error);
          const errorMessage = `❌ <b>Error fetching today's schedule</b>

Sorry, I couldn't fetch today's schedule. Please try again later.

If this problem persists, contact the bot administrator.`;
          await sendTelegramMessage(chat.id, errorMessage);
        }
      } else if (text === '/schedule') {
        try {
          console.log('📅 /schedule command received - generating weekly schedule...');
          
          // Generate weekly schedule
          const weeklyGenerator = new WeeklyScheduleGenerator();
          const weeklySchedule = await weeklyGenerator.generateWeeklySchedule();
          
          console.log(`📋 Weekly schedule generated:`);
          console.log(`   Text length: ${weeklySchedule.text.length} characters`);
          console.log(`   Video: ${weeklySchedule.video}`);
          console.log(`   Keyboard: ${weeklySchedule.keyboard ? 'Available' : 'Not available'}`);
          
          // Send video with schedule
          await sendTelegramMessageWithVideo(chat.id, weeklySchedule.text, weeklySchedule.video, weeklySchedule.keyboard);
          
        } catch (error) {
          console.error('Error generating weekly schedule:', error);
          const errorMessage = `❌ <b>Error fetching weekly schedule</b>

Sorry, I couldn't fetch the weekly schedule. Please try again later.

If this problem persists, contact the bot administrator.`;
          await sendTelegramMessage(chat.id, errorMessage);
        }
      }
      // Only respond to specific commands - ignore all other messages
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

async function sendTelegramMessageWithPhoto(chatId: number, caption: string, photo: string, replyMarkup?: any) {
  const { TELEGRAM_BOT_TOKEN } = process.env;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photo,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram photo:', await response.text());
      // Fallback to text message
      await sendTelegramMessageWithKeyboard(chatId, caption, replyMarkup);
    }
    
  } catch (error) {
    console.error('Error sending Telegram photo:', error);
    // Fallback to text message
    await sendTelegramMessageWithKeyboard(chatId, caption, replyMarkup);
  }
}

async function sendTelegramMessageWithPhotos(chatId: number, caption: string, photos: string[], replyMarkup?: any) {
  const { TELEGRAM_BOT_TOKEN } = process.env;
  
  try {
    // Send the first photo with caption and keyboard
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photos[0],
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram photo:', await response.text());
      // Fallback to text message
      await sendTelegramMessageWithKeyboard(chatId, caption, replyMarkup);
    }
    
  } catch (error) {
    console.error('Error sending Telegram photo:', error);
    // Fallback to text message
    await sendTelegramMessageWithKeyboard(chatId, caption, replyMarkup);
  }
}

async function sendTelegramMessageWithVideo(chatId: number, caption: string, video: string, replyMarkup?: any) {
  const { TELEGRAM_BOT_TOKEN } = process.env;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        video: video,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram video:', await response.text());
      // Fallback to text message
      await sendTelegramMessageWithKeyboard(chatId, caption, replyMarkup);
    }
    
  } catch (error) {
    console.error('Error sending Telegram video:', error);
    // Fallback to text message
    await sendTelegramMessageWithKeyboard(chatId, caption, replyMarkup);
  }
} 