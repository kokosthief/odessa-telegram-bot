import { OdessaTelegramBot } from './telegram/bot';

async function testTelegramBot() {
  console.log('🧪 Testing Telegram Bot integration...');
  
  // Get environment variables
  const token = process.env['TELEGRAM_BOT_TOKEN'];
  const chatId = process.env['TELEGRAM_CHAT_ID'];
  
  if (!token || !chatId) {
    console.error('❌ Missing environment variables:');
    console.error('   TELEGRAM_BOT_TOKEN:', token ? '✅ Set' : '❌ Missing');
    console.error('   TELEGRAM_CHAT_ID:', chatId ? '✅ Set' : '❌ Missing');
    console.log('\n📝 Please set these in your .env file:');
    console.log('   TELEGRAM_BOT_TOKEN=your_bot_token_here');
    console.log('   TELEGRAM_CHAT_ID=your_chat_id_here');
    return;
  }
  
  try {
    const bot = new OdessaTelegramBot(token, chatId);
    
    console.log('1. Testing bot connection...');
    const connectionSuccess = await bot.testConnection();
    
    if (!connectionSuccess) {
      console.error('❌ Bot connection failed. Please check your token.');
      return;
    }
    
    console.log('2. Getting bot info...');
    const botInfo = await bot.getBotInfo();
    if (botInfo) {
      console.log('✅ Bot Info:', botInfo);
    }
    
    console.log('3. Testing message posting...');
    const testMessage = '🧪 *Test Message*\n\nThis is a test message from the Odessa Schedule Bot.\n\nIf you see this, the bot is working correctly! 🎉';
    
    const messageSuccess = await bot.postMessage(testMessage);
    
    if (messageSuccess) {
      console.log('✅ Test message posted successfully');
      
      console.log('4. Testing schedule generation and posting...');
      const scheduleSuccess = await bot.postWeeklySchedule();
      
      if (scheduleSuccess) {
        console.log('✅ Weekly schedule posted successfully');
      } else {
        console.log('❌ Failed to post weekly schedule');
      }
    } else {
      console.log('❌ Failed to post test message');
    }
    
    console.log('\n🎉 Telegram Bot test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTelegramBot(); 