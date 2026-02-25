import { VercelRequest, VercelResponse } from '@vercel/node';
import { OdessaTodayGenerator } from '../src/index';
import { WeeklyScheduleGenerator } from '../src/weekly-schedule-generator';
import { GroupTracker } from '../src/utils/group-tracker';
import { DJLoader } from '../src/utils/dj-loader';
import { utcToZonedTime } from 'date-fns-tz';

// Odessa boat coordinates (Veemkade 259, 1019 CZ Amsterdam)
const ODESSA_LATITUDE = 52.374501;
const ODESSA_LONGITUDE = 4.937627;
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
      const { text, chat } = update.message;

      // Normalize command: strip @BotUsername suffix (group chats send /cmd@BotName)
      const command = text?.split('@')[0];
      
      // Automatically track group chats and channels
      const groupTracker = new GroupTracker();
      if (groupTracker.isGroupOrChannel(chat.id)) {
        groupTracker.addGroup(chat.id);
      }
      
      // Handle commands with full formatting
      if (command === '/whosplaying') {
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
      } else if (command === '/schedule') {
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
      } else if (command === '/next') {
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

          // Get DJ info from local database
          const djLoader = new DJLoader();
          const djInfo = nextEvent.djName ? djLoader.getDJInfo(nextEvent.djName) : null;

          const messageText = `🚀 <b>Next up at Odessa:</b>

🗓️ ${dayName}, ${monthName} ${dayNum} at ${hours}:${minutes}

🎶 ${nextEvent.title}

⏰ ${relativeTime}`;

          // Build button rows
          const buttons: Array<{ text: string; url: string }> = [];
          if (nextEvent.ticketUrl) {
            buttons.push({ text: '🎫 TICKETS', url: nextEvent.ticketUrl });
          }
          const soundcloudUrl = djInfo?.soundcloud || djInfo?.link;
          if (soundcloudUrl) {
            buttons.push({ text: '🎧 LISTEN', url: soundcloudUrl });
          }
          if (djInfo?.instagram) {
            buttons.push({ text: '📸 INSTAGRAM', url: djInfo.instagram });
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
      } else if (command?.startsWith('/dj')) {
        try {
          const djName = (command || '').replace('/dj', '').trim();
          const djLoader = new DJLoader();

          if (!djName) {
            const allDJs = djLoader.getAllDJNames();
            // Filter out duplicates like Ma-rifa (keep Ma'rifa)
            const uniqueDJs = allDJs.filter((name: string) => name !== 'Ma-rifa' && name !== 'Faralduin');
            const djList = uniqueDJs.sort().map((name: string) => `• ${name}`).join('\n');

            const messageText = `🎧 <b>Odessa DJs</b>

Choose a DJ to learn more:

${djList}

<i>Usage: /dj Samaya</i>`;

            await sendTelegramMessage(chat.id, messageText);
            return res.status(200).json({ ok: true });
          }

          const djInfo = djLoader.getDJInfo(djName);

          if (!djInfo) {
            await sendTelegramMessage(chat.id, `❌ DJ "${djName}" not found. Try /dj to see all available DJs.`);
            return res.status(200).json({ ok: true });
          }

          // Find the actual DJ name (for display)
          const matchedName = djLoader.getAllDJNames().find((n: string) =>
            n.toLowerCase() === djName.toLowerCase() ||
            n.toLowerCase().includes(djName.toLowerCase())
          ) || djName;

          let messageText = `🎧 <b>${matchedName.toUpperCase()}</b>`;

          if (djInfo.shortDescription) {
            messageText += `\n\n<blockquote>${djInfo.shortDescription}</blockquote>`;
          }

          // Build button row
          const soundcloudUrl = djInfo.soundcloud || djInfo.link;
          const buttons: Array<{ text: string; url: string }> = [];
          if (soundcloudUrl) {
            buttons.push({ text: '🎧 SOUNDCLOUD', url: soundcloudUrl });
          }
          if (djInfo.instagram) {
            buttons.push({ text: '📸 INSTAGRAM', url: djInfo.instagram });
          }
          if (djInfo.website) {
            buttons.push({ text: '🌐 WEBSITE', url: djInfo.website });
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
      } else if (command === '/discover') {
        try {
          const djLoader = new DJLoader();

          // Get all DJs and filter out duplicates
          const allDJs = djLoader.getAllDJNames().filter((name: string) => name !== 'Ma-rifa' && name !== 'Faralduin');
          if (allDJs.length === 0) {
            await sendTelegramMessage(chat.id, '❌ No DJs found in the database.');
            return res.status(200).json({ ok: true });
          }

          // Pick a random DJ
          const randomIndex = Math.floor(Math.random() * allDJs.length);
          const djName = allDJs[randomIndex] as string;
          const djInfo = djLoader.getDJInfo(djName);

          let messageText = `🎲 <b>Discover a DJ</b>

✨ <b>${djName.toUpperCase()}</b> ✨`;

          if (djInfo?.shortDescription) {
            messageText += `\n\n<blockquote>${djInfo.shortDescription}</blockquote>`;
          }

          messageText += '\n\nGive them a listen before the next event!';

          // Build buttons
          const buttons: Array<{ text: string; url: string }> = [];
          const soundcloudUrl = djInfo?.soundcloud || djInfo?.link;
          if (soundcloudUrl) {
            buttons.push({ text: '🎧 SOUNDCLOUD', url: soundcloudUrl });
          }
          if (djInfo?.instagram) {
            buttons.push({ text: '📸 INSTAGRAM', url: djInfo.instagram });
          }
          if (djInfo?.website) {
            buttons.push({ text: '🌐 WEBSITE', url: djInfo.website });
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
      } else if (command === '/membership') {
        const messageText = `💳 <b>Odessa MemberShip</b>

<b>€150 / month</b>

<b>What's included:</b>
All regular Odessa events
• Ecstatic Dance
• Cacao Ceremonies
• Ecstatic Journeys

<b>Not included:</b>
Special events like NYE, Christmas, festivals, retreats (charged separately)

Billed monthly. Cancel anytime. 🚢`;

        const keyboard = {
          inline_keyboard: [
            [{ text: '✨ SUBSCRIBE', url: 'https://mijn.odessa.amsterdam' }]
          ]
        };

        const imageUrl = 'https://raw.githubusercontent.com/kokosthief/odessa-telegram-bot/main/assets/membership.jpg';
        await sendTelegramMessageWithPhoto(chat.id, messageText, imageUrl, keyboard);
      } else if (command === '/types') {
        const messageText = `🎭 <b>Event Types at Odessa</b>

🌅 <b>Ecstatic Dance (ED)</b>
Free-form dancing to a DJ-guided journey.
Sunday mornings are "Morning ED"!

🍫 <b>Cacao Ecstatic Dance</b>
Live music opening, heart-opening cacao
ceremony, followed by ecstatic dance.

🌈 <b>Queerstatic</b>
LGBTQ+ inclusive dance celebration.

🌌 <b>Journey</b>
Live music opening, cacao ceremony,
and a 3-hour ecstatic dance journey.
The deepest exploration on Saturdays.

━━━━━━━━━━━━━━━━━━━━━
All events are sober, barefoot,
and phone-free spaces. 🙏`;

        await sendTelegramMessage(chat.id, messageText);
      } else if (command === '/location') {
        try {
          await sendTelegramLocation(chat.id, ODESSA_LATITUDE, ODESSA_LONGITUDE);

          const messageText = `📍 <b>Odessa Location</b>

<blockquote>🚢 Veemkade 259
1019 CZ Amsterdam
Netherlands</blockquote>`;

          const keyboard = {
            inline_keyboard: [
              [{ text: '📍 GOOGLE MAPS', url: `https://maps.google.com/?q=${ODESSA_LATITUDE},${ODESSA_LONGITUDE}` }],
              [{ text: '🍎 APPLE MAPS', url: 'https://maps.apple.com/place?place-id=IB3919CD17894B119&address=Veemkade+259%2C+1019+CZ+Amsterdam%2C+Netherlands&coordinate=52.3745084%2C4.9376496&name=Odessa&_provider=9902' }]
            ]
          };

          await sendTelegramMessageWithKeyboard(chat.id, messageText, keyboard);

        } catch (error) {
          console.error('Error handling /location:', error);
          await sendTelegramMessage(chat.id, '❌ Sorry, I couldn\'t send the location. Please try again.');
        }
      } else if (command === '/lostproperty') {
        const messageText = `🔍 <b>Lost & Found</b>

You can check the lost and found in the wardrobe/locker area during opening hours. Every month we give away the contents to charity as it gets too full to keep. ✨`;

        await sendTelegramMessage(chat.id, messageText);
      } else if (command === '/commands') {
        const messageText = `🤖 <b>Available Commands</b>

• /whosplaying — Who's facilitating today
• /schedule — This week's schedule
• /next — Who's facilitating next
• /dj [name] — DJ profile lookup
• /discover — Discover a random DJ
• /membership — Join our MemberShip
• /location — Get map pin
• /types — Event types explained
• /lostproperty — Lost & found info
• /commands — This list`;

        await sendTelegramMessage(chat.id, messageText);
      } else if (command === '/parking') {
        const messageText = `🚗 <b>Parking near Odessa</b>

<b>ParkBee Winkelcentrum Brazilië</b>
📍 Right next to Odessa (under Albert Heijn)
💰 Check ParkBee app for rates
⚠️ <b>CLOSES AT 22:00!</b> Your car gets
locked in overnight - no way home!

<b>P+R Zeeburg</b>
📍 Zuiderzeeweg 46a
💰 €1/day with OV-chipkaart
🚊 Tram 26 → 1 stop to Rietlandpark

<b>Street Parking</b>
📍 Veemkade area
💰 €5-7.50/hour (check signs)
⏰ Often free after 22:00 or midnight

💡 <i>Tip: For evening events, street parking
becomes free later - check the signs!</i>`;

        const keyboard = {
          inline_keyboard: [
            [
              { text: '📍 PARKBEE', url: 'https://maps.google.com/?q=52.3738452,4.9385437' },
              { text: '📍 P+R ZEEBURG', url: 'https://maps.google.com/?q=52.3665,4.9595' }
            ]
          ]
        };

        await sendTelegramMessageWithKeyboard(chat.id, messageText, keyboard);
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