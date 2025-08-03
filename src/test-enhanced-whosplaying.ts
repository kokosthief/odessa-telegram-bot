#!/usr/bin/env node

import { WhosPlayingFormatter } from './formatters/whosplaying-formatter';
import { Event } from './types/event';

async function testEnhancedFormatting() {
  console.log('🧪 Testing Enhanced WhosPlaying Formatter...\n');

  const formatter = new WhosPlayingFormatter();

  // Test single event
  console.log('📋 Test 1: Single Event');
  const singleEvent: Event[] = [{
    id: '1',
    title: 'Ecstatic Dance with RubyDub',
    date: new Date().toISOString(),
    originalDate: new Date().toISOString(),
    ticketUrl: 'https://example.com/ticket1',
    djName: 'RubyDub',
    eventType: 'ED'
  }];

  const singleResult = await formatter.formatEnhancedTodaySchedule(singleEvent);
  console.log('Single Event Result:');
  console.log(singleResult.text);
  console.log('\n' + '='.repeat(50) + '\n');

  // Test multiple events with different DJs
  console.log('📋 Test 2: Multiple Events with Different DJs');
  const multipleEvents: Event[] = [
    {
      id: '1',
      title: 'Ecstatic Dance with Leela',
      date: new Date().toISOString(),
      originalDate: new Date().toISOString(),
      ticketUrl: 'https://example.com/ticket1',
      djName: 'Leela',
      eventType: 'ED'
    },
    {
      id: '2',
      title: 'Queerstatic with Inphiknight',
      date: new Date().toISOString(),
      originalDate: new Date().toISOString(),
      ticketUrl: 'https://example.com/ticket2',
      djName: 'Inphiknight',
      eventType: 'Queerstatic'
    }
  ];

  const multipleResult = await formatter.formatEnhancedTodaySchedule(multipleEvents);
  console.log('Multiple Events Result:');
  console.log(multipleResult.text);
  console.log('\n' + '='.repeat(50) + '\n');

  // Test multiple events with same DJ
  console.log('📋 Test 3: Multiple Events with Same DJ');
  const sameDJEvents: Event[] = [
    {
      id: '1',
      title: 'Ecstatic Dance with RubyDub',
      date: new Date().toISOString(),
      originalDate: new Date().toISOString(),
      ticketUrl: 'https://example.com/ticket1',
      djName: 'RubyDub',
      eventType: 'ED'
    },
    {
      id: '2',
      title: 'Cacao Ecstatic Dance with RubyDub',
      date: new Date().toISOString(),
      originalDate: new Date().toISOString(),
      ticketUrl: 'https://example.com/ticket2',
      djName: 'RubyDub',
      eventType: 'Cacao ED'
    }
  ];

  const sameDJResult = await formatter.formatEnhancedTodaySchedule(sameDJEvents);
  console.log('Same DJ Events Result:');
  console.log(sameDJResult.text);
  console.log('\n' + '='.repeat(50) + '\n');

  // Test event type formatting
  console.log('📋 Test 4: Event Type Formatting');
  const eventTypes = ['ED', 'Cacao ED', 'Live Music', 'Queerstatic', 'Unknown'];
  eventTypes.forEach(type => {
    const formatted = (formatter as any).formatEventType(type);
    console.log(`${type} → ${formatted}`);
  });
}

testEnhancedFormatting().catch(console.error); 