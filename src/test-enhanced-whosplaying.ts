import { OdessaScheduleGenerator } from './index';

async function testEnhancedWhosplaying() {
  console.log('🧪 Testing Enhanced /whosplaying Command...\n');

  const generator = new OdessaScheduleGenerator();

  try {
    console.log('1. Generating enhanced today\'s schedule...');
    const enhancedSchedule = await generator.generateEnhancedTodaySchedule();
    
    console.log('✅ Enhanced schedule generated successfully!');
    console.log('\n📋 Schedule Details:');
    console.log(`   Text length: ${enhancedSchedule.text.length} characters`);
    console.log(`   Photos: ${enhancedSchedule.photos ? enhancedSchedule.photos.length : 0} photos`);
    console.log(`   Keyboard: ${enhancedSchedule.keyboard ? 'Available' : 'Not available'}`);
    
    console.log('\n📝 Schedule Text:');
    console.log('─'.repeat(50));
    console.log(enhancedSchedule.text);
    console.log('─'.repeat(50));
    
    if (enhancedSchedule.photos && enhancedSchedule.photos.length > 0) {
      console.log('\n📸 Photos:');
      enhancedSchedule.photos.forEach((photo, index) => {
        console.log(`   ${index + 1}. ${photo.substring(0, 50)}...`);
      });
    }
    
    if (enhancedSchedule.keyboard) {
      console.log('\n⌨️  Keyboard:');
      console.log(`   Buttons: ${enhancedSchedule.keyboard.inline_keyboard.length}`);
      enhancedSchedule.keyboard.inline_keyboard.forEach((row: any[], rowIndex: number) => {
        row.forEach((button: any, buttonIndex: number) => {
          console.log(`   Row ${rowIndex + 1}, Button ${buttonIndex + 1}: ${button.text}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error generating enhanced schedule:', error);
    throw error;
  }

  // Test fallback to legacy method
  console.log('\n2. Testing legacy schedule generation (fallback)...');
  try {
    const legacySchedule = await generator.generateTodaySchedule();
    console.log('✅ Legacy schedule generated successfully!');
    console.log(`   Text length: ${legacySchedule.text.length} characters`);
    console.log(`   Keyboard: ${legacySchedule.keyboard ? 'Available' : 'Not available'}`);
  } catch (error) {
    console.error('❌ Error generating legacy schedule:', error);
  }

  console.log('\n✅ Enhanced /whosplaying test completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEnhancedWhosplaying()
    .then(() => {
      console.log('\n🎉 All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export { testEnhancedWhosplaying }; 