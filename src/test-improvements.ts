#!/usr/bin/env node

import { WhosPlayingFormatter } from './formatters/whosplaying-formatter';
import { HipsyScraper } from './scrapers/hipsy-scraper';
import { Event } from './types/event';

async function testImprovements() {
  console.log('🧪 Testing All Improvements...\n');

  const formatter = new WhosPlayingFormatter();
  const scraper = new HipsyScraper();

  // Test 1: Sunday event should be "Morning Ecstatic Dance"
  console.log('📋 Test 1: Sunday Event Classification');
  const sundayEvent: Event = {
    id: '1',
    title: 'Ecstatic Dance with Leela',
    date: '2025-08-03T10:00:00Z', // Sunday August 3rd
    originalDate: '2025-08-03T10:00:00Z',
    ticketUrl: 'https://example.com/ticket1',
    djName: 'Leela',
    eventType: 'ED'
  };

  const sundayEventType = (formatter as any).formatEventType('ED', sundayEvent.date);
  console.log(`Sunday event type: ${sundayEventType}`);
  console.log('Expected: Morning Ecstatic Dance');
  console.log('✅' + (sundayEventType === 'Morning Ecstatic Dance' ? ' PASS' : ' FAIL'));

  // Test 2: Weekday event should be "Ecstatic Dance"
  console.log('\n📋 Test 2: Weekday Event Classification');
  const weekdayEvent: Event = {
    id: '2',
    title: 'Ecstatic Dance with RubyDub',
    date: '2025-08-05T18:00:00Z', // Tuesday August 5th
    originalDate: '2025-08-05T18:00:00Z',
    ticketUrl: 'https://example.com/ticket2',
    djName: 'RubyDub',
    eventType: 'ED'
  };

  const weekdayEventType = (formatter as any).formatEventType('ED', weekdayEvent.date);
  console.log(`Weekday event type: ${weekdayEventType}`);
  console.log('Expected: Ecstatic Dance');
  console.log('✅' + (weekdayEventType === 'Ecstatic Dance' ? ' PASS' : ' FAIL'));

  // Test 3: URL conversion
  console.log('\n📋 Test 3: URL Conversion');
  const apiUrl = 'https://api.hipsy.nl/shop/128407-queerstatic-dance-inphiknight';
  const publicUrl = (scraper as any).convertToPublicUrl(apiUrl);
  console.log(`API URL: ${apiUrl}`);
  console.log(`Public URL: ${publicUrl}`);
  console.log('Expected: https://hipsy.nl/event/128407-queerstatic-dance-inphiknight');
  console.log('✅' + (publicUrl === 'https://hipsy.nl/event/128407-queerstatic-dance-inphiknight' ? ' PASS' : ' FAIL'));

  // Test 4: Multiple events with capitalized Today
  console.log('\n📋 Test 4: Multiple Events with Capitalized Today');
  const multipleEvents: Event[] = [
    {
      id: '1',
      title: 'Morning Ecstatic Dance with Leela',
      date: '2025-08-03T10:00:00Z', // Sunday
      originalDate: '2025-08-03T10:00:00Z',
      ticketUrl: 'https://example.com/ticket1',
      djName: 'Leela',
      eventType: 'ED'
    },
    {
      id: '2',
      title: 'Queerstatic with Inphiknight',
      date: '2025-08-03T18:00:00Z', // Sunday evening
      originalDate: '2025-08-03T18:00:00Z',
      ticketUrl: 'https://example.com/ticket2',
      djName: 'Inphiknight',
      eventType: 'Queerstatic'
    }
  ];

  const result = await formatter.formatEnhancedTodaySchedule(multipleEvents);
  console.log('Intro text:');
  console.log(result.text);
  console.log('✅' + (result.text.includes('Today') ? ' PASS (capitalized)' : ' FAIL (not capitalized)'));

  if (result.messages) {
    console.log('\nIndividual messages:');
    result.messages.forEach((message, index) => {
      console.log(`Message ${index + 1}: ${message.text}`);
      if (message.keyboard) {
        const buttonText = message.keyboard.inline_keyboard[0][0].text;
        console.log(`Button text: ${buttonText}`);
        console.log('✅' + (buttonText === 'TICKETS 🎟️' ? ' PASS (simple ticket text)' : ' FAIL (complex ticket text)'));
      }
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 All tests completed!');
}

testImprovements().catch(console.error); 