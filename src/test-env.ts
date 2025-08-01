import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Variables Test');
console.log('=============================');
console.log(`WIX_API_KEY: ${process.env['WIX_API_KEY'] ? 'SET' : 'NOT SET'}`);
console.log(`WIX_SITE_ID: ${process.env['WIX_SITE_ID'] ? 'SET' : 'NOT SET'}`);
console.log(`TELEGRAM_BOT_TOKEN: ${process.env['TELEGRAM_BOT_TOKEN'] ? 'SET' : 'NOT SET'}`);
console.log(`TELEGRAM_CHAT_ID: ${process.env['TELEGRAM_CHAT_ID'] ? 'SET' : 'NOT SET'}`);

if (process.env['WIX_API_KEY']) {
  console.log(`\n✅ WIX_API_KEY is set (length: ${process.env['WIX_API_KEY']?.length})`);
  console.log(`   First 20 chars: ${process.env['WIX_API_KEY']?.substring(0, 20)}...`);
} else {
  console.log('\n❌ WIX_API_KEY is not set');
  console.log('📝 Make sure your .env file contains:');
  console.log('   WIX_API_KEY=your_actual_api_key_here');
} 