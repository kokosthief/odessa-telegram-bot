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
  originalTitle?: string; // Add original event title for custom events
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
   * Generate weekly schedule (Monday to Sunday)
   */
  async generateWeeklySchedule(): Promise<WeeklySchedule> {
    try {
      // Get Monday to Sunday date range
      const weekRange = this.getWeekRange();
      
      // Fetch events from Hipsy API
      const events = await this.fetchWeeklyEvents(weekRange);
      
      // If no events found, return a friendly message
      if (events.length === 0) {
        return {
          video: this.VIDEO_ID,
          text: '🪩 <b><u>This Week</u></b> 🌴🎶\n\nNo events scheduled for this week.',
          keyboard: this.createTicketsKeyboard()
        };
      }
      
      // Format weekly schedule
      const weeklyEvents = this.formatWeeklyEvents(events);
      
      // Add facilitator links
      const eventsWithLinks = await this.addFacilitatorLinks(weeklyEvents);
      
      // Generate formatted text
      const formattedText = this.generateFormattedText(eventsWithLinks);
      
      // Create keyboard for tickets
      const keyboard = this.createTicketsKeyboard();
      
      return {
        video: this.VIDEO_ID,
        text: formattedText,
        keyboard
      };
      
    } catch (error) {
      console.error('Error generating weekly schedule:', error);
      
      // Return a user-friendly error message instead of throwing
      return {
        video: this.VIDEO_ID,
        text: '🪩 <b><u>This Week</u></b> 🌴🎶\n\n❌ Sorry, I couldn\'t fetch the weekly schedule right now. Please try again later.',
        keyboard: this.createTicketsKeyboard()
      };
    }
  }

  /**
   * Get Monday to Sunday date range for current week
   */
  private getWeekRange(): DateRange {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate days to Monday (1)
    let daysToMonday = 1 - currentDay;
    if (daysToMonday > 0) {
      daysToMonday -= 7; // Previous Monday
    }
    
    // Calculate days to Sunday (0) - this should be the end of the current week
    let daysToSunday = 0 - currentDay;
    if (daysToSunday < 0) {
      daysToSunday += 7; // Next Sunday
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
    const limit = 10; // Limit to 10 events like /whosplaying command
    
    while (true) {
      try {
        // Use 'upcoming' instead of 'all' to match working /whosplaying approach
        const result = await this.hipsyScraper.getEvents(page, 'upcoming', limit);
        
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
          eventType: this.mapEventType(event.eventType, dayName),
          facilitator: event.djName || 'TBA',
          ticketUrl: event.ticketUrl || undefined,
          originalTitle: event.title // Preserve the original event title
        };
        
        weeklyEvents.push(weeklyEvent);
      }
    }
    
    return weeklyEvents;
  }

  /**
   * Map event types to display format
   */
  private mapEventType(eventType?: string, day?: string): string {
    // Special case: Sunday ED events should always show as "Morning ED"
    if (day === 'Sun' && eventType === 'ED') {
      return 'Morning ED';
    }
    
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
          // Silently handle facilitator link errors
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
      let displayText: string;
      
      // For custom events (Event type), use just the original title without "Event | " prefix
      if (event.eventType === 'Event' && event.originalTitle) {
        displayText = event.originalTitle;
      } else {
        // For known event types, use the facilitator name with link if available
        const facilitatorText = event.facilitatorLink 
          ? `<a href="${event.facilitatorLink}">${event.facilitator}</a>`
          : event.facilitator;
        displayText = `${event.eventType} | ${facilitatorText}`;
      }
      
      text += `<b>🗓️ ${event.day}: ${displayText}</b>\n`;
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
            text: '🎫 TICKETS',
            url: this.TICKETS_URL
          }
        ]
      ]
    };
  }
} 