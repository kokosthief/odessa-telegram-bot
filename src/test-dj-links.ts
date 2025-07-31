import { DJLoader } from './utils/dj-loader';

async function testDJLinks() {
  console.log('🧪 Testing DJ link formatting...');
  
  try {
    const djLoader = new DJLoader();
    
    // Test a few DJs
    const testDJs = ['Jethro', 'Samaya', 'Henners', 'Inphiknight', 'Divana', 'Yarl'];
    
    console.log('\n📋 DJ Link Tests:');
    testDJs.forEach(djName => {
      const djInfo = djLoader.getDJInfo(djName);
      if (djInfo && djInfo.link && djInfo.link.trim() !== '') {
        const link = djInfo.link;
        let platform, emoji;
        
        if (link.includes('soundcloud.com')) {
          platform = 'SoundCloud';
          emoji = '🎵';
        } else if (link.includes('mixcloud.com')) {
          platform = 'MixCloud';
          emoji = '🎧';
        } else {
          platform = 'Website';
          emoji = '🌐';
        }
        console.log(`✅ ${djName}: ${emoji} [${platform}](${link})`);
      } else {
        console.log(`⚠️  ${djName}: No link available`);
      }
    });
    
    // Test total DJ count
    const allDJs = djLoader.getAllDJNames();
    console.log(`\n📊 Total DJs in database: ${allDJs.length}`);
    
    // Show all DJs with their actual platforms
    console.log('\n🎵 All DJs with their platforms:');
    allDJs.forEach(djName => {
      const djInfo = djLoader.getDJInfo(djName);
      if (djInfo && djInfo.link && djInfo.link.trim() !== '') {
        const link = djInfo.link;
        let platform;
        
        if (link.includes('soundcloud.com')) {
          platform = 'SoundCloud';
        } else if (link.includes('mixcloud.com')) {
          platform = 'MixCloud';
        } else {
          platform = 'Website';
        }
        console.log(`  • ${djName} (${platform})`);
      } else {
        console.log(`  • ${djName} (No link)`);
      }
    });
    
    console.log('\n🎉 DJ link formatting test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDJLinks(); 