import TelegramBot from 'node-telegram-bot-api';
import { OdessaTodayGenerator } from '../index';

export class OdessaBot {
  private bot: TelegramBot;
  private generator: OdessaTodayGenerator;
  private userRateLimits: Map<number, number> = new Map();

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: false });
    this.generator = new OdessaTodayGenerator();
  }

  /**
   * Initialize bot commands
   */
  public initialize(): void {
    // Handle /whosplaying command
    this.bot.onText(/\/whosplaying/, async (msg) => {
      await this.handleWhosPlayingCommand(msg);
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

      // Send the schedule
      if (todaySchedule.photos && todaySchedule.photos.length > 0) {
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

I can help you check who's playing today at Odessa boat events in Amsterdam.

<b>Available commands:</b>
• /whosplaying - Check who is playing today
• /help - Show this help message

Just send /whosplaying to get started! 🌴🎶`;

    await this.bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'HTML' });
  }

  /**
   * Handle /help command
   */
  public async handleHelpCommand(msg: TelegramBot.Message): Promise<void> {
    const helpMessage = `🤖 <b>Odessa Schedule Bot Help</b>

<b>Commands:</b>
• /whosplaying - Check who is playing today with DJ information and photos
• /help - Show this help message

<b>Features:</b>
• Real-time schedule checking from Hipsy.no
• DJ information with photos and descriptions
• Direct ticket booking links
• Works in groups and direct messages

<b>Rate Limiting:</b>
• You can request today's schedule once every 60 seconds to prevent spam

Need help? Contact the bot administrator.`;

    await this.bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
  }

  /**
   * Get the bot instance
   */
  public getBot(): TelegramBot {
    return this.bot;
  }
} 