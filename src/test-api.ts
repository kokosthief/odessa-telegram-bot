import { HipsyScraper } from './scrapers/hipsy-scraper';

async function testHipsyAPI() {
  console.log('🧪 Testing Hipsy.nl API integration...');
  
  try {
    const scraper = new HipsyScraper();
    
    // Test basic API call
    console.log('1. Testing basic API call...');
    const result = await scraper.getEvents(1, 'upcoming', 10);
    
    if (result.success) {
      console.log(`✅ Successfully fetched ${result.events.length} events`);
      
      if (result.events.length > 0) {
        console.log('\n📋 Sample events:');
        result.events.slice(0, 3).forEach((event, index) => {
          console.log(`${index + 1}. ${event.title}`);
          console.log(`   Date: ${event.date}`);
          console.log(`   DJ: ${event.djName || 'Not detected'}`);
          console.log(`   Type: ${event.eventType || 'Not classified'}`);
          console.log(`   Ticket URL: ${event.ticketUrl}`);
          console.log('');
        });
      } else {
        console.log('⚠️  No events found');
      }
    } else {
      console.log(`❌ API call failed: ${result.error}`);
    }
    
    // Test week filtering
    console.log('2. Testing week filtering...');
    const weekEvents = await scraper.getEventsForWeek(new Date());
    console.log(`✅ Found ${weekEvents.length} events for this week`);
    
    if (weekEvents.length > 0) {
      console.log('\n📅 This week\'s events:');
      weekEvents.forEach((event, index) => {
        const date = new Date(event.date);
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        console.log(`${index + 1}. ${dayName}: ${event.title} (${event.djName || 'TBA'})`);
      });
    }
    
    console.log('\n🎉 API integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testHipsyAPI(); 