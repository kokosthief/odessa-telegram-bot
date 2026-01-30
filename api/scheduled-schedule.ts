import { VercelRequest, VercelResponse } from '@vercel/node';
import { WeeklyScheduleGenerator } from '../src/weekly-schedule-generator';
import { GroupTracker } from '../src/utils/group-tracker';

/**
 * Scheduled endpoint to automatically post weekly schedule every Wednesday at midday
 * Called by Vercel cron job
 * 
 * Cron schedule: "11 10 * * 3" = Every Wednesday at 10:11 UTC
 * This is 11:11 Amsterdam time (winter UTC+1) - a spiritually aligned time ✨
 * 
 * Posts to all group chats/channels specified in TELEGRAM_GROUP_CHAT_ID environment variable
 * Format: comma-separated group IDs (e.g., "-1001234567890,-1009876543210")
 * Group chat IDs are negative numbers in Telegram
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
    const { TELEGRAM_BOT_TOKEN } = process.env;

    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Missing TELEGRAM_BOT_TOKEN');
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

    // Get group chat IDs from environment variable (comma-separated)
    // Format: TELEGRAM_GROUP_CHAT_ID="-1001234567890,-1009876543210"
    const { TELEGRAM_GROUP_CHAT_ID } = process.env;
    
    let allChatIds: number[] = [];
    
    if (TELEGRAM_GROUP_CHAT_ID) {
      // Parse comma-separated group IDs
      allChatIds = TELEGRAM_GROUP_CHAT_ID
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0)
        .map(id => parseInt(id, 10))
        .filter(id => !isNaN(id) && id < 0); // Only negative IDs (groups/channels)
    }
    
    // Also try to load from groups.json (for local development or if file persists)
    try {
      const groupTracker = new GroupTracker();
      const trackedGroups = groupTracker.getAllGroups();
      trackedGroups.forEach(groupId => {
        if (!allChatIds.includes(groupId)) {
          allChatIds.push(groupId);
        }
      });
    } catch (error) {
      // File-based tracking may not work in serverless, that's okay
      console.log('Note: File-based group tracking not available (serverless environment)');
    }

    if (allChatIds.length === 0) {
      console.warn('⚠️ No groups/channels found to post to');
      return res.status(200).json({ 
        ok: true, 
        message: 'No groups to post to - bot will track groups when it receives messages',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📤 Posting to ${allChatIds.length} group(s)/channel(s): ${allChatIds.join(', ')}`);

    // Post to all groups/channels
    const results = await Promise.allSettled(
      allChatIds.map(chatId => 
        sendTelegramMessageWithVideo(chatId, weeklySchedule.text, weeklySchedule.video, weeklySchedule.keyboard)
      )
    );

    // Log results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Posted successfully to ${successful} group(s)/channel(s)`);
    if (failed > 0) {
      console.warn(`⚠️ Failed to post to ${failed} group(s)/channel(s)`);
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`   Failed for chat ID ${allChatIds[index]}:`, result.reason);
        }
      });
    }

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

