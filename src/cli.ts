#!/usr/bin/env node

import { OdessaTodayGenerator } from './index';
import { OdessaBot } from './telegram/bot';

async function main() {
  const command = process.argv[2];

  console.log('🚢 Odessa Schedule Bot CLI');

  switch (command) {
    case 'whosplaying':
      await generateWhosPlaying();
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
  console.log('🤖 Starting interactive bot (polling mode)...');

  const token = process.env['TELEGRAM_BOT_TOKEN'];
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN not set');
    return;
  }

  try {
    // Enable polling for local testing
    const bot = new OdessaBot(token, { polling: true });
    bot.initialize();

    console.log('✅ Bot is now running and listening for commands!');
    console.log('📱 Send commands to your bot in Telegram to test');
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
  test         - Test bot connection
  run          - Start interactive bot with command handling

Examples:
  npm run cli whosplaying
  npm run cli test
  npm run cli run
  `);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 