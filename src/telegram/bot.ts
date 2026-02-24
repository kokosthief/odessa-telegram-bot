import TelegramBot from 'node-telegram-bot-api';
import { OdessaTodayGenerator } from '../index';
import { WeeklyScheduleGenerator } from '../weekly-schedule-generator';
import { DJLoader } from '../utils/dj-loader';
import { WixDJLoader } from '../utils/wix-dj-loader';
import { utcToZonedTime } from 'date-fns-tz';

export class OdessaBot {
  private bot: TelegramBot;
  private generator: OdessaTodayGenerator;
  private weeklyGenerator: WeeklyScheduleGenerator;
  private djLoader: DJLoader;
  private wixDJLoader: WixDJLoader;
  private userRateLimits: Map<number, number> = new Map();
  private amsterdamTimezone = 'Europe/Amsterdam';

  // Odessa boat coordinates (NDSM Wharf)
  private readonly ODESSA_LATITUDE = 52.4012;
  private readonly ODESSA_LONGITUDE = 4.8917;

  constructor(token: string, options?: { polling?: boolean }) {
    this.bot = new TelegramBot(token, { polling: options?.polling ?? false });
    this.generator = new OdessaTodayGenerator();
    this.weeklyGenerator = new WeeklyScheduleGenerator();
    this.djLoader = new DJLoader();
    this.wixDJLoader = new WixDJLoader();
  }

  /**
   * Initialize bot commands
   */
  public initialize(): void {
    // Handle /whosplaying command
    this.bot.onText(/\/whosplaying/, async (msg) => {
      await this.handleWhosPlayingCommand(msg);
    });

    // Handle /help command
    this.bot.onText(/\/help/, async (msg) => {
      await this.handleHelpCommand(msg);
    });

    // Handle /schedule command
    this.bot.onText(/\/schedule/, async (msg) => {
      await this.handleScheduleCommand(msg);
    });

    // Handle /next command
    this.bot.onText(/\/next/, async (msg) => {
      await this.handleNextCommand(msg);
    });

    // Handle /dj command (with optional name argument)
    this.bot.onText(/\/dj(?:\s+(.+))?/, async (msg, match) => {
      await this.handleDJCommand(msg, match?.[1]);
    });

    // Handle /discover command
    this.bot.onText(/\/discover/, async (msg) => {
      await this.handleDiscoverCommand(msg);
    });

    // Handle /membership command
    this.bot.onText(/\/membership/, async (msg) => {
      await this.handleMembershipCommand(msg);
    });

    // Handle /types command
    this.bot.onText(/\/types/, async (msg) => {
      await this.handleTypesCommand(msg);
    });

    // Handle /lostproperty command
    this.bot.onText(/\/lostproperty/, async (msg) => {
      await this.handleLostPropertyCommand(msg);
    });

    // Handle /location command
    this.bot.onText(/\/location/, async (msg) => {
      await this.handleLocationCommand(msg);
    });

    // Handle /commands command
    this.bot.onText(/\/commands/, async (msg) => {
      await this.handleCommandsCommand(msg);
    });

    // Handle /report command
    this.bot.onText(/\/report/, async (msg) => {
      await this.handleReportCommand(msg);
    });
  }

  /**
   * Handle /whosplaying command with rate limiting and error handling
   */
  public async handleWhosPlayingCommand(msg: TelegramBot.Message): Promise<void> {
    const userId = msg.from?.id;
    if (!userId) return;

    // Check rate limiting
    const now = Date.now();
    const lastRequest = this.userRateLimits.get(userId);
    if (lastRequest && now - lastRequest < 60000) { // 60 seconds
      await this.bot.sendMessage(msg.chat.id,
        '⏰ Please wait a moment before requesting again. You can request again in 60 seconds.',
        { parse_mode: 'HTML' }
      );
      return;
    }

    // Update rate limit
    this.userRateLimits.set(userId, now);

    try {
      // Show typing indicator
      await this.bot.sendChatAction(msg.chat.id, 'typing');

      // Generate enhanced today's schedule
      const todaySchedule = await this.generator.generateEnhancedTodaySchedule();

      // Debug logging (only in development)
      if (process.env['NODE_ENV'] === 'development') {
        console.log('🔍 Today Schedule Debug:');
        console.log(`   Text: ${todaySchedule.text}`);
        console.log(`   Photos: ${todaySchedule.photos ? todaySchedule.photos.length : 0}`);
        console.log(`   Messages: ${todaySchedule.messages ? todaySchedule.messages.length : 0}`);
        console.log(`   Keyboard: ${todaySchedule.keyboard ? 'YES' : 'NO'}`);
        if (todaySchedule.messages) {
          console.log(`   Messages array:`, todaySchedule.messages);
        }
      }

      // Handle multiple messages for multiple DJs
      if (todaySchedule.messages && todaySchedule.messages.length > 0) {
        // Send intro message first
        await this.bot.sendMessage(msg.chat.id, todaySchedule.text, {
          parse_mode: 'HTML'
        });
        
        // Send separate message for each DJ with their photo
        for (const message of todaySchedule.messages) {
          if (message.photo) {
            // Send with photo
            await this.bot.sendPhoto(msg.chat.id, message.photo, {
              caption: message.text,
              parse_mode: 'HTML',
              reply_markup: message.keyboard
            });
          } else {
            // Send without photo
            await this.bot.sendMessage(msg.chat.id, message.text, {
              parse_mode: 'HTML',
              reply_markup: message.keyboard
            });
          }
        }
      } else {
        console.log('📤 Using single message logic');
        // Handle single event (original logic)
        if (todaySchedule.photos && todaySchedule.photos.length > 0 && todaySchedule.photos[0]) {
          // Send with photos
          await this.bot.sendPhoto(msg.chat.id, todaySchedule.photos[0], {
            caption: todaySchedule.text,
            parse_mode: 'HTML',
            reply_markup: todaySchedule.keyboard
          });
        } else if (todaySchedule.keyboard) {
          // Send with keyboard
          await this.bot.sendMessage(msg.chat.id, todaySchedule.text, {
            parse_mode: 'HTML',
            reply_markup: todaySchedule.keyboard
          });
        } else {
          // Send plain text
          await this.bot.sendMessage(msg.chat.id, todaySchedule.text, {
            parse_mode: 'HTML'
          });
        }
      }

    } catch (error) {
      console.error('Error handling /whosplaying command:', error);
      await this.bot.sendMessage(msg.chat.id,
        '❌ Sorry, I couldn\'t fetch today\'s schedule. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Handle /help command
   */
  public async handleHelpCommand(msg: TelegramBot.Message): Promise<void> {
    const helpMessage = `🤖 <b>Odessa Schedule Bot Help</b>

<b>Main commands:</b>
• /whosplaying — Who's facilitating today
• /schedule — This week's schedule
• /next — Who's facilitating next
• /dj [name] — DJ profile lookup
• /discover — Discover a random DJ
• /membership — Join our MemberShip
• /location — Get map pin
• /types — Event types explained
• /commands — Full command list

🚨 <b>Spam or abuse?</b> Use /report for instructions.`;

    await this.bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
  }

  /**
   * Handle /schedule command with rate limiting and error handling
   */
  public async handleScheduleCommand(msg: TelegramBot.Message): Promise<void> {
    const userId = msg.from?.id;
    if (!userId) return;

    // Check rate limiting
    const now = Date.now();
    const lastRequest = this.userRateLimits.get(userId);
    if (lastRequest && now - lastRequest < 60000) { // 60 seconds
      await this.bot.sendMessage(msg.chat.id,
        '⏰ Please wait a moment before requesting again. You can request again in 60 seconds.',
        { parse_mode: 'HTML' }
      );
      return;
    }

    // Update rate limit
    this.userRateLimits.set(userId, now);

    try {
      // Show typing indicator
      await this.bot.sendChatAction(msg.chat.id, 'typing');

      // Generate weekly schedule
      const weeklySchedule = await this.weeklyGenerator.generateWeeklySchedule();

      // Send video with schedule
      await this.bot.sendVideo(msg.chat.id, weeklySchedule.video, {
        caption: weeklySchedule.text,
        parse_mode: 'HTML',
        reply_markup: weeklySchedule.keyboard
      });

    } catch (error) {
      console.error('Error handling /schedule command:', error);
      await this.bot.sendMessage(msg.chat.id,
        '❌ Sorry, I couldn\'t fetch the weekly schedule right now. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Handle /next command - show next upcoming event
   */
  public async handleNextCommand(msg: TelegramBot.Message): Promise<void> {
    const userId = msg.from?.id;
    if (!userId) return;

    // Check rate limiting
    const now = Date.now();
    const lastRequest = this.userRateLimits.get(userId);
    if (lastRequest && now - lastRequest < 60000) {
      await this.bot.sendMessage(msg.chat.id,
        '⏰ Please wait a moment before requesting again.',
        { parse_mode: 'HTML' }
      );
      return;
    }

    this.userRateLimits.set(userId, now);

    try {
      await this.bot.sendChatAction(msg.chat.id, 'typing');

      const nextEvent = await this.generator.findNextUpcomingEvent();

      if (!nextEvent) {
        await this.bot.sendMessage(msg.chat.id,
          '🚢 No upcoming events found. Check back later!',
          { parse_mode: 'HTML' }
        );
        return;
      }

      const eventDate = new Date(nextEvent.date);
      const eventDateInAmsterdam = utcToZonedTime(eventDate, this.amsterdamTimezone);
      const nowInAmsterdam = utcToZonedTime(new Date(), this.amsterdamTimezone);

      // Format date nicely
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = dayNames[eventDateInAmsterdam.getDay()];
      const monthName = monthNames[eventDateInAmsterdam.getMonth()];
      const dayNum = eventDateInAmsterdam.getDate();
      const hours = eventDateInAmsterdam.getHours().toString().padStart(2, '0');
      const minutes = eventDateInAmsterdam.getMinutes().toString().padStart(2, '0');

      // Calculate relative time
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

      // Get DJ info
      const djInfo = nextEvent.djName ? await this.wixDJLoader.getDJInfoWithFallback(nextEvent.djName) : null;

      const text = `🚀 <b>Next up at Odessa:</b>

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
        await this.bot.sendPhoto(msg.chat.id, djInfo.photo, {
          caption: text,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      } else {
        await this.bot.sendMessage(msg.chat.id, text, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      }

    } catch (error) {
      console.error('Error handling /next command:', error);
      await this.bot.sendMessage(msg.chat.id,
        '❌ Sorry, I couldn\'t fetch the next event. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Handle /dj command - DJ profile lookup
   */
  public async handleDJCommand(msg: TelegramBot.Message, djName?: string): Promise<void> {
    const userId = msg.from?.id;
    if (!userId) return;

    const now = Date.now();
    const lastRequest = this.userRateLimits.get(userId);
    if (lastRequest && now - lastRequest < 60000) {
      await this.bot.sendMessage(msg.chat.id,
        '⏰ Please wait a moment before requesting again.',
        { parse_mode: 'HTML' }
      );
      return;
    }

    this.userRateLimits.set(userId, now);

    try {
      await this.bot.sendChatAction(msg.chat.id, 'typing');

      if (!djName || djName.trim() === '') {
        // List all DJs
        const allDJs = this.djLoader.getAllDJNames();
        const djList = allDJs.sort().map(name => `• ${name}`).join('\n');

        const text = `🎧 <b>Odessa DJs</b>

Choose a DJ to learn more:

${djList}

<i>Usage: /dj Samaya</i>`;

        await this.bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
        return;
      }

      // Look up specific DJ
      const djInfo = await this.wixDJLoader.getDJInfoWithFallback(djName.trim());

      if (!djInfo) {
        await this.bot.sendMessage(msg.chat.id,
          `❌ DJ "${djName}" not found. Try /dj to see all available DJs.`,
          { parse_mode: 'HTML' }
        );
        return;
      }

      let text = `🎧 <b>${djInfo.name.toUpperCase()}</b>`;

      if (djInfo.shortDescription) {
        text += `\n\n"${djInfo.shortDescription}"`;
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
        text += '\n\n' + links.join('\n');
      }

      const buttons: Array<{ text: string; url: string }> = [];
      if (djInfo.soundcloudUrl) {
        buttons.push({ text: '🎧 LISTEN ON SOUNDCLOUD', url: djInfo.soundcloudUrl });
      }

      const keyboard = buttons.length > 0 ? { inline_keyboard: [buttons] } : undefined;

      if (djInfo.photo) {
        await this.bot.sendPhoto(msg.chat.id, djInfo.photo, {
          caption: text,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      } else {
        await this.bot.sendMessage(msg.chat.id, text, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      }

    } catch (error) {
      console.error('Error handling /dj command:', error);
      await this.bot.sendMessage(msg.chat.id,
        '❌ Sorry, I couldn\'t fetch DJ info. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Handle /discover command - random DJ discovery
   */
  public async handleDiscoverCommand(msg: TelegramBot.Message): Promise<void> {
    const userId = msg.from?.id;
    if (!userId) return;

    const now = Date.now();
    const lastRequest = this.userRateLimits.get(userId);
    if (lastRequest && now - lastRequest < 60000) {
      await this.bot.sendMessage(msg.chat.id,
        '⏰ Please wait a moment before requesting again.',
        { parse_mode: 'HTML' }
      );
      return;
    }

    this.userRateLimits.set(userId, now);

    try {
      await this.bot.sendChatAction(msg.chat.id, 'typing');

      const randomDJ = this.djLoader.getRandomDJ();

      if (!randomDJ) {
        await this.bot.sendMessage(msg.chat.id,
          '❌ No DJs found in the database.',
          { parse_mode: 'HTML' }
        );
        return;
      }

      // Get enhanced info
      const djInfo = await this.wixDJLoader.getDJInfoWithFallback(randomDJ.name);

      let text = `🎲 <b>Discover a DJ</b>

✨ <b>${(djInfo?.name || randomDJ.name).toUpperCase()}</b> ✨`;

      if (djInfo?.shortDescription) {
        text += `\n\n"${djInfo.shortDescription}"`;
      }

      text += '\n\nGive them a listen before the next event!';

      const buttons: Array<{ text: string; url: string }> = [];
      const soundcloudUrl = djInfo?.soundcloudUrl || randomDJ.link;
      if (soundcloudUrl) {
        buttons.push({ text: '🎧 LISTEN ON SOUNDCLOUD', url: soundcloudUrl });
      }

      const keyboard = buttons.length > 0 ? { inline_keyboard: [buttons] } : undefined;

      if (djInfo?.photo) {
        await this.bot.sendPhoto(msg.chat.id, djInfo.photo, {
          caption: text,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      } else {
        await this.bot.sendMessage(msg.chat.id, text, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      }

    } catch (error) {
      console.error('Error handling /discover command:', error);
      await this.bot.sendMessage(msg.chat.id,
        '❌ Sorry, I couldn\'t fetch a random DJ. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Handle /membership command - membership info and signup
   */
  public async handleMembershipCommand(msg: TelegramBot.Message): Promise<void> {
    const text = `💳 <b>Odessa MemberShip</b>

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

    try {
      await this.bot.sendPhoto(msg.chat.id, imageUrl, {
        caption: text,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error sending membership photo:', error);
      // Fallback to text if photo fails
      await this.bot.sendMessage(msg.chat.id, text, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }
  }

  /**
   * Handle /types command - event types explained
   */
  public async handleTypesCommand(msg: TelegramBot.Message): Promise<void> {
    const text = `🎭 <b>Event Types at Odessa</b>

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

    await this.bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
  }

  /**
   * Handle /location command - send map pin
   */
  public async handleLocationCommand(msg: TelegramBot.Message): Promise<void> {
    try {
      // Send the location pin
      await this.bot.sendLocation(msg.chat.id, this.ODESSA_LATITUDE, this.ODESSA_LONGITUDE);

      // Follow up with Google Maps link
      const text = `📍 <b>Odessa Location</b>

🚢 NDSM Wharf, Amsterdam

Open in Google Maps:
https://maps.google.com/?q=${this.ODESSA_LATITUDE},${this.ODESSA_LONGITUDE}`;

      await this.bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });

    } catch (error) {
      console.error('Error handling /location command:', error);
      await this.bot.sendMessage(msg.chat.id,
        '❌ Sorry, I couldn\'t send the location. Please try again.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Handle /lostproperty command - lost and found info
   */
  public async handleLostPropertyCommand(msg: TelegramBot.Message): Promise<void> {
    const text = `🔍 <b>Lost & Found</b>

You can check the lost and found in the wardrobe/locker area during opening hours. Every month we give away the contents to charity as it gets too full to keep. ✨`;

    await this.bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
  }

  /**
   * Handle /commands command - list all available commands
   */
  public async handleCommandsCommand(msg: TelegramBot.Message): Promise<void> {
    const text = `🤖 <b>Available Commands</b>

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

    await this.bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
  }

  /**
   * Handle /report command - explain how to report spam in Telegram
   */
  public async handleReportCommand(msg: TelegramBot.Message): Promise<void> {
    const text = `🚨 <b>How to Report Spam or Abuse</b>

Reporting is done directly in Telegram — no bot command needed.

<b>Report a specific message:</b>
1. Long-press the message
2. Tap <b>Report</b>
3. Choose a reason (Spam, Violence, etc.)
4. Telegram will review it

<b>Report a user:</b>
1. Tap their name/profile
2. Tap ⋮ (menu) → <b>Report</b>
3. Select the reason

<b>Report to group admins:</b>
Reply to the spam message and tag an admin, or forward it to <b>@odessa_amsterdam</b>

<i>Admins can delete messages and remove users from the group.</i>`;

    await this.bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
  }

  /**
   * Get the bot instance
   */
  public getBot(): TelegramBot {
    return this.bot;
  }
} 