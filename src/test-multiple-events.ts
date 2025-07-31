import { ScheduleFormatter } from './formatters/schedule-formatter';
import { Event } from './types/event';

async function testMultipleEvents() {
  console.log('🧪 Testing multiple events on same day formatting...');
  
  // Create test events for the same day (Sunday)
  const testEvents: Event[] = [
    {
      id: '1',
      title: 'Morning Ecstatic Dance',
      date: '2024-01-07T10:00:00Z', // Sunday morning
      ticketUrl: 'https://example.com/ticket1',
      originalDate: '2024-01-07T10:00:00Z',
      djName: 'Leela',
      eventType: 'ED'
    },
    {
      id: '2',
      title: 'Queerstatic',
      date: '2024-01-07T19:00:00Z', // Sunday evening
      ticketUrl: 'https://example.com/ticket2',
      originalDate: '2024-01-07T19:00:00Z',
      djName: 'Inphiknight',
      eventType: 'Queerstatic'
    }
  ];
  
  const formatter = new ScheduleFormatter();
  
  // Group events by day
  const eventsByDay: { [key: string]: Event[] } = {};
  eventsByDay['Sun'] = testEvents;
  
  console.log('\n📋 Test Events:');
  testEvents.forEach(event => {
    console.log(`  • ${event.title} (${event.eventType}) with ${event.djName}`);
  });
  
  // Test the formatting
  const formattedLines = formatter['formatScheduleLines'](eventsByDay);
  
  console.log('\n📋 Formatted Output:');
  console.log('=' .repeat(50));
  console.log(formattedLines);
  console.log('=' .repeat(50));
  
  // Test with a complete schedule
  const completeSchedule = formatter.formatScheduleWithDJLinks(testEvents);
  
  console.log('\n📋 Complete Schedule:');
  console.log('=' .repeat(50));
  console.log(completeSchedule);
  console.log('=' .repeat(50));
}

testMultipleEvents().catch(console.error); 