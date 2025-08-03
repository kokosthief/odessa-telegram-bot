#!/usr/bin/env ts-node

import { WeeklyScheduleGenerator } from './weekly-schedule-generator';

async function testWeeklySchedule() {
  console.log('🧪 Testing Weekly Schedule Generation...');
  
  try {
    const generator = new WeeklyScheduleGenerator();
    
    console.log('📋 Generating weekly schedule...');
    const weeklySchedule = await generator.generateWeeklySchedule();
    
    console.log('\n✅ Weekly Schedule Generated Successfully!');
    console.log('='.repeat(60));
    console.log('Video File ID:', weeklySchedule.videoFileId);
    console.log('='.repeat(60));
    console.log('Formatted Text:');
    console.log(weeklySchedule.text);
    console.log('='.repeat(60));
    console.log('Keyboard:', weeklySchedule.keyboard ? 'Available' : 'Not available');
    
    // Test the schedule format
    const lines = weeklySchedule.text.split('\n');
    console.log('\n📊 Schedule Analysis:');
    console.log(`- Total lines: ${lines.length}`);
    console.log(`- Contains video ID: ${weeklySchedule.videoFileId.length > 0 ? 'Yes' : 'No'}`);
    console.log(`- Contains title: ${weeklySchedule.text.includes('This Week') ? 'Yes' : 'No'}`);
    console.log(`- Contains days: ${weeklySchedule.text.includes('Wed:') && weeklySchedule.text.includes('Sun:') ? 'Yes' : 'No'}`);
    console.log(`- Contains tickets button: ${weeklySchedule.keyboard ? 'Yes' : 'No'}`);
    
    console.log('\n🎉 Weekly schedule test completed successfully!');
    
  } catch (error) {
    console.error('❌ Weekly schedule test failed:', error);
  }
}

// Run the test
testWeeklySchedule().catch(console.error); 