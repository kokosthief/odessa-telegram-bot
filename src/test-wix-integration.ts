import { WixDJLoader } from './utils/wix-dj-loader';

async function testWixIntegration() {
  console.log('🧪 Testing Wix API Integration...\n');

  const wixLoader = new WixDJLoader();

  // Test connection
  console.log('1. Testing Wix API connection...');
  const connectionOk = await wixLoader.testConnection();
  console.log(`   Connection: ${connectionOk ? '✅ OK' : '❌ Failed'}\n`);

  if (!connectionOk) {
    console.log('⚠️  Wix API connection failed. Check your environment variables:');
    console.log('   - WIX_API_KEY');
    console.log('   - WIX_SITE_ID');
    console.log('\nFalling back to JSON data will still work.');
    return;
  }

  // Test DJ lookups
  const testDJs = ['Anica', 'Henners', 'Yarl', 'Unknown DJ'];
  
  for (const djName of testDJs) {
    console.log(`2. Testing DJ lookup for "${djName}"...`);
    
    try {
      const djInfo = await wixLoader.getDJInfoWithFallback(djName);
      
      if (djInfo) {
        console.log(`   ✅ Found DJ info:`);
        console.log(`      Name: ${djInfo.name}`);
        console.log(`      Photo: ${djInfo.photo ? '✅ Available' : '❌ Not available'}`);
        console.log(`      Description: ${djInfo.shortDescription ? '✅ Available' : '❌ Not available'}`);
        console.log(`      SoundCloud: ${djInfo.soundcloudUrl ? '✅ Available' : '❌ Not available'}`);
        console.log(`      Instagram: ${djInfo.instagramUrl ? '✅ Available' : '❌ Not available'}`);
        console.log(`      Website: ${djInfo.website ? '✅ Available' : '❌ Not available'}`);
      } else {
        console.log(`   ❌ No DJ info found for "${djName}"`);
      }
    } catch (error) {
      console.log(`   ❌ Error looking up "${djName}": ${error}`);
    }
    
    console.log('');
  }

  // Test cache
  console.log('3. Testing cache functionality...');
  const cacheStats = wixLoader.getCacheStats();
  console.log(`   Cache size: ${cacheStats.size}`);
  console.log(`   Cached DJs: ${cacheStats.keys.join(', ')}`);
  
  // Test cache clearing
  wixLoader.clearCache();
  const clearedStats = wixLoader.getCacheStats();
  console.log(`   After clearing: ${clearedStats.size} items`);
  
  console.log('\n✅ Wix integration test completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWixIntegration()
    .then(() => {
      console.log('\n🎉 All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export { testWixIntegration }; 