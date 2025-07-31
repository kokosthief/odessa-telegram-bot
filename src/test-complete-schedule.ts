import { OdessaScheduleGenerator } from './index';

async function testCompleteSchedule() {
  console.log('🧪 Testing complete schedule generation with real data...');
  
  try {
    const generator = new OdessaScheduleGenerator();
    
    console.log('1. Generating schedule for this week...');
    const schedule = await generator.generateSchedule();
    
    console.log('\n📋 Generated Schedule:');
    console.log('=' .repeat(50));
    console.log(schedule);
    console.log('=' .repeat(50));
    
    console.log('\n2. Testing DJ link integration...');
    // The schedule should include DJ links for DJs in our database
    if (schedule.includes('🎵') || schedule.includes('🎧') || schedule.includes('🌐')) {
      console.log('✅ DJ links are included in the schedule');
    } else {
      console.log('⚠️  No DJ links found in schedule');
    }
    
    console.log('\n🎉 Complete schedule generation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCompleteSchedule(); 