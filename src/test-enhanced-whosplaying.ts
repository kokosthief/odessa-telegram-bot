import { OdessaTodayGenerator } from './index';

async function testEnhancedWhosPlaying() {
  console.log('🧪 Testing Enhanced WhosPlaying functionality...\n');
  
  const generator = new OdessaTodayGenerator();
  
  try {
    console.log('1. Generating enhanced today\'s schedule...');
    const enhancedSchedule = await generator.generateEnhancedTodaySchedule();
    
    console.log('✅ Enhanced schedule generated successfully!');
    console.log('\n📋 Schedule Details:');
    console.log(`   Text length: ${enhancedSchedule.text.length} characters`);
    console.log(`   Photos: ${enhancedSchedule.photos ? enhancedSchedule.photos.length : 0} photos`);
    console.log(`   Keyboard: ${enhancedSchedule.keyboard ? 'Available' : 'Not available'}`);
    
    console.log('\n📝 Schedule Text:');
    console.log('='.repeat(50));
    console.log(enhancedSchedule.text);
    console.log('='.repeat(50));
    
    if (enhancedSchedule.photos && enhancedSchedule.photos.length > 0) {
      console.log('\n📸 Photos:');
      enhancedSchedule.photos.forEach((photo, index) => {
        console.log(`   ${index + 1}. ${photo}`);
      });
    }
    
    if (enhancedSchedule.keyboard) {
      console.log('\n⌨️  Keyboard Buttons:');
      console.log(`   Buttons: ${enhancedSchedule.keyboard.inline_keyboard.length}`);
      enhancedSchedule.keyboard.inline_keyboard.forEach((row: any[], rowIndex: number) => {
        row.forEach((button: any, buttonIndex: number) => {
          console.log(`   Row ${rowIndex + 1}, Button ${buttonIndex + 1}: ${button.text} -> ${button.url}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error generating enhanced schedule:', error);
  }
  
  try {
    console.log('\n2. Testing legacy schedule generation (fallback)...');
    const legacySchedule = await generator.generateTodaySchedule();
    console.log('✅ Legacy schedule generated successfully!');
    console.log(`   Text length: ${legacySchedule.text.length} characters`);
    console.log(`   Keyboard: ${legacySchedule.keyboard ? 'Available' : 'Not available'}`);
  } catch (error) {
    console.error('❌ Error generating legacy schedule:', error);
  }
}

testEnhancedWhosPlaying().catch(console.error); 