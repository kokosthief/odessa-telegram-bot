import { HipsyScraper } from './scrapers/hipsy-scraper';
import { WixDJLoader } from './utils/wix-dj-loader';
import { Event, DateRange } from './types/event';
import { sanitizeUrl } from './utils/url-validator';

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
  facilitators?: string[] | undefined; // Array of facilitators for B2B events
  facilitatorLinks?: string[] | undefined; // Array of facilitator links for B2B events
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
          keyboard: this.createTicketsKeyboard(undefined)
        };
      }
      
      // Format weekly schedule
      const weeklyEvents = this.formatWeeklyEvents(events);
      
      // Add facilitator links
      const eventsWithLinks = await this.addFacilitatorLinks(weeklyEvents);
      
      // Generate formatted text with ticket links
      const formattedText = this.generateFormattedText(eventsWithLinks);
      
      // Create keyboard for tickets (always use general tickets URL)
      const keyboard = this.createTicketsKeyboard(undefined);
      
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
        keyboard: this.createTicketsKeyboard(undefined)
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
        console.log(`📅 Processing event: "${event.title}"`);
        console.log(`   → event.djName: ${event.djName || 'undefined'}`);
        console.log(`   → event.djNames: ${event.djNames ? JSON.stringify(event.djNames) : 'undefined'}`);
        
        // Check if event has multiple DJs (B2B event)
        let facilitators: string[] | undefined = undefined;
        
        // First priority: Use djNames array if it exists and has multiple DJs
        if (event.djNames && event.djNames.length > 1) {
          facilitators = event.djNames;
          console.log(`✅ B2B event detected from scraper (djNames array): ${facilitators.join(' & ')}`);
        } 
        // Second priority: Check if djName contains separators (fallback if scraper didn't detect)
        else if (event.djName) {
          console.log(`🔍 Checking djName for B2B: "${event.djName}"`);
          
          // Check for "and" separator (e.g., "Samaya and Henners", "Samaya & Henners")
          // Use patterns in order of specificity
          const andPatterns = [
            { pattern: /\s+and\s+/i, name: 'and' },
            { pattern: /\s+&\s+/, name: '& with spaces' },
            { pattern: /&/, name: '&' },  // Catch-all for any &
            { pattern: /\s*\+\s*/, name: '+' },
          ];
          
          for (const { pattern, name } of andPatterns) {
            if (pattern.test(event.djName)) {
              const parts = event.djName.split(pattern);
              if (parts.length >= 2) {
                const dj1 = parts[0]?.trim();
                const dj2 = parts.slice(1).join(' ').trim(); // Handle multiple separators
                
                if (dj1 && dj2 && dj1.length > 0 && dj2.length > 0 && dj1 !== dj2) {
                  facilitators = [dj1, dj2];
                  console.log(`✅ B2B event detected in formatWeeklyEvents via "${name}": "${dj1}" & "${dj2}" from "${event.djName}"`);
                  break;
                }
              }
            }
          }
          
          if (!facilitators) {
            console.log(`ℹ️ Single DJ event: "${event.djName}"`);
          }
        }
        
        const weeklyEvent: WeeklyEvent = {
          day: dayName,
          eventType: this.mapEventType(event.eventType, dayName),
          facilitator: event.djName || 'TBA',
          ticketUrl: event.ticketUrl || undefined,
          originalTitle: event.title, // Preserve the original event title
          facilitators: facilitators || event.djNames || undefined, // Store multiple facilitators for B2B events
        };
        
        console.log(`   → Created WeeklyEvent:`);
        console.log(`      - day: ${weeklyEvent.day}`);
        console.log(`      - eventType: ${weeklyEvent.eventType}`);
        console.log(`      - facilitator: ${weeklyEvent.facilitator}`);
        console.log(`      - facilitators: ${weeklyEvent.facilitators ? JSON.stringify(weeklyEvent.facilitators) : 'undefined'}`);
        
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
      case 'Ecstatic Journey':
        return 'Journey';
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

      // Handle multiple facilitators for B2B events
      if (event && event.facilitators && event.facilitators.length > 1) {
        console.log(`🔗 addFacilitatorLinks: Processing ${event.facilitators.length} facilitators for B2B event: ${event.facilitators.join(' & ')}`);
        console.log(`   → Event day: ${event.day}, type: ${event.eventType}`);
        
        // Initialize facilitatorLinks array if needed
        if (!event.facilitatorLinks) {
          event.facilitatorLinks = [];
          console.log(`   → Initialized empty facilitatorLinks array`);
        }
        
        // Ensure we have the same number of links as facilitators
        while (event.facilitatorLinks.length < event.facilitators.length) {
          event.facilitatorLinks.push('');
        }
        console.log(`   → facilitatorLinks array size: ${event.facilitatorLinks.length}`);
        
        // Get links for each facilitator
        for (let j = 0; j < event.facilitators.length; j++) {
          const facilitator = event.facilitators[j];
          console.log(`   → Processing facilitator ${j + 1}/${event.facilitators.length}: "${facilitator}"`);
          if (facilitator && facilitator.trim() !== '') {
            // Always try to get link, even if one already exists (to refresh)
            try {
              const facilitatorData = await this.wixDJLoader.getDJInfoWithFallback(facilitator);
              
              if (facilitatorData && facilitatorData.soundcloudUrl) {
                event.facilitatorLinks[j] = facilitatorData.soundcloudUrl;
                console.log(`   ✅ Added link for facilitator "${facilitator}": ${facilitatorData.soundcloudUrl}`);
              } else {
                console.log(`   ⚠️ No link found for facilitator "${facilitator}"`);
                // Keep empty string if no link found
                if (!event.facilitatorLinks[j]) {
                  event.facilitatorLinks[j] = '';
                }
              }
            } catch (error) {
              console.error(`   ❌ Error getting link for facilitator "${facilitator}":`, error);
              if (!event.facilitatorLinks[j]) {
                event.facilitatorLinks[j] = '';
              }
            }
          } else {
            console.log(`   ⚠️ Facilitator ${j + 1} is empty or whitespace`);
          }
        }
        
        console.log(`📊 Final facilitatorLinks for "${event.day}": ${JSON.stringify(event.facilitatorLinks)}`);
      } else {
        if (event) {
          console.log(`ℹ️ addFacilitatorLinks: Event "${event.day}" is not a B2B event (facilitators: ${event.facilitators ? JSON.stringify(event.facilitators) : 'undefined'})`);
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
      
      // Check for B2B events FIRST (before custom event check)
      // B2B events should always show both DJs with links, even if eventType is "Event"
      if (event.facilitators && event.facilitators.length > 1) {
        // B2B event with multiple facilitators
        console.log(`📝 Formatting B2B event with ${event.facilitators.length} facilitators`);
        console.log(`   Facilitators: ${event.facilitators.join(', ')}`);
        console.log(`   Links available: ${event.facilitatorLinks ? event.facilitatorLinks.length : 0} links`);
        
        const facilitatorTexts = event.facilitators.map((facilitator, index) => {
          // Check if we have a link for this facilitator
          const link = event.facilitatorLinks && event.facilitatorLinks[index] ? event.facilitatorLinks[index].trim() : '';
          if (link && link !== '') {
            console.log(`   ✅ Linking "${facilitator}" to ${link}`);
            return `<a href="${link}">${facilitator}</a>`;
          } else {
            console.log(`   ⚠️ No link for "${facilitator}"`);
            return facilitator;
          }
        });
        
        // Use "&" separator for "and"/"&" events, "B2B" for actual B2B events
        const hasAndOrAmpersand = event.facilitator && (
          event.facilitator.toLowerCase().includes('and') || 
          event.facilitator.includes('&')
        );
        const separator = hasAndOrAmpersand ? ' & ' : ' B2B ';
        
        // Extract event title from originalTitle (everything before the separator)
        // For "New Year Party | Samaya & Henners", extract "New Year Party"
        let eventTitle = event.eventType || 'Event';
        if (event.originalTitle) {
          // Try to extract title part before common separators
          const titlePatterns = [
            /\s*\|\s*/,           // "Event | DJ"
            /\s+with\s+/i,        // "Event with DJ"
            /\s+feat\.?\s+/i,     // "Event feat. DJ"
            /\s+by\s+/i,          // "Event by DJ"
            /\s+-\s+/,            // "Event - DJ"
          ];
          
          for (const pattern of titlePatterns) {
            const match = event.originalTitle.split(pattern);
            if (match.length > 1 && match[0]) {
              eventTitle = match[0].trim();
              console.log(`   📌 Extracted event title: "${eventTitle}" from "${event.originalTitle}"`);
              break;
            }
          }
          
          // If no separator found, use the full original title
          if (eventTitle === (event.eventType || 'Event')) {
            eventTitle = event.originalTitle;
          }
        }
        
        displayText = `${eventTitle} | ${facilitatorTexts.join(separator)}`;
        console.log(`   📤 Final display text: ${displayText}`);
      } else if (event.eventType === 'Event' && event.originalTitle) {
        // For custom events (Event type) without B2B, use just the original title without "Event | " prefix
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
   * Can optionally include event-specific ticket URLs
   */
  private createTicketsKeyboard(eventTicketUrl?: string): any {
    const ticketUrl = sanitizeUrl(eventTicketUrl || this.TICKETS_URL);
    return {
      inline_keyboard: [
        [
          {
            text: '🎫 TICKETS',
            url: ticketUrl
          }
        ]
      ]
    };
  }
} 