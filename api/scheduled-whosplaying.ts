import { VercelRequest, VercelResponse } from '@vercel/node';
import { OdessaTodayGenerator } from '../src/index';
import { GroupTracker } from '../src/utils/group-tracker';

/**
 * Scheduled endpoint to automatically post "who's playing today" schedule
 * Called by Vercel cron jobs:
 *
 * - Tuesday at 14:33 UTC (approximately 15:33 Amsterdam time / 3:33 PM)
 * - Saturday at 08:33 UTC (approximately 09:33 Amsterdam time / 9:33 AM)
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

    console.log('🎭 Scheduled who\'s playing post triggered');

    // Generate today's schedule
    const todayGenerator = new OdessaTodayGenerator();
    const todaySchedule = await todayGenerator.generateEnhancedTodaySchedule();

    console.log(`📋 Today's schedule generated:`);
    console.log(`   Text length: ${todaySchedule.text.length} characters`);
    console.log(`   Photos: ${todaySchedule.photos?.length || 0}`);
    console.log(`   Messages: ${todaySchedule.messages?.length || 0}`);

    // Get group chat IDs from environment variable (comma-separated)
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
      allChatIds.map(chatId => sendWhosPlayingToChat(chatId, todaySchedule))
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
      message: 'Who\'s playing schedule posted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error posting scheduled who\'s playing:', error);
    return res.status(500).json({
      error: 'Failed to post who\'s playing schedule',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function sendWhosPlayingToChat(
  chatId: number,
  schedule: {
    text: string;
    photos?: string[];
    keyboard?: any;
    messages?: Array<{
      text: string;
      photo?: string;
      keyboard?: any;
    }>;
  }
) {
  const { TELEGRAM_BOT_TOKEN } = process.env;

  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }

  // If there are multiple messages (B2B events), send each one
  if (schedule.messages && schedule.messages.length > 0) {
    for (const message of schedule.messages) {
      if (message.photo) {
        await sendTelegramPhoto(chatId, message.photo, message.text, message.keyboard);
      } else {
        await sendTelegramMessage(chatId, message.text, message.keyboard);
      }
    }
    return;
  }

  // Single message - check if we have a photo
  if (schedule.photos && schedule.photos.length > 0) {
    await sendTelegramPhoto(chatId, schedule.photos[0], schedule.text, schedule.keyboard);
  } else {
    await sendTelegramMessage(chatId, schedule.text, schedule.keyboard);
  }
}

async function sendTelegramPhoto(chatId: number, photo: string, caption: string, replyMarkup?: any) {
  const { TELEGRAM_BOT_TOKEN } = process.env;

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
    const errorText = await response.text();
    console.error('Failed to send Telegram photo:', errorText);
    throw new Error(`Telegram API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('Telegram photo sent successfully:', result.result?.message_id);
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const { TELEGRAM_BOT_TOKEN } = process.env;

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send Telegram message:', errorText);
    throw new Error(`Telegram API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('Telegram message sent successfully:', result.result?.message_id);
}
