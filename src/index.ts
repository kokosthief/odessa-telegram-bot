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
          
          // Get DJ info for the next event
          const djInfo = await this.getDJInfo(nextEvent.djName);
          
          // Format the event title and DJ name with links
          const eventTitleWithLink = `<a href="${nextEvent.ticketUrl}">${nextEvent.title}</a>`;
          const djNameWithLink = djInfo && djInfo.soundcloudUrl 
            ? `<a href="${djInfo.soundcloudUrl}">${nextEvent.djName}</a>`
            : nextEvent.djName;
          
          let nextEventText = '';
          if (daysUntilNext === 1) {
            nextEventText = `<b>🎯 Next Event: Tomorrow - ${eventTitleWithLink} | ${djNameWithLink}</b>`;
          } else if (daysUntilNext === 0) {
            nextEventText = `<b>🎯 Next Event: Today - ${eventTitleWithLink} | ${djNameWithLink}</b>`;
          } else {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[nextEventDateInAmsterdam.getDay()];
            nextEventText = `<b>🎯 Next Event: ${dayName} - ${eventTitleWithLink} | ${djNameWithLink}</b>`;
          }
          
          return { 
            text: nextEventText,
            photos: djInfo?.photo ? [djInfo.photo] : undefined,
            keyboard: this.createTicketsKeyboard(nextEvent.ticketUrl, djInfo?.soundcloudUrl)
          } as { text: string; photos?: string[]; keyboard?: any };
        } else {
          return { text: '<b>🎯 Next Event: No upcoming events found.</b>' };
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
   * Get DJ information with SoundCloud link
   */
  private async getDJInfo(djName?: string): Promise<any> {
    if (!djName) return null;
    
    try {
      // Import WixDJLoader dynamically to avoid circular dependencies
      const { WixDJLoader } = await import('./utils/wix-dj-loader');
      const wixDJLoader = new WixDJLoader();
      
      return await wixDJLoader.getDJInfoWithFallback(djName);
    } catch (error) {
      console.error('Error getting DJ info:', error);
      return null;
    }
  }

  /**
   * Create tickets keyboard
   */
  private createTicketsKeyboard(ticketUrl?: string, soundcloudUrl?: string): any {
    const buttons = [];
    
    if (ticketUrl) {
      buttons.push({
        text: '🎫 TICKETS',
        url: ticketUrl
      });
    }
    
    if (soundcloudUrl) {
      buttons.push({
        text: '🎧 LISTEN',
        url: soundcloudUrl
      });
    }
    
    if (buttons.length === 0) {
      return undefined;
    }
    
    return {
      inline_keyboard: [buttons]
    };
  }

  /**
   * Generate schedule for today only (legacy method for backward compatibility)
   */
  async generateTodaySchedule(): Promise<{ text: string; photos?: string[]; keyboard?: any }> {
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
          
          // Get DJ info for the next event
          const djInfo = await this.getDJInfo(nextEvent.djName);
          
          // Format the event title and DJ name with links
          const eventTitleWithLink = `<a href="${nextEvent.ticketUrl}">${nextEvent.title}</a>`;
          const djNameWithLink = djInfo && djInfo.soundcloudUrl 
            ? `<a href="${djInfo.soundcloudUrl}">${nextEvent.djName}</a>`
            : nextEvent.djName;
          
          let nextEventText = '';
          if (daysUntilNext === 1) {
            nextEventText = `<b>🎯 Next Event: Tomorrow - ${eventTitleWithLink} | ${djNameWithLink}</b>`;
          } else if (daysUntilNext === 0) {
            nextEventText = `<b>🎯 Next Event: Today - ${eventTitleWithLink} | ${djNameWithLink}</b>`;
          } else {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[nextEventDateInAmsterdam.getDay()];
            nextEventText = `<b>🎯 Next Event: ${dayName} - ${eventTitleWithLink} | ${djNameWithLink}</b>`;
          }
          
          return { 
            text: nextEventText,
            photos: djInfo?.photo ? [djInfo.photo] : undefined,
            keyboard: this.createTicketsKeyboard(nextEvent.ticketUrl, djInfo?.soundcloudUrl)
          } as { text: string; photos?: string[]; keyboard?: any };
        } else {
          return { text: '<b>🎯 Next Event: No upcoming events found.</b>' };
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