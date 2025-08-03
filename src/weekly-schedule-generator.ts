import { HipsyScraper } from './scrapers/hipsy-scraper';
import { WixDJLoader } from './utils/wix-dj-loader';
import { Event, DateRange } from './types/event';

export interface WeeklySchedule {
  video: string;
  text: string;
  keyboard?: any;
}

export interface WeeklyEvent {
  day: string;
  eventType: string;
  facilitator: string;
  facilitatorLink?: string;
  ticketUrl?: string | undefined;
}

export class WeeklyScheduleGenerator {
  private hipsyScraper: HipsyScraper;
  private wixDJLoader: WixDJLoader;
  private readonly VIDEO_ID = 'BAACAgQAAxkBAANIaIyYDXy2RFmnv6EZy2nsU2WqAsgAAmsYAAIvy2hQIXfzFx9DIcY2BA';
  private readonly TICKETS_URL = 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance';

  constructor() {
    this.hipsyScraper = new HipsyScraper();
    this.wixDJLoader = new WixDJLoader();
  }

  /**
   * Generate weekly schedule (Wednesday to Sunday)
   */
  async generateWeeklySchedule(): Promise<WeeklySchedule> {
    try {
      console.log('🎭 Generating weekly schedule...');
      
      // Get Wednesday to Sunday date range
      const weekRange = this.getWeekRange();
      console.log(`📅 Week range: ${weekRange.startDate.toISOString()} to ${weekRange.endDate.toISOString()}`);
      
      // Fetch events from Hipsy API
      const events = await this.fetchWeeklyEvents(weekRange);
      console.log(`📊 Found ${events.length} events for the week`);
      
      // Format weekly schedule
      const weeklyEvents = this.formatWeeklyEvents(events);
      console.log(`📋 Formatted ${weeklyEvents.length} weekly events`);
      
      // Add facilitator links
      const eventsWithLinks = await this.addFacilitatorLinks(weeklyEvents);
      console.log(`🔗 Added facilitator links to ${eventsWithLinks.length} events`);
      
      // Generate formatted text
      const formattedText = this.generateFormattedText(eventsWithLinks);
      console.log(`📝 Generated formatted text (${formattedText.length} characters)`);
      
      // Create keyboard for tickets
      const keyboard = this.createTicketsKeyboard();
      
      return {
        video: this.VIDEO_ID,
        text: formattedText,
        keyboard
      };
      
    } catch (error) {
      console.error('Error generating weekly schedule:', error);
      throw new Error('Failed to generate weekly schedule');
    }
  }

  /**
   * Get Monday to Sunday date range for current week
   */
  private getWeekRange(): DateRange {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate days to Monday (1) - if it's Sunday, go back to last Monday
    let daysToMonday = 1 - currentDay;
    if (daysToMonday > 0) {
      daysToMonday -= 7; // Previous Monday
    }
    
    // Calculate days to Sunday (0) - if it's Sunday, use today
    let daysToSunday = 0 - currentDay;
    if (daysToSunday > 0) {
      daysToSunday -= 7; // Previous Sunday
    }
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + daysToSunday);
    sunday.setHours(23, 59, 59, 999);
    
    return {
      startDate: monday,
      endDate: sunday
    };
  }

  /**
   * Fetch events for the week from Hipsy API
   */
  private async fetchWeeklyEvents(weekRange: DateRange): Promise<Event[]> {
    const allEvents: Event[] = [];
    let page = 1;
    const limit = 100; // Get more events per page
    
    while (true) {
      try {
        const result = await this.hipsyScraper.getEvents(page, 'all', limit);
        
        if (!result.success || result.events.length === 0) {
          break;
        }
        
        // Filter events within our week range
        const weekEvents = result.events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= weekRange.startDate && eventDate <= weekRange.endDate;
        });
        
        allEvents.push(...weekEvents);
        
        // If we got fewer events than the limit, we've reached the end
        if (result.events.length < limit) {
          break;
        }
        
        page++;
      } catch (error) {
        console.error('Error fetching events for page', page, error);
        break;
      }
    }
    
    // Sort events by date
    return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Format events into weekly schedule structure
   */
  private formatWeeklyEvents(events: Event[]): WeeklyEvent[] {
    const weeklyEvents: WeeklyEvent[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Group events by day
    const eventsByDay = new Map<string, Event[]>();
    
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const dayKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (dayKey && !eventsByDay.has(dayKey)) {
        eventsByDay.set(dayKey, []);
      }
      if (dayKey) {
        eventsByDay.get(dayKey)!.push(event);
      }
    });
    
    // Process each day
    for (const [dayKey, dayEvents] of eventsByDay) {
      const eventDate = new Date(dayKey);
      const dayIndex = eventDate.getDay();
      const dayName = dayNames[dayIndex] || 'Unknown';
      
      // Sort events by time within the day
      dayEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Create weekly event for each event on this day
      for (const event of dayEvents) {
        const weeklyEvent: WeeklyEvent = {
          day: dayName,
          eventType: this.mapEventType(event.eventType),
          facilitator: event.djName || 'TBA',
          ticketUrl: event.ticketUrl || undefined
        };
        
        weeklyEvents.push(weeklyEvent);
      }
    }
    
    return weeklyEvents;
  }

  /**
   * Map event types to display format
   */
  private mapEventType(eventType?: string): string {
    switch (eventType) {
      case 'ED':
        return 'ED';
      case 'Cacao ED':
        return 'Cacao ED';
      case 'Live Music':
        return 'Live Music';
      case 'Queerstatic':
        return 'Queerstatic';
      default:
        return 'Event';
    }
  }

  /**
   * Add facilitator links using Wix API
   */
  private async addFacilitatorLinks(weeklyEvents: WeeklyEvent[]): Promise<WeeklyEvent[]> {
    const eventsWithLinks = [...weeklyEvents];
    
    for (let i = 0; i < eventsWithLinks.length; i++) {
      const event = eventsWithLinks[i];
      
      if (event && event.facilitator && event.facilitator !== 'TBA') {
        try {
          // Try to get facilitator data from Wix API
          const facilitatorData = await this.wixDJLoader.getDJInfoWithFallback(event.facilitator);
          
          if (facilitatorData && facilitatorData.soundcloudUrl) {
            event.facilitatorLink = facilitatorData.soundcloudUrl;
          }
        } catch (error) {
          console.warn(`Failed to get facilitator link for ${event.facilitator}:`, error);
        }
      }
    }
    
    return eventsWithLinks;
  }

  /**
   * Generate formatted text for the weekly schedule
   */
  private generateFormattedText(weeklyEvents: WeeklyEvent[]): string {
    let text = '🪩 <b><u>This Week</u></b> 🌴🎶\n\n';
    
    weeklyEvents.forEach(event => {
      const facilitatorText = event.facilitatorLink 
        ? `<a href="${event.facilitatorLink}">${event.facilitator}</a>`
        : event.facilitator;
      
      text += `<b>🗓️ ${event.day}: ${event.eventType} | ${facilitatorText}</b>\n`;
    });
    
    return text;
  }

  /**
   * Create inline keyboard for tickets button
   */
  private createTicketsKeyboard(): any {
    return {
      inline_keyboard: [
        [
          {
            text: '🎫 Tickets',
            url: this.TICKETS_URL
          }
        ]
      ]
    };
  }
} 