import { WixDJLoader } from './utils/wix-dj-loader';

async function debugWixIntegration() {
  console.log('🔍 Debugging Wix Integration...\n');

  // Check environment variables
  console.log('1. Checking environment variables...');
  const wixApiKey = process.env['WIX_API_KEY'];
  const wixSiteId = process.env['WIX_SITE_ID'];
  
  console.log(`   WIX_API_KEY: ${wixApiKey ? '✅ Set' : '❌ Not set'}`);
  console.log(`   WIX_SITE_ID: ${wixSiteId ? '✅ Set' : '❌ Not set'}`);
  
  if (!wixApiKey || !wixSiteId) {
    console.log('\n⚠️  Wix environment variables are not set!');
    console.log('Please add these to your Vercel environment variables:');
    console.log('   WIX_API_KEY=your_api_key_here');
    console.log('   WIX_SITE_ID=your_site_id_here');
    return;
  }

  const wixLoader = new WixDJLoader();

  // Test connection
  console.log('\n2. Testing Wix API connection...');
  try {
    const connectionOk = await wixLoader.testConnection();
    console.log(`   Connection: ${connectionOk ? '✅ OK' : '❌ Failed'}`);
    
    if (!connectionOk) {
      console.log('\n❌ Wix API connection failed. Possible issues:');
      console.log('   - Invalid API key');
      console.log('   - Invalid site ID');
      console.log('   - Network connectivity issues');
      console.log('   - Wix API service down');
      return;
    }
  } catch (error) {
    console.log(`   ❌ Connection error: ${error}`);
    return;
  }

  // Test DJ lookup
  console.log('\n3. Testing DJ lookup...');
  try {
    const testDJ = 'Anica'; // Use a DJ that should exist
    console.log(`   Looking up DJ: "${testDJ}"`);
    
    const djInfo = await wixLoader.getEnhancedDJInfo(testDJ);
    
    if (djInfo) {
      console.log('   ✅ Found DJ in Wix:');
      console.log(`      Name: ${djInfo.name}`);
      console.log(`      Photo: ${djInfo.photo ? 'Available' : 'Not available'}`);
      console.log(`      Description: ${djInfo.shortDescription ? 'Available' : 'Not available'}`);
    } else {
      console.log('   ❌ DJ not found in Wix');
    }
  } catch (error) {
    console.log(`   ❌ DJ lookup error: ${error}`);
  }

  // Test fallback
  console.log('\n4. Testing fallback to JSON data...');
  try {
    const fallbackInfo = await wixLoader.getDJInfoWithFallback('Anica');
    
    if (fallbackInfo) {
      console.log('   ✅ Fallback working:');
      console.log(`      Name: ${fallbackInfo.name}`);
      console.log(`      SoundCloud: ${fallbackInfo.soundcloudUrl ? 'Available' : 'Not available'}`);
    } else {
      console.log('   ❌ Fallback not working');
    }
  } catch (error) {
    console.log(`   ❌ Fallback error: ${error}`);
  }

  console.log('\n✅ Debug completed!');
}

// Run the debug if this file is executed directly
if (require.main === module) {
  debugWixIntegration()
    .then(() => {
      console.log('\n🎉 Debug completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Debug failed:', error);
      process.exit(1);
    });
}

export { debugWixIntegration }; 