import { HipsyScraper } from './scrapers/hipsy-scraper';
import { ScheduleFormatter } from './formatters/schedule-formatter';

export class OdessaScheduleGenerator {
  private scraper: HipsyScraper;
  private formatter: ScheduleFormatter;

  constructor() {
    this.scraper = new HipsyScraper();
    this.formatter = new ScheduleFormatter();
  }

  /**
   * Generate schedule for the current week
   */
  async generateSchedule(): Promise<string> {
    try {
      console.log('Starting schedule generation...');
      
      // Get events for upcoming week (next Wednesday to Sunday)
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7); // Look at next week
      const events = await this.scraper.getEventsForWeek(nextWeek);
      
      if (events.length === 0) {
        console.log('No events found for this week');
        return 'No events found for this week.';
      }
      
      console.log(`Found ${events.length} events for this week`);
      
      // Format the schedule
      const formattedSchedule = this.formatter.formatScheduleWithDJLinks(events);
      
      console.log('Schedule generated successfully');
      return formattedSchedule;
      
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw new Error(`Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate schedule for a specific week
   */
  async generateScheduleForWeek(startDate: Date): Promise<string> {
    try {
      console.log(`Generating schedule for week starting ${startDate.toISOString()}`);
      
      const events = await this.scraper.getEventsForWeek(startDate);
      
      if (events.length === 0) {
        return `No events found for the week of ${startDate.toDateString()}.`;
      }
      
      const formattedSchedule = this.formatter.formatScheduleWithDJLinks(events);
      return formattedSchedule;
      
    } catch (error) {
      console.error('Error generating schedule for specific week:', error);
      throw new Error(`Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate enhanced today's schedule with Wix DJ data
   */
  async generateEnhancedTodaySchedule(): Promise<{ text: string; photos?: string[]; keyboard?: any }> {
    try {
      console.log('Generating enhanced today\'s schedule...');
      
      const today = new Date();
      
      // Get events from the scraper directly
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
      
      if (todayEvents.length === 0) {
        return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
      }
      
      console.log(`Found ${todayEvents.length} events for today`);
      
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
      
      const today = new Date();
      
      // Get events from the scraper directly
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
      
      if (todayEvents.length === 0) {
        return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
      }
      
      console.log(`Found ${todayEvents.length} events for today`);
      
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

// Export for use in API routes

// For direct usage
if (require.main === module) {
  const generator = new OdessaScheduleGenerator();
  
  generator.generateSchedule()
    .then(schedule => {
      console.log('Generated Schedule:');
      console.log(schedule);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
} 