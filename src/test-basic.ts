import { OdessaScheduleGenerator } from './index';
import { DJLoader } from './utils/dj-loader';

async function testBasicSetup() {
  console.log('🧪 Testing basic setup...');
  
  try {
    // Test DJ loader
    console.log('1. Testing DJ loader...');
    const djLoader = new DJLoader();
    const djData = djLoader.loadDJData();
    console.log('✅ DJ data loaded:', Object.keys(djData).length, 'DJs found');
    
    // Test DJ lookup
    const jethroInfo = djLoader.getDJInfo('Jethro');
    console.log('✅ DJ lookup test:', jethroInfo ? 'Jethro found' : 'Jethro not found');
    
    // Test schedule formatter (without scraping)
    console.log('2. Testing schedule formatter...');
    new OdessaScheduleGenerator();
    console.log('✅ Schedule generator created successfully');
    
    console.log('🎉 Basic setup test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the scraper with real Hipsy.nl data');
    console.log('2. Add Telegram integration');
    console.log('3. Deploy to Vercel');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBasicSetup(); 