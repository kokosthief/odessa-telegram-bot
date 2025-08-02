import { HipsyScraper } from './scrapers/hipsy-scraper';
import { ScheduleFormatter } from './formatters/schedule-formatter';
// import { Event } from './types/event';

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
      
      // Fetch ALL events (past, present, future) to ensure we get the complete week
      console.log('🔍 Fetching ALL events (past + upcoming)...');
      const allResult = await this.scraper.getEvents(1, 'all', 50); // Fetch more events
      console.log(`📅 All events result: ${allResult.success ? 'SUCCESS' : 'FAILED'}, found ${allResult.events.length} events`);
      
      if (!allResult.success) {
        console.error('❌ Failed to fetch events:', allResult.error);
        throw new Error('Failed to fetch events from Hipsy');
      }
      
      if (allResult.events.length === 0) {
        return 'No events found for this week.';
      }
      
      console.log(`📊 Total events found: ${allResult.events.length}`);
      
      // Debug: Show current date
      const now = new Date();
      console.log(`🕐 System current date: ${now.toDateString()}`);
      console.log(`🕐 System current time: ${now.toTimeString()}`);
      
      // Log all events for debugging
      allResult.events.forEach((event, index) => {
        const eventDate = new Date(event.date);
        console.log(`📋 Event ${index + 1}: "${event.title}" on ${eventDate.toDateString()} (${event.djName}) - ${event.eventType}`);
      });
      
      // Show date range of events
      if (allResult.events.length > 0) {
        const firstEvent = new Date(allResult.events[0]?.date || '');
        const lastEvent = new Date(allResult.events[allResult.events.length - 1]?.date || '');
        console.log(`📅 Event date range: ${firstEvent.toDateString()} to ${lastEvent.toDateString()}`);
      }
      
      // Filter to current week only (Wednesday to Sunday)
      // TEMPORARY: Don't filter by week, just show all events to debug
      console.log(`🎯 TEMPORARY: Showing ALL events without week filtering`);
      const currentWeekEvents = allResult.events; // Don't filter for now
      
      console.log(`🎯 Showing ${currentWeekEvents.length} events (no filtering)`);
      
      // Log filtered events
      currentWeekEvents.forEach((event, index) => {
        const eventDate = new Date(event.date);
        console.log(`✅ Event ${index + 1}: "${event.title}" on ${eventDate.toDateString()} (${event.djName}) - ${event.eventType}`);
      });
      
      // Format the schedule
      const formattedSchedule = await this.formatter.formatScheduleWithDJLinks(currentWeekEvents);
      
      console.log('Schedule generated successfully');
      return formattedSchedule;
      
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw new Error(`Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Filter events to current week (Wednesday to Sunday)
   */
  /*
  private filterToCurrentWeek(events: Event[], today: Date): Event[] {
    // Get the start of the current week (Wednesday)
    const startOfWeek = this.getStartOfWeek(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Sunday (Wednesday + 4 days)
    
    console.log(`🔍 Current date: ${today.toDateString()}`);
    console.log(`📅 Filtering events: ${startOfWeek.toDateString()} to ${endOfWeek.toDateString()}`);
    console.log(`📊 Total events to filter: ${events.length}`);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const startDateOnly = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
      const endDateOnly = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate());
      
      const isInRange = eventDateOnly >= startDateOnly && eventDateOnly <= endDateOnly;
      console.log(`📋 Event "${event.title}" on ${eventDateOnly.toDateString()}: ${isInRange ? '✅ INCLUDED' : '❌ EXCLUDED'} (${event.djName})`);
      
      return isInRange;
    });
  }
  */

  /**
   * Get the start of the current week (Wednesday)
   */
  /*
  private getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const result = new Date(date);
    
    // Calculate days to subtract to get to Wednesday
    let daysToSubtract;
    if (day === 0) { // Sunday
      daysToSubtract = 4; // Go back 4 days to Wednesday
    } else if (day >= 3) { // Wednesday, Thursday, Friday, Saturday
      daysToSubtract = day - 3; // Days since Wednesday
    } else { // Monday, Tuesday
      daysToSubtract = day + 4; // Days to next Wednesday
    }
    
    result.setDate(date.getDate() - daysToSubtract);
    console.log(`📅 getStartOfWeek: today=${date.toDateString()}, day=${day}, daysToSubtract=${daysToSubtract}, result=${result.toDateString()}`);
    
    return result;
  }
  */

  /**
   * Generate enhanced today's schedule with Wix DJ data
   */
  async generateEnhancedTodaySchedule(): Promise<{ text: string; photos?: string[]; keyboard?: any }> {
    try {
      console.log('🎭 ENHANCED METHOD CALLED - Generating enhanced today\'s schedule...');
      console.log('🔍 This is the ENHANCED method with Wix integration!');
      
      const today = new Date();
      console.log(`📅 Today's date: ${today.toDateString()}`);
      
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
      console.log('📋 Today\'s events:', todayEvents.map(e => `${e.djName} - ${e.eventType}`));
      console.log('🎵 DJ names from Hipsy:', todayEvents.map(e => e.djName));
      
      // Format today's events with enhanced DJ info
      const formattedToday = await this.formatter.formatEnhancedTodaySchedule(todayEvents);
      
      console.log('Enhanced today\'s schedule generated successfully');
      console.log('🎭 Enhanced formatting completed with Wix integration');
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