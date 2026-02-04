import { VercelRequest, VercelResponse } from '@vercel/node';
import { OdessaTodayGenerator } from '../src/index';
import { WeeklyScheduleGenerator } from '../src/weekly-schedule-generator';
import { GroupTracker } from '../src/utils/group-tracker';
import { DJLoader } from '../src/utils/dj-loader';
import { WixDJLoader } from '../src/utils/wix-dj-loader';
import { utcToZonedTime } from 'date-fns-tz';
import fs from 'fs';
import path from 'path';

// Odessa boat coordinates (NDSM Wharf)
const ODESSA_LATITUDE = 52.4012;
const ODESSA_LONGITUDE = 4.8917;
const AMSTERDAM_TIMEZONE = 'Europe/Amsterdam';

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
      } else if (text === '/next') {
        try {
          const generator = new OdessaTodayGenerator();
          const nextEvent = await generator.findNextUpcomingEvent();

          if (!nextEvent) {
            await sendTelegramMessage(chat.id, '🚢 No upcoming events found. Check back later!');
            return res.status(200).json({ ok: true });
          }

          const eventDate = new Date(nextEvent.date);
          const eventDateInAmsterdam = utcToZonedTime(eventDate, AMSTERDAM_TIMEZONE);
          const nowInAmsterdam = utcToZonedTime(new Date(), AMSTERDAM_TIMEZONE);

          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const dayName = dayNames[eventDateInAmsterdam.getDay()];
          const monthName = monthNames[eventDateInAmsterdam.getMonth()];
          const dayNum = eventDateInAmsterdam.getDate();
          const hours = eventDateInAmsterdam.getHours().toString().padStart(2, '0');
          const minutes = eventDateInAmsterdam.getMinutes().toString().padStart(2, '0');

          const diffMs = eventDateInAmsterdam.getTime() - nowInAmsterdam.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

          let relativeTime = '';
          if (diffDays > 0) {
            relativeTime = `In ${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
          } else if (diffHours > 0) {
            relativeTime = `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
          } else {
            relativeTime = 'Starting soon!';
          }

          const wixDJLoader = new WixDJLoader();
          const djInfo = nextEvent.djName ? await wixDJLoader.getDJInfoWithFallback(nextEvent.djName) : null;

          const messageText = `🚀 <b>Next up on Odessa:</b>

🗓️ ${dayName}, ${monthName} ${dayNum} at ${hours}:${minutes}
🎶 ${nextEvent.title}
⏰ ${relativeTime}`;

          const buttons: Array<{ text: string; url: string }> = [];
          if (nextEvent.ticketUrl) {
            buttons.push({ text: '🎫 TICKETS', url: nextEvent.ticketUrl });
          }
          if (djInfo?.soundcloudUrl) {
            buttons.push({ text: '🎧 LISTEN', url: djInfo.soundcloudUrl });
          }

          const keyboard = buttons.length > 0 ? { inline_keyboard: [buttons] } : undefined;

          if (djInfo?.photo) {
            await sendTelegramMessageWithPhoto(chat.id, messageText, djInfo.photo, keyboard);
          } else if (keyboard) {
            await sendTelegramMessageWithKeyboard(chat.id, messageText, keyboard);
          } else {
            await sendTelegramMessage(chat.id, messageText);
          }

        } catch (error) {
          console.error('Error handling /next:', error);
          await sendTelegramMessage(chat.id, '❌ Sorry, I couldn\'t fetch the next event. Please try again later.');
        }
      } else if (text === '/countdown') {
        try {
          const generator = new OdessaTodayGenerator();
          const nextEvent = await generator.findNextUpcomingEvent();

          if (!nextEvent) {
            await sendTelegramMessage(chat.id, '🚢 No upcoming events found. Check back later!');
            return res.status(200).json({ ok: true });
          }

          const eventDate = new Date(nextEvent.date);
          const eventDateInAmsterdam = utcToZonedTime(eventDate, AMSTERDAM_TIMEZONE);
          const nowInAmsterdam = utcToZonedTime(new Date(), AMSTERDAM_TIMEZONE);

          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const dayName = dayNames[eventDateInAmsterdam.getDay()];
          const monthName = monthNames[eventDateInAmsterdam.getMonth()];
          const dayNum = eventDateInAmsterdam.getDate();
          const hours = eventDateInAmsterdam.getHours().toString().padStart(2, '0');
          const minutes = eventDateInAmsterdam.getMinutes().toString().padStart(2, '0');

          const diffMs = eventDateInAmsterdam.getTime() - nowInAmsterdam.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

          let countdown = '';
          if (diffDays > 0) {
            countdown = `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours !== 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
          } else if (diffHours > 0) {
            countdown = `${diffHours} hour${diffHours !== 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
          } else if (diffMinutes > 0) {
            countdown = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
          } else {
            countdown = 'Starting now!';
          }

          const eventType = nextEvent.title.split(' with ')[0] || nextEvent.title;

          const messageText = `⏱️ <b>Countdown to ${eventType}</b>

🎶 DJ: ${nextEvent.djName || 'TBA'}
📅 ${dayName}, ${monthName} ${dayNum} at ${hours}:${minutes}

⏳ <b>${countdown}</b>

The boat is calling! 🚢`;

          const buttons: Array<{ text: string; url: string }> = [];
          if (nextEvent.ticketUrl) {
            buttons.push({ text: '🎫 TICKETS', url: nextEvent.ticketUrl });
          }

          const keyboard = buttons.length > 0 ? { inline_keyboard: [buttons] } : undefined;

          if (keyboard) {
            await sendTelegramMessageWithKeyboard(chat.id, messageText, keyboard);
          } else {
            await sendTelegramMessage(chat.id, messageText);
          }

        } catch (error) {
          console.error('Error handling /countdown:', error);
          await sendTelegramMessage(chat.id, '❌ Sorry, I couldn\'t fetch the countdown. Please try again later.');
        }
      } else if (text?.startsWith('/dj')) {
        try {
          const djName = text.replace('/dj', '').trim();
          const djLoader = new DJLoader();
          const wixDJLoader = new WixDJLoader();

          if (!djName) {
            const allDJs = djLoader.getAllDJNames();
            const djList = allDJs.sort().map(name => `• ${name}`).join('\n');

            const messageText = `🎧 <b>Odessa DJs</b>

Choose a DJ to learn more:

${djList}

<i>Usage: /dj Samaya</i>`;

            await sendTelegramMessage(chat.id, messageText);
            return res.status(200).json({ ok: true });
          }

          const djInfo = await wixDJLoader.getDJInfoWithFallback(djName);

          if (!djInfo) {
            await sendTelegramMessage(chat.id, `❌ DJ "${djName}" not found. Try /dj to see all available DJs.`);
            return res.status(200).json({ ok: true });
          }

          let messageText = `🎧 <b>${djInfo.name.toUpperCase()}</b>`;

          if (djInfo.shortDescription) {
            messageText += `\n\n"${djInfo.shortDescription}"`;
          }

          const links: string[] = [];
          if (djInfo.soundcloudUrl) {
            links.push(`🔗 <a href="${djInfo.soundcloudUrl}">SoundCloud</a>`);
          }
          if (djInfo.instagramUrl) {
            links.push(`📸 <a href="${djInfo.instagramUrl}">Instagram</a>`);
          }
          if (djInfo.website) {
            links.push(`🌐 <a href="${djInfo.website}">Website</a>`);
          }

          if (links.length > 0) {
            messageText += '\n\n' + links.join('\n');
          }

          const buttons: Array<{ text: string; url: string }> = [];
          if (djInfo.soundcloudUrl) {
            buttons.push({ text: '🎧 LISTEN ON SOUNDCLOUD', url: djInfo.soundcloudUrl });
          }

          const keyboard = buttons.length > 0 ? { inline_keyboard: [buttons] } : undefined;

          if (djInfo.photo) {
            await sendTelegramMessageWithPhoto(chat.id, messageText, djInfo.photo, keyboard);
          } else if (keyboard) {
            await sendTelegramMessageWithKeyboard(chat.id, messageText, keyboard);
          } else {
            await sendTelegramMessage(chat.id, messageText);
          }

        } catch (error) {
          console.error('Error handling /dj:', error);
          await sendTelegramMessage(chat.id, '❌ Sorry, I couldn\'t fetch DJ info. Please try again later.');
        }
      } else if (text === '/discover') {
        try {
          const djLoader = new DJLoader();
          const wixDJLoader = new WixDJLoader();
          const randomDJ = djLoader.getRandomDJ();

          if (!randomDJ) {
            await sendTelegramMessage(chat.id, '❌ No DJs found in the database.');
            return res.status(200).json({ ok: true });
          }

          const djInfo = await wixDJLoader.getDJInfoWithFallback(randomDJ.name);

          let messageText = `🎲 <b>Discover a DJ</b>

✨ <b>${(djInfo?.name || randomDJ.name).toUpperCase()}</b> ✨`;

          if (djInfo?.shortDescription) {
            messageText += `\n\n"${djInfo.shortDescription}"`;
          }

          messageText += '\n\nGive them a listen before the next event!';

          const buttons: Array<{ text: string; url: string }> = [];
          const soundcloudUrl = djInfo?.soundcloudUrl || randomDJ.link;
          if (soundcloudUrl) {
            buttons.push({ text: '🎧 LISTEN ON SOUNDCLOUD', url: soundcloudUrl });
          }

          const keyboard = buttons.length > 0 ? { inline_keyboard: [buttons] } : undefined;

          if (djInfo?.photo) {
            await sendTelegramMessageWithPhoto(chat.id, messageText, djInfo.photo, keyboard);
          } else if (keyboard) {
            await sendTelegramMessageWithKeyboard(chat.id, messageText, keyboard);
          } else {
            await sendTelegramMessage(chat.id, messageText);
          }

        } catch (error) {
          console.error('Error handling /discover:', error);
          await sendTelegramMessage(chat.id, '❌ Sorry, I couldn\'t fetch a random DJ. Please try again later.');
        }
      } else if (text === '/venue') {
        const messageText = `🚢 <b>ODESSA - The Boat</b>

📍 NDSM Wharf, Amsterdam
🗺️ Coordinates: ${ODESSA_LATITUDE}° N, ${ODESSA_LONGITUDE}° E

🚌 <b>Getting there:</b>
• Ferry 901/907 from Centraal (free!)
• Bus 38 to NDSM Werf
• Bike parking available

📝 <b>Good to know:</b>
• Barefoot dancing space
• Phone-free environment
• Bring water bottle
• Dress comfortably

🌐 hipsy.nl/odessa-amsterdam-ecstatic-dance`;

        const keyboard = {
          inline_keyboard: [
            [
              { text: '📍 GOOGLE MAPS', url: `https://maps.google.com/?q=${ODESSA_LATITUDE},${ODESSA_LONGITUDE}` },
              { text: '🎫 TICKETS', url: 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance' }
            ]
          ]
        };

        await sendTelegramMessageWithKeyboard(chat.id, messageText, keyboard);
      } else if (text === '/types') {
        const messageText = `🎭 <b>Event Types at Odessa</b>

🌅 <b>Ecstatic Dance (ED)</b>
Free-form dancing to a DJ-guided journey.
Sunday mornings are "Morning ED"!

🍫 <b>Cacao Ecstatic Dance</b>
Heart-opening cacao ceremony followed
by ecstatic dance.

🌈 <b>Queerstatic</b>
LGBTQ+ inclusive dance celebration.

🎵 <b>Live Music</b>
Live musicians creating the sonic journey.

🌌 <b>Journey</b>
Deeper, longer explorations of sound
and movement.

━━━━━━━━━━━━━━━━━━━━━
All events are sober, barefoot,
and phone-free spaces. 🙏`;

        await sendTelegramMessage(chat.id, messageText);
      } else if (text === '/location') {
        try {
          await sendTelegramLocation(chat.id, ODESSA_LATITUDE, ODESSA_LONGITUDE);

          const messageText = `📍 <b>Odessa Location</b>

🚢 NDSM Wharf, Amsterdam

Open in Google Maps:
https://maps.google.com/?q=${ODESSA_LATITUDE},${ODESSA_LONGITUDE}`;

          await sendTelegramMessage(chat.id, messageText);

        } catch (error) {
          console.error('Error handling /location:', error);
          await sendTelegramMessage(chat.id, '❌ Sorry, I couldn\'t send the location. Please try again.');
        }
      } else if (text === '/commands') {
        const messageText = `🤖 <b>Available Commands</b>

<b>Events & Schedule:</b>
• /whosplaying - Who's facilitating today
• /schedule - This week's schedule
• /next - Next upcoming event
• /countdown - Countdown to next event

<b>DJ Info:</b>
• /dj [name] - DJ profile lookup
• /discover - Discover a random DJ

<b>Venue & Info:</b>
• /venue - Boat location & practical info
• /location - Get map pin
• /types - Event types explained

<b>Help:</b>
• /start - Welcome message
• /help - Quick help
• /commands - This list`;

        await sendTelegramMessage(chat.id, messageText);
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

async function sendTelegramLocation(chatId: number, latitude: number, longitude: number) {
  const { TELEGRAM_BOT_TOKEN } = process.env;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendLocation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        latitude: latitude,
        longitude: longitude
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram location:', await response.text());
    }

  } catch (error) {
    console.error('Error sending Telegram location:', error);
  }
} 