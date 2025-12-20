import { VercelRequest, VercelResponse } from '@vercel/node';
import { WeeklyScheduleGenerator } from '../src/weekly-schedule-generator';

/**
 * Scheduled endpoint to automatically post weekly schedule every Wednesday at midday
 * Called by Vercel cron job
 * 
 * Cron schedule: "0 11 * * 3" = Every Wednesday at 11:00 UTC
 * This is approximately 12:00 Amsterdam time (12:00 in winter UTC+1, 13:00 in summer UTC+2)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a cron request (Vercel adds this header)
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env['CRON_SECRET'];
  
  // Optional: Add security check if CRON_SECRET is set
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('Unauthorized cron request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing environment variables');
      return res.status(500).json({ error: 'Bot not configured' });
    }

    console.log('📅 Scheduled weekly schedule post triggered');

    // Generate weekly schedule
    const weeklyGenerator = new WeeklyScheduleGenerator();
    const weeklySchedule = await weeklyGenerator.generateWeeklySchedule();

    console.log(`📋 Weekly schedule generated:`);
    console.log(`   Text length: ${weeklySchedule.text.length} characters`);
    console.log(`   Video: ${weeklySchedule.video}`);
    console.log(`   Keyboard: ${weeklySchedule.keyboard ? 'Available' : 'Not available'}`);

    // Send video with schedule to the configured chat
    const chatId = parseInt(TELEGRAM_CHAT_ID, 10);
    await sendTelegramMessageWithVideo(chatId, weeklySchedule.text, weeklySchedule.video, weeklySchedule.keyboard);

    console.log('✅ Weekly schedule posted successfully');

    return res.status(200).json({ 
      ok: true, 
      message: 'Weekly schedule posted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error posting scheduled weekly schedule:', error);
    return res.status(500).json({ 
      error: 'Failed to post weekly schedule',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function sendTelegramMessageWithVideo(chatId: number, caption: string, video: string, replyMarkup?: any) {
  const { TELEGRAM_BOT_TOKEN } = process.env;
  
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }

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
      const errorText = await response.text();
      console.error('Failed to send Telegram video:', errorText);
      throw new Error(`Telegram API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Telegram video sent successfully:', result.message_id);
  } catch (error) {
    console.error('Error sending Telegram video:', error);
    throw error;
  }
}

