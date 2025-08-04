import { HipsyScraper } from './scrapers/hipsy-scraper';
import { WhosPlayingFormatter } from './formatters/whosplaying-formatter';
import { utcToZonedTime } from 'date-fns-tz';

export class OdessaTodayGenerator {
  private scraper: HipsyScraper;
  private formatter: WhosPlayingFormatter;
  private amsterdamTimezone = 'Europe/Amsterdam';

  constructor() {
    this.scraper = new HipsyScraper();
    this.formatter = new WhosPlayingFormatter();
  }

  /**
   * Get today's date in Amsterdam timezone
   */
  private getTodayInAmsterdam(): Date {
    const utcNow = new Date();
    return utcToZonedTime(utcNow, this.amsterdamTimezone);
  }

  /**
   * Generate enhanced today's schedule with Wix DJ data
   */
  async generateEnhancedTodaySchedule(): Promise<{ 
    text: string; 
    photos?: string[]; 
    keyboard?: any;
    messages?: Array<{
      text: string;
      photo?: string;
      keyboard?: any;
    }>;
  }> {
    try {
      console.log('🎭 ENHANCED METHOD CALLED - Generating enhanced today\'s schedule...');
      
      // Get today's date in Amsterdam timezone
      const today = this.getTodayInAmsterdam();
      console.log(`📅 Looking for events on: ${today.toDateString()} (Amsterdam time)`);
      
      // Get events for today using the existing method
      const result = await this.scraper.getEvents(1, 'upcoming', 10);
      
      if (!result.success) {
        throw new Error('Failed to fetch events from Hipsy');
      }
      
      // Filter events for today only (using Amsterdam timezone)
      const todayEvents = result.events.filter(event => {
        const eventDate = new Date(event.date);
        
        // Convert event date to Amsterdam timezone for comparison
        const eventDateInAmsterdam = utcToZonedTime(eventDate, this.amsterdamTimezone);
        
        // Normalize dates to compare only the date part (ignore time)
        const eventDateOnly = new Date(eventDateInAmsterdam.getFullYear(), eventDateInAmsterdam.getMonth(), eventDateInAmsterdam.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return eventDateOnly.getTime() === todayOnly.getTime();
      });
      
      console.log(`📊 Found ${todayEvents.length} events for today`);
      
      if (todayEvents.length === 0) {
        console.log('❌ No events found for today');
        
        // Find the next upcoming event
        const nextEvent = await this.findNextUpcomingEvent();
        
        if (nextEvent) {
          const nextEventDate = new Date(nextEvent.date);
          const nextEventDateInAmsterdam = utcToZonedTime(nextEventDate, this.amsterdamTimezone);
          const daysUntilNext = Math.ceil((nextEventDateInAmsterdam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let nextEventText = '';
          if (daysUntilNext === 1) {
            nextEventText = `\n\n🎯 <b>Next Event:</b> Tomorrow - ${nextEvent.title}`;
          } else if (daysUntilNext === 0) {
            nextEventText = `\n\n🎯 <b>Next Event:</b> Today - ${nextEvent.title}`;
          } else {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[nextEventDateInAmsterdam.getDay()];
            nextEventText = `\n\n🎯 <b>Next Event:</b> ${dayName} - ${nextEvent.title}`;
          }
          
          return { 
            text: `🎭 <b>Today's Schedule</b>\n\nNo events scheduled for today.${nextEventText}`,
            keyboard: this.createTicketsKeyboard(nextEvent.ticketUrl)
          };
        } else {
          return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
        }
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
   * Find the next upcoming event
   */
  private async findNextUpcomingEvent(): Promise<any> {
    try {
      const result = await this.scraper.getEvents(1, 'upcoming', 10);
      
      if (!result.success || result.events.length === 0) {
        return null;
      }
      
      // Find the first event that's after today
      const today = this.getTodayInAmsterdam();
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      for (const event of result.events) {
        const eventDate = new Date(event.date);
        const eventDateInAmsterdam = utcToZonedTime(eventDate, this.amsterdamTimezone);
        const eventDateOnly = new Date(eventDateInAmsterdam.getFullYear(), eventDateInAmsterdam.getMonth(), eventDateInAmsterdam.getDate());
        
        if (eventDateOnly.getTime() > todayOnly.getTime()) {
          return event;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding next upcoming event:', error);
      return null;
    }
  }

  /**
   * Create tickets keyboard
   */
  private createTicketsKeyboard(ticketUrl?: string): any {
    if (!ticketUrl) {
      return undefined;
    }
    
    return {
      inline_keyboard: [
        [
          {
            text: '🎫 Get Tickets',
            url: ticketUrl
          }
        ]
      ]
    };
  }

  /**
   * Generate schedule for today only (legacy method for backward compatibility)
   */
  async generateTodaySchedule(): Promise<{ text: string; keyboard?: any }> {
    try {
      console.log('Generating today\'s schedule...');
      
      // Get today's date in Amsterdam timezone
      const today = this.getTodayInAmsterdam();
      console.log(`📅 Looking for events on: ${today.toDateString()} (Amsterdam time)`);
      
      // Get events for today using the existing method
      const result = await this.scraper.getEvents(1, 'upcoming', 10);
      
      if (!result.success) {
        throw new Error('Failed to fetch events from Hipsy');
      }
      
      // Filter events for today only (using Amsterdam timezone)
      const todayEvents = result.events.filter(event => {
        const eventDate = new Date(event.date);
        
        // Convert event date to Amsterdam timezone for comparison
        const eventDateInAmsterdam = utcToZonedTime(eventDate, this.amsterdamTimezone);
        
        // Normalize dates to compare only the date part (ignore time)
        const eventDateOnly = new Date(eventDateInAmsterdam.getFullYear(), eventDateInAmsterdam.getMonth(), eventDateInAmsterdam.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return eventDateOnly.getTime() === todayOnly.getTime();
      });
      
      console.log(`📊 Found ${todayEvents.length} events for today`);
      
      if (todayEvents.length === 0) {
        console.log('❌ No events found for today');
        
        // Find the next upcoming event
        const nextEvent = await this.findNextUpcomingEvent();
        
        if (nextEvent) {
          const nextEventDate = new Date(nextEvent.date);
          const nextEventDateInAmsterdam = utcToZonedTime(nextEventDate, this.amsterdamTimezone);
          const daysUntilNext = Math.ceil((nextEventDateInAmsterdam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let nextEventText = '';
          if (daysUntilNext === 1) {
            nextEventText = `\n\n🎯 <b>Next Event:</b> Tomorrow - ${nextEvent.title}`;
          } else if (daysUntilNext === 0) {
            nextEventText = `\n\n🎯 <b>Next Event:</b> Today - ${nextEvent.title}`;
          } else {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[nextEventDateInAmsterdam.getDay()];
            nextEventText = `\n\n🎯 <b>Next Event:</b> ${dayName} - ${nextEvent.title}`;
          }
          
          return { 
            text: `🎭 <b>Today's Schedule</b>\n\nNo events scheduled for today.${nextEventText}`,
            keyboard: this.createTicketsKeyboard(nextEvent.ticketUrl)
          };
        } else {
          return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
        }
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