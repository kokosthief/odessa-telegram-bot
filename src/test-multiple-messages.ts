#!/usr/bin/env node

import { WhosPlayingFormatter } from './formatters/whosplaying-formatter';
import { Event } from './types/event';

async function testMultipleMessages() {
  console.log('🧪 Testing Multiple Messages for Multiple DJs...\n');

  const formatter = new WhosPlayingFormatter();

  // Test multiple events with different DJs (like your Leela & Inphiknight example)
  console.log('📋 Test: Multiple Events with Different DJs');
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

  const result = await formatter.formatEnhancedTodaySchedule(multipleEvents);
  
  console.log('📝 Intro Message:');
  console.log(result.text);
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (result.messages) {
    console.log(`📸 Individual Messages (${result.messages.length}):`);
    result.messages.forEach((message, index) => {
      console.log(`\n--- Message ${index + 1} ---`);
      console.log(`Text: ${message.text}`);
      console.log(`Photo: ${message.photo ? 'YES' : 'NO'}`);
      console.log(`Photo URL: ${message.photo || 'NONE'}`);
      console.log(`Keyboard: ${message.keyboard ? 'YES' : 'NO'}`);
      if (message.keyboard) {
        console.log(`Buttons: ${message.keyboard.inline_keyboard[0].length}`);
        message.keyboard.inline_keyboard[0].forEach((button: any, btnIndex: number) => {
          console.log(`  Button ${btnIndex + 1}: ${button.text} -> ${button.url}`);
        });
      }
    });
  } else {
    console.log('❌ No individual messages found');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test single event to ensure backward compatibility
  console.log('📋 Test: Single Event (Backward Compatibility)');
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
  console.log(`Text: ${singleResult.text}`);
  console.log(`Photos: ${singleResult.photos ? singleResult.photos.length : 0}`);
  console.log(`Messages: ${singleResult.messages ? singleResult.messages.length : 0}`);
  console.log(`Keyboard: ${singleResult.keyboard ? 'YES' : 'NO'}`);
}

testMultipleMessages().catch(console.error); 