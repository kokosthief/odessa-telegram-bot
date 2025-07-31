import { VercelRequest, VercelResponse } from '@vercel/node';
import { OdessaScheduleGenerator } from '../src/index';
import { OdessaTelegramBot } from '../src/telegram/bot';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { action, date } = req.query;
    
    // Handle Telegram posting
    if (action === 'post-to-telegram') {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      
      if (!token || !chatId) {
        return res.status(500).json({
          success: false,
          error: 'Telegram bot not configured'
        });
      }
      
      const bot = new OdessaTelegramBot(token, chatId);
      const success = await bot.postWeeklySchedule();
      
      return res.status(200).json({
        success,
        message: success ? 'Schedule posted to Telegram' : 'Failed to post to Telegram',
        postedAt: new Date().toISOString()
      });
    }
    
    // Generate schedule (default action)
    const generator = new OdessaScheduleGenerator();
    
    // Check if a specific date is provided
    let schedule: string;
    
    if (date) {
      const startDate = new Date(date as string);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid date format. Use YYYY-MM-DD' 
        });
      }
      schedule = await generator.generateScheduleForWeek(startDate);
    } else {
      schedule = await generator.generateSchedule();
    }

    // Return the formatted schedule
    res.status(200).json({
      success: true,
      schedule,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      generatedAt: new Date().toISOString()
    });
  }
} 