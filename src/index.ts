import { HipsyScraper } from './scrapers/hipsy-scraper';
import { WhosPlayingFormatter } from './formatters/whosplaying-formatter';

export class OdessaTodayGenerator {
  private scraper: HipsyScraper;
  private formatter: WhosPlayingFormatter;

  constructor() {
    this.scraper = new HipsyScraper();
    this.formatter = new WhosPlayingFormatter();
  }

  /**
   * Generate enhanced today's schedule with Wix DJ data
   */
  async generateEnhancedTodaySchedule(): Promise<{ text: string; photos?: string[]; keyboard?: any }> {
    try {
      console.log('🎭 ENHANCED METHOD CALLED - Generating enhanced today\'s schedule...');
      
      // Get today's date
      const today = new Date();
      console.log(`📅 Looking for events on: ${today.toDateString()}`);
      
      // Get events for today using the existing method
      const result = await this.scraper.getEvents(1, 'upcoming', 10);
      
      if (!result.success) {
        throw new Error('Failed to fetch events from Hipsy');
      }
      
      // Filter events for today only
      const todayEvents = result.events.filter(event => {
        const eventDate = new Date(event.date);
        
        // Normalize dates to compare only the date part (ignore time)
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return eventDateOnly.getTime() === todayOnly.getTime();
      });
      
      console.log(`📊 Found ${todayEvents.length} events for today`);
      
      if (todayEvents.length === 0) {
        console.log('❌ No events found for today');
        return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
      }
      
      // Format today's events with enhanced DJ info
      const formattedToday = await this.formatter.formatEnhancedTodaySchedule(todayEvents);
      
      console.log('Enhanced today\'s schedule generated successfully');
      return formattedToday;
      
    } catch (error) {
      console.error('Error generating enhanced today schedule:', error);
      throw new Error(`Failed to generate today's schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate schedule for today only (legacy method for backward compatibility)
   */
  async generateTodaySchedule(): Promise<{ text: string; keyboard?: any }> {
    try {
      console.log('Generating today\'s schedule...');
      
      // Get today's date
      const today = new Date();
      console.log(`📅 Looking for events on: ${today.toDateString()}`);
      
      // Get events for today using the existing method
      const result = await this.scraper.getEvents(1, 'upcoming', 10);
      
      if (!result.success) {
        throw new Error('Failed to fetch events from Hipsy');
      }
      
      // Filter events for today only
      const todayEvents = result.events.filter(event => {
        const eventDate = new Date(event.date);
        
        // Normalize dates to compare only the date part (ignore time)
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return eventDateOnly.getTime() === todayOnly.getTime();
      });
      
      console.log(`📊 Found ${todayEvents.length} events for today`);
      
      if (todayEvents.length === 0) {
        console.log('❌ No events found for today');
        return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
      }
      
      // Format today's events
      const formattedToday = this.formatter.formatTodaySchedule(todayEvents);
      
      console.log('Today\'s schedule generated successfully');
      return formattedToday;
      
    } catch (error) {
      console.error('Error generating today schedule:', error);
      throw new Error(`Failed to generate today's schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// CLI interface for testing
if (require.main === module) {
  const generator = new OdessaTodayGenerator();
  
  console.log('Testing enhanced today schedule generation...');
  generator.generateEnhancedTodaySchedule()
    .then(schedule => {
      console.log('Generated Enhanced Schedule:');
      console.log(schedule);
    })
    .catch(error => {
      console.error('Error:', error);
    });
} 