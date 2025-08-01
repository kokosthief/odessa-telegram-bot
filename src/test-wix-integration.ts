import { WixAPIService } from './services/wix-api';

async function testWixIntegration() {
  console.log('🧪 Testing Wix API integration...');
  
  const wixService = new WixAPIService();
  
  // Check if Wix API is configured
  if (!wixService.isConfigured()) {
    console.log('❌ Wix API not configured. Please set WIX_API_KEY in your environment variables.');
    console.log('📝 To configure:');
    console.log('   1. Get your Wix API key from Developer Tools → API Keys');
    console.log('   2. Add WIX_API_KEY=your_key_here to your .env file');
    console.log('   3. The WIX_SITE_ID is already set to your site ID');
    return;
  }
  
  try {
    // Test fetching all DJs
    console.log('1. Testing DJ data fetch...');
    const djs = await wixService.getDJs();
    
    if (djs.length === 0) {
      console.log('❌ No DJs found in Wix CMS');
      console.log('📝 Make sure your "Team" collection has DJ data with fields:');
      console.log('   - name (required)');
      console.log('   - description (optional)');
      console.log('   - image (optional)');
      console.log('   - soundcloudUrl (optional)');
      console.log('   - mixcloudUrl (optional)');
      console.log('   - instagramUrl (optional)');
      console.log('   - bio (optional)');
      return;
    }
    
    console.log(`✅ Successfully fetched ${djs.length} DJs from Wix CMS`);
    
    // Show sample DJ data
    console.log('\n📋 Sample DJ data:');
    djs.slice(0, 3).forEach((dj, index) => {
      console.log(`${index + 1}. ${dj.name}`);
      console.log(`   Description: ${dj.description || 'N/A'}`);
      console.log(`   SoundCloud: ${dj.soundcloudUrl || 'N/A'}`);
      console.log(`   Image: ${dj.image || 'N/A'}`);
      console.log('');
    });
    
    // Test DJ lookup by name
    console.log('2. Testing DJ lookup by name...');
    const testDJName = djs[0]?.name || 'Samaya';
    const foundDJ = await wixService.getDJByName(testDJName);
    
    if (foundDJ) {
      console.log(`✅ Found DJ: ${foundDJ.name}`);
      console.log(`   Description: ${foundDJ.description || 'N/A'}`);
      console.log(`   SoundCloud: ${foundDJ.soundcloudUrl || 'N/A'}`);
    } else {
      console.log(`❌ Could not find DJ: ${testDJName}`);
    }
    
    console.log('\n🎉 Wix API integration test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Wix integration:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your WIX_API_KEY is correct');
    console.log('   2. Verify your site ID is correct');
    console.log('   3. Ensure your "Team" collection exists and has data');
    console.log('   4. Check Wix API permissions');
  }
}

// Run the test
testWixIntegration().catch(console.error); 