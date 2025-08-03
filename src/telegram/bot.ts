import TelegramBot from 'node-telegram-bot-api';
import { OdessaTodayGenerator } from '../index';
import { WeeklyScheduleGenerator } from '../weekly-schedule-generator';

export class OdessaBot {
  private bot: TelegramBot;
  private generator: OdessaTodayGenerator;
  private weeklyGenerator: WeeklyScheduleGenerator;
  private userRateLimits: Map<number, number> = new Map();

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: false });
    this.generator = new OdessaTodayGenerator();
    this.weeklyGenerator = new WeeklyScheduleGenerator();
  }

  /**
   * Initialize bot commands
   */
  public initialize(): void {
    // Handle /whosplaying command
    this.bot.onText(/\/whosplaying/, async (msg) => {
      await this.handleWhosPlayingCommand(msg);
    });

    // Handle /schedule command
    this.bot.onText(/\/schedule/, async (msg) => {
      await this.handleScheduleCommand(msg);
    });

    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      await this.handleStartCommand(msg);
    });

    // Handle /help command
    this.bot.onText(/\/help/, async (msg) => {
      await this.handleHelpCommand(msg);
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

      // Debug logging
      console.log('🔍 Today Schedule Debug:');
      console.log(`   Text: ${todaySchedule.text}`);
      console.log(`   Photos: ${todaySchedule.photos ? todaySchedule.photos.length : 0}`);
      console.log(`   Messages: ${todaySchedule.messages ? todaySchedule.messages.length : 0}`);
      console.log(`   Keyboard: ${todaySchedule.keyboard ? 'YES' : 'NO'}`);
      
      if (todaySchedule.messages) {
        console.log(`   Messages array:`, todaySchedule.messages);
      }

      // Handle multiple messages for multiple DJs
      if (todaySchedule.messages && todaySchedule.messages.length > 0) {
        console.log('📤 Sending multiple messages for multiple DJs');
        // Send intro message first
        await this.bot.sendMessage(msg.chat.id, todaySchedule.text, {
          parse_mode: 'HTML'
        });
        
        // Send separate message for each DJ with their photo
        for (const message of todaySchedule.messages) {
          console.log(`📤 Sending message: ${message.text.substring(0, 50)}...`);
          if (message.photo) {
            console.log(`📸 Sending with photo: ${message.photo}`);
            // Send with photo
            await this.bot.sendPhoto(msg.chat.id, message.photo, {
              caption: message.text,
              parse_mode: 'HTML',
              reply_markup: message.keyboard
            });
          } else {
            console.log(`📝 Sending without photo`);
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
   * Handle /start command
   */
  public async handleStartCommand(msg: TelegramBot.Message): Promise<void> {
    const welcomeMessage = `🤖 <b>Welcome to the Odessa Schedule Bot!</b>

I can help you check schedules at Odessa boat events in Amsterdam.

<b>Available commands:</b>
• /whosplaying - Check who is playing today
• /schedule - View this week's schedule with video
• /help - Show this help message

Just send /whosplaying or /schedule to get started! 🌴🎶`;

    await this.bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'HTML' });
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

      // Debug logging
      console.log('🔍 Weekly Schedule Debug:');
      console.log(`   Video File ID: ${weeklySchedule.videoFileId}`);
      console.log(`   Text: ${weeklySchedule.text}`);
      console.log(`   Keyboard: ${weeklySchedule.keyboard ? 'YES' : 'NO'}`);

      // Send video with caption
      await this.bot.sendVideo(msg.chat.id, weeklySchedule.videoFileId, {
        caption: weeklySchedule.text,
        parse_mode: 'HTML',
        reply_markup: weeklySchedule.keyboard
      });

    } catch (error) {
      console.error('Error handling /schedule command:', error);
      await this.bot.sendMessage(msg.chat.id,
        '❌ Sorry, I couldn\'t fetch the weekly schedule. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Handle /help command
   */
  public async handleHelpCommand(msg: TelegramBot.Message): Promise<void> {
    const helpMessage = `🤖 <b>Odessa Schedule Bot Help</b>

<b>Commands:</b>
• /whosplaying - Check who is facilitating today
• /schedule - View this week's schedule
• /help - Show this help message`;

    await this.bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
  }

  /**
   * Get the bot instance
   */
  public getBot(): TelegramBot {
    return this.bot;
  }
} 