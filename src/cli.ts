#!/usr/bin/env node

import { OdessaTodayGenerator } from './index';
import { OdessaBot } from './telegram/bot';
import { WeeklyScheduleGenerator } from './weekly-schedule-generator';

async function main() {
  const command = process.argv[2];

  console.log('🚢 Odessa Schedule Bot CLI');

  switch (command) {
    case 'whosplaying':
      await generateWhosPlaying();
      break;
    case 'schedule':
      await generateWeeklySchedule();
      break;
    case 'test':
      await testBot();
      break;
    case 'run':
      await runBot();
      break;
    default:
      showHelp();
  }
}

async function generateWhosPlaying() {
  console.log('📋 Generating today\'s schedule...');
  
  try {
    const generator = new OdessaTodayGenerator();
    const todaySchedule = await generator.generateEnhancedTodaySchedule();
    
    console.log('\n📋 Generated Today\'s Schedule:');
    console.log('='.repeat(50));
    console.log(todaySchedule.text);
    console.log('='.repeat(50));
    
    if (todaySchedule.photos && todaySchedule.photos.length > 0) {
      console.log(`📸 Photos: ${todaySchedule.photos.length} photos available`);
    }
    
    if (todaySchedule.keyboard) {
      console.log('⌨️  Keyboard: Available');
    }
    
  } catch (error) {
    console.error('❌ Failed to generate today\'s schedule:', error);
  }
}

async function generateWeeklySchedule() {
  console.log('🪩 Generating weekly schedule...');
  
  try {
    const generator = new WeeklyScheduleGenerator();
    const weeklySchedule = await generator.generateWeeklySchedule();
    
    console.log('\n🪩 Generated Weekly Schedule:');
    console.log('='.repeat(50));
    console.log(`Video File ID: ${weeklySchedule.videoFileId}`);
    console.log('='.repeat(50));
    console.log(weeklySchedule.text);
    console.log('='.repeat(50));
    
    if (weeklySchedule.keyboard) {
      console.log('⌨️  Keyboard: Available');
      console.log('🎫 Tickets button included');
    }
    
  } catch (error) {
    console.error('❌ Failed to generate weekly schedule:', error);
  }
}

async function testBot() {
  console.log('🧪 Testing bot connection...');
  
  const token = process.env['TELEGRAM_BOT_TOKEN'];
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN not set');
    return;
  }

  try {
    const bot = new OdessaBot(token);
    const telegramBot = bot.getBot();
    
    const me = await telegramBot.getMe();
    console.log('✅ Bot connection successful');
    console.log(`🤖 Bot username: @${me.username}`);
    console.log(`🆔 Bot ID: ${me.id}`);
    
  } catch (error) {
    console.error('❌ Bot connection failed:', error);
  }
}

async function runBot() {
  console.log('🤖 Starting interactive bot...');
  
  const token = process.env['TELEGRAM_BOT_TOKEN'];
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN not set');
    return;
  }

  try {
    const bot = new OdessaBot(token);
    bot.initialize();
    
    console.log('✅ Bot is now running and listening for commands!');
    console.log('📱 Commands available: /whosplaying, /schedule, /start, /help');
    console.log('⏹️  Press Ctrl+C to stop the bot');
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n🛑 Bot stopped by user');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
  }
}

function showHelp() {
  console.log(`
Usage: npm run cli <command>

Commands:
  whosplaying  - Generate today's schedule (without posting)
  schedule     - Generate weekly schedule (without posting)
  test         - Test bot connection
  run          - Start interactive bot with command handling

Examples:
  npm run cli whosplaying
  npm run cli schedule
  npm run cli test
  npm run cli run
  `);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 