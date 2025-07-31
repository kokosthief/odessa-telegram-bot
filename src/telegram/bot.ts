import TelegramBot from 'node-telegram-bot-api';
import { OdessaScheduleGenerator } from '../index';

export class OdessaTelegramBot {
  private bot: TelegramBot;
  private chatId: string;
  private generator: OdessaScheduleGenerator;
  private userRequests: Map<string, number> = new Map();
  private readonly RATE_LIMIT_MS = 60000; // 60 seconds

  constructor(token: string, chatId: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.chatId = chatId;
    this.generator = new OdessaScheduleGenerator();
    
    // Set up command handlers
    this.setupCommandHandlers();
  }

  /**
   * Set up command handlers for interactive bot functionality
   */
  private setupCommandHandlers(): void {
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

    console.log('✅ Command handlers set up successfully');
  }

  /**
   * Handle /schedule command with rate limiting and error handling
   */
  public async handleScheduleCommand(msg: TelegramBot.Message): Promise<void> {
    const userId = msg.from?.id?.toString() || 'unknown';
    const chatId = msg.chat.id;

    try {
      // Check rate limiting
      if (this.isRateLimited(userId)) {
        await this.bot.sendMessage(chatId, 
          '⏰ Please wait a moment before requesting another schedule. You can request a new schedule in 60 seconds.',
          { parse_mode: 'HTML' }
        );
        return;
      }

      // Show typing indicator
      await this.bot.sendChatAction(chatId, 'typing');

      console.log(`🤖 Generating schedule for user ${userId} in chat ${chatId}`);

      // Generate the schedule
      const schedule = await this.generator.generateSchedule();

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

      // Send the schedule with inline keyboard
      await this.bot.sendMessage(chatId, schedule, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: inlineKeyboard
      });

      console.log(`✅ Schedule sent successfully to user ${userId}`);

    } catch (error) {
      console.error(`❌ Failed to handle schedule command for user ${userId}:`, error);
      
      // Send user-friendly error message
      await this.bot.sendMessage(chatId, 
        '❌ Sorry, I could not generate the schedule right now. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Handle /start command
   */
  public async handleStartCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🤖 Welcome to the Odessa Schedule Bot!

I can help you get the latest schedule for Odessa boat events in Amsterdam.

<b>Available commands:</b>
• /schedule - Get the current week's schedule
• /help - Show this help message

Just send /schedule to get started! 🌴🎶
    `.trim();

    await this.bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'HTML'
    });
  }

  /**
   * Handle /help command
   */
  public async handleHelpCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const helpMessage = `
🤖 <b>Odessa Schedule Bot Help</b>

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

Need help? Contact the bot administrator.
    `.trim();

    await this.bot.sendMessage(chatId, helpMessage, {
      parse_mode: 'HTML'
    });
  }

  /**
   * Check if user is rate limited
   */
  private isRateLimited(userId: string): boolean {
    const now = Date.now();
    const lastRequest = this.userRequests.get(userId) || 0;
    const timeDiff = now - lastRequest;
    
    if (timeDiff < this.RATE_LIMIT_MS) {
      return true;
    }
    
    this.userRequests.set(userId, now);
    return false;
  }

  /**
   * Generate and post a weekly schedule to Telegram (legacy method)
   */
  async postWeeklySchedule(): Promise<boolean> {
    try {
      console.log('🤖 Generating and posting weekly schedule to Telegram...');
      
      // Generate the schedule
      const schedule = await this.generator.generateSchedule();
      
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
      
      // Post to Telegram with inline keyboard
      const result = await this.bot.sendMessage(this.chatId, schedule, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: inlineKeyboard
      });
      
      console.log('✅ Schedule posted successfully to Telegram');
      console.log('📱 Message ID:', result.message_id);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to post schedule to Telegram:', error);
      return false;
    }
  }

  /**
   * Post a custom message to Telegram
   */
  async postMessage(message: string): Promise<boolean> {
    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      
      console.log('✅ Message posted successfully to Telegram');
      return true;
    } catch (error) {
      console.error('❌ Failed to post message to Telegram:', error);
      return false;
    }
  }

  /**
   * Test the bot connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const me = await this.bot.getMe();
      console.log('✅ Bot connection successful');
      console.log('🤖 Bot username:', me.username);
      console.log('🆔 Bot ID:', me.id);
      return true;
    } catch (error) {
      console.error('❌ Bot connection failed:', error);
      return false;
    }
  }

  /**
   * Get bot info
   */
  async getBotInfo() {
    try {
      const me = await this.bot.getMe();
      return {
        id: me.id,
        username: me.username,
        firstName: me.first_name
      };
    } catch (error) {
      console.error('❌ Failed to get bot info:', error);
      return null;
    }
  }

  /**
   * Stop the bot polling
   */
  async stop(): Promise<void> {
    try {
      await this.bot.stopPolling();
      console.log('✅ Bot polling stopped successfully');
    } catch (error) {
      console.error('❌ Failed to stop bot polling:', error);
    }
  }
} 