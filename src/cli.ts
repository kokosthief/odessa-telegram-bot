#!/usr/bin/env node

import { OdessaTelegramBot } from './telegram/bot';
import { OdessaScheduleGenerator } from './index';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚢 Odessa Schedule Bot CLI');
  console.log('==========================');

  switch (command) {
    case 'generate':
      await generateSchedule();
      break;
    case 'post':
      await postToTelegram();
      break;
    case 'test':
      await testBot();
      break;
    case 'run':
      await runInteractiveBot();
      break;
    default:
      console.log('Available commands:');
      console.log('  generate  - Generate a schedule (without posting)');
      console.log('  post      - Generate and post to Telegram');
      console.log('  test      - Test bot connection');
      console.log('  run       - Start interactive bot with command handling');
      console.log('');
      console.log('Usage: npm run cli <command>');
  }
}

async function generateSchedule() {
  console.log('📋 Generating schedule...');
  
  try {
    const generator = new OdessaScheduleGenerator();
    const schedule = await generator.generateSchedule();
    
    console.log('\n📋 Generated Schedule:');
    console.log('=' .repeat(50));
    console.log(schedule);
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Failed to generate schedule:', error);
  }
}

async function postToTelegram() {
  console.log('🤖 Posting to Telegram...');
  
  const token = process.env['TELEGRAM_BOT_TOKEN'];
  const chatId = process.env['TELEGRAM_CHAT_ID'];
  
  if (!token || !chatId) {
    console.error('❌ Missing environment variables:');
    console.error('   TELEGRAM_BOT_TOKEN:', token ? '✅ Set' : '❌ Missing');
    console.error('   TELEGRAM_CHAT_ID:', chatId ? '✅ Set' : '❌ Missing');
    return;
  }
  
  try {
    const bot = new OdessaTelegramBot(token, chatId);
    const success = await bot.postWeeklySchedule();
    
    if (success) {
      console.log('✅ Schedule posted successfully to Telegram!');
    } else {
      console.log('❌ Failed to post schedule to Telegram');
    }
    
  } catch (error) {
    console.error('❌ Error posting to Telegram:', error);
  }
}

async function testBot() {
  console.log('🧪 Testing bot connection...');
  
  const token = process.env['TELEGRAM_BOT_TOKEN'];
  const chatId = process.env['TELEGRAM_CHAT_ID'];
  
  if (!token || !chatId) {
    console.error('❌ Missing environment variables');
    return;
  }
  
  try {
    const bot = new OdessaTelegramBot(token, chatId);
    
    // Test connection
    const connectionSuccess = await bot.testConnection();
    if (!connectionSuccess) {
      console.log('❌ Bot connection failed');
      return;
    }
    
    // Get bot info
    const botInfo = await bot.getBotInfo();
    if (botInfo) {
      console.log('✅ Bot Info:', botInfo);
    }
    
    // Send test message
    const testMessage = '🧪 *Test Message*\n\nThis is a test from the Odessa Schedule Bot CLI.\n\nIf you see this, everything is working! 🎉';
    const messageSuccess = await bot.postMessage(testMessage);
    
    if (messageSuccess) {
      console.log('✅ Test message sent successfully');
    } else {
      console.log('❌ Failed to send test message');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function runInteractiveBot() {
  console.log('🤖 Starting interactive bot...');
  
  const token = process.env['TELEGRAM_BOT_TOKEN'];
  const chatId = process.env['TELEGRAM_CHAT_ID'];
  
  if (!token || !chatId) {
    console.error('❌ Missing environment variables:');
    console.error('   TELEGRAM_BOT_TOKEN:', token ? '✅ Set' : '❌ Missing');
    console.error('   TELEGRAM_CHAT_ID:', chatId ? '✅ Set' : '❌ Missing');
    return;
  }
  
  try {
    console.log('🚀 Starting Odessa Schedule Bot...');
    console.log('📱 Bot is now listening for commands:');
    console.log('   • /schedule - Get the current week\'s schedule');
    console.log('   • /start - Welcome message');
    console.log('   • /help - Show help information');
    console.log('');
    console.log('💡 The bot will respond to commands in:');
    console.log('   • Direct messages to the bot');
    console.log('   • Group chats where the bot is added');
    console.log('');
    console.log('⏹️  Press Ctrl+C to stop the bot');
    console.log('=' .repeat(50));
    
    const bot = new OdessaTelegramBot(token, chatId);
    
    // Test connection first
    const connectionSuccess = await bot.testConnection();
    if (!connectionSuccess) {
      console.log('❌ Bot connection failed. Please check your TELEGRAM_BOT_TOKEN');
      return;
    }
    
    const botInfo = await bot.getBotInfo();
    if (botInfo) {
      console.log(`✅ Bot connected: @${botInfo.username} (ID: ${botInfo.id})`);
    }
    
    console.log('✅ Bot is now running and listening for commands!');
    console.log('');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping bot...');
      await bot.stop();
      console.log('✅ Bot stopped successfully');
      process.exit(0);
    });
    
    // Keep the process alive
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Failed to start interactive bot:', error);
  }
}

// Run the CLI
main().catch(console.error); 