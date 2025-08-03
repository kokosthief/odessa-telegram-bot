import axios from 'axios';
import * as cheerio from 'cheerio';
import { Event } from '../types/event';
import { WeeklyEvent } from '../types/weekly-event';
import { WixDJLoader } from '../utils/wix-dj-loader';

export class WeeklyScheduleScraper {
  private baseUrl = 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance';
  private wixDJLoader: WixDJLoader;

  constructor() {
    this.wixDJLoader = new WixDJLoader();
  }

  /**
   * Scrape weekly schedule from Wednesday to Sunday
   * Handles both historical and future data to ensure full week coverage
   */
  async scrapeWeeklySchedule(): Promise<WeeklyEvent[]> {
    try {
      const weekRange = this.getWeekRange();

      // Scrape events for the full week range
      const scrapedEvents = await this.scrapeEventsForDateRange(weekRange.start, weekRange.end);
      
      // Group events by day and format
      const eventsByDay = this.groupEventsByDay(scrapedEvents);
      
      // Create weekly schedule with all days
      const weeklySchedule = await this.createWeeklySchedule(eventsByDay);
      
      return weeklySchedule;
    } catch (error) {
      console.error('Failed to scrape weekly schedule:', error);
      throw new Error('Weekly schedule scraping failed');
    }
  }

  /**
   * Get the date range for the current week (Wednesday to Sunday)
   */
  private getWeekRange(): { start: Date; end: Date } {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 3 = Wednesday
    
    // Find the most recent Wednesday
    let wednesday = new Date(today);
    const daysSinceWednesday = (currentDay + 4) % 7; // Days since last Wednesday
    wednesday.setDate(today.getDate() - daysSinceWednesday);
    wednesday.setHours(0, 0, 0, 0);
    
    // Sunday is 6 days after Wednesday
    const sunday = new Date(wednesday);
    sunday.setDate(wednesday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { start: wednesday, end: sunday };
  }

  /**
   * Scrape events for a specific date range
   */
  private async scrapeEventsForDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const events: Event[] = [];
    
    try {
      // Try to get events from Hipsy API first
      const apiEvents = await this.scrapeFromHipsyAPI(startDate, endDate);
      if (apiEvents.length > 0) {
        console.log(`✅ Found ${apiEvents.length} events from Hipsy API`);
        return apiEvents;
      }

      // Fallback to web scraping
      console.log('🔄 Falling back to web scraping...');
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Find all event elements
      const eventElements = $('[data-testid="event-card"], .event-card, .event-item');
      
      eventElements.each((_, element) => {
        try {
          const event = this.parseEventElement($, element);
          if (event && this.isEventInDateRange(event, startDate, endDate)) {
            events.push(event);
          }
        } catch (error) {
          console.warn('Failed to parse event element:', error);
        }
      });

      // If no events found with standard selectors, try alternative parsing
      if (events.length === 0) {
        const alternativeEvents = this.parseAlternativeEventStructure($);
        events.push(...alternativeEvents.filter(event => 
          this.isEventInDateRange(event, startDate, endDate)
        ));
      }

      return events;
    } catch (error) {
      console.error('Failed to scrape events for date range:', error);
      throw new Error('Event scraping failed');
    }
  }

  /**
   * Try to scrape events from Hipsy API
   */
  private async scrapeFromHipsyAPI(startDate: Date, endDate: Date): Promise<Event[]> {
    const events: Event[] = [];
    
    try {
      // Try different API endpoints
      const apiEndpoints = [
        'https://hipsy.nl/api/events',
        'https://hipsy.nl/api/v1/events',
        'https://hipsy.nl/api/organisations/odessa-amsterdam-ecstatic-dance/events'
      ];

      for (const endpoint of apiEndpoints) {
        try {
          console.log(`🔍 Trying API endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/json'
            },
            timeout: 5000
          });

          if (response.status === 200 && response.data) {
            console.log(`✅ API endpoint ${endpoint} returned data`);
            const apiEvents = this.parseAPIResponse(response.data, startDate, endDate);
            if (apiEvents.length > 0) {
              return apiEvents;
            }
          }
        } catch (error) {
          console.log(`❌ API endpoint ${endpoint} failed:`, error instanceof Error ? error.message : String(error));
        }
      }

      return events;
    } catch (error) {
      console.error('Failed to scrape from Hipsy API:', error);
      return events;
    }
  }

  /**
   * Parse API response
   */
  private parseAPIResponse(data: any, startDate: Date, endDate: Date): Event[] {
    const events: Event[] = [];
    
    try {
      // Handle different API response formats
      const eventsArray = data.events || data.data || data || [];
      
      for (const eventData of eventsArray) {
        try {
          const event = this.parseAPIEvent(eventData);
          if (event && this.isEventInDateRange(event, startDate, endDate)) {
            events.push(event);
          }
        } catch (error) {
          console.warn('Failed to parse API event:', error);
        }
      }
    } catch (error) {
      console.error('Failed to parse API response:', error);
    }

    return events;
  }

  /**
   * Parse individual API event
   */
  private parseAPIEvent(eventData: any): Event | null {
    try {
      const title = eventData.title || eventData.name || '';
      const dateStr = eventData.date || eventData.start_date || eventData.startDate || '';
      const ticketUrl = eventData.ticket_url || eventData.ticketUrl || eventData.url || this.baseUrl;
      
      if (!title || !dateStr) return null;

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;

      const djName = this.extractDJName(title);
      const eventType = this.determineEventType(title);

      return {
        id: this.generateEventId(title, date),
        title,
        date: date.toISOString(),
        originalDate: dateStr,
        ticketUrl,
        djName,
        eventType: this.mapEventType(eventType)
      };
    } catch (error) {
      console.warn('Failed to parse API event:', error);
      return null;
    }
  }

  /**
   * Parse individual event element
   */
  private parseEventElement($: cheerio.CheerioAPI, element: any): Event | null {
    try {
      const $element = $(element);
      
      // Extract event title
      const title = $element.find('h3, .event-title, [data-testid="event-title"]').text().trim();
      if (!title) return null;

      // Extract date
      const dateText = $element.find('.event-date, [data-testid="event-date"], .date').text().trim();
      const date = this.parseDate(dateText);
      if (!date) return null;

      // Extract ticket URL
      const ticketUrl = $element.find('a[href*="ticket"], a[href*="book"]').attr('href') || 
                       $element.find('a').first().attr('href') || 
                       this.baseUrl;

      // Extract DJ name from title
      const djName = this.extractDJName(title);

      // Determine event type
      const eventType = this.determineEventType(title);

      return {
        id: this.generateEventId(title, date),
        title,
        date: date.toISOString(),
        originalDate: dateText,
        ticketUrl: ticketUrl.startsWith('http') ? ticketUrl : `https://hipsy.nl${ticketUrl}`,
        djName,
        eventType: this.mapEventType(eventType)
      };
    } catch (error) {
      console.warn('Failed to parse event element:', error);
      return null;
    }
  }

  /**
   * Alternative parsing method for different page structures
   */
  private parseAlternativeEventStructure($: cheerio.CheerioAPI): Event[] {
    const events: Event[] = [];
    
    // Try different selectors for event information
    const eventContainers = $('.event, .event-item, [class*="event"]');
    
    eventContainers.each((_, element) => {
      try {
        const $element = $(element);
        const title = $element.text().trim();
        
        if (title && this.containsEventKeywords(title)) {
          const date = this.extractDateFromText(title);
          const djName = this.extractDJName(title);
          const eventType = this.determineEventType(title);
          
          if (date) {
            events.push({
              id: this.generateEventId(title, date),
              title,
              date: date.toISOString(),
              originalDate: title, // Use title as fallback for originalDate
              ticketUrl: this.baseUrl,
              djName,
              eventType: this.mapEventType(eventType)
            });
          }
        }
      } catch (error) {
        console.warn('Failed to parse alternative event structure:', error);
      }
    });

    return events;
  }

  /**
   * Check if event is within the specified date range
   */
  private isEventInDateRange(event: Event, startDate: Date, endDate: Date): boolean {
    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  }

  /**
   * Group events by day of the week
   */
  private groupEventsByDay(events: Event[]): Record<string, Event[]> {
    const eventsByDay: Record<string, Event[]> = {
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const dayOfWeek = eventDate.getDay();
      
      switch (dayOfWeek) {
        case 3: // Wednesday
          eventsByDay['wednesday']?.push(event);
          break;
        case 4: // Thursday
          eventsByDay['thursday']?.push(event);
          break;
        case 5: // Friday
          eventsByDay['friday']?.push(event);
          break;
        case 6: // Saturday
          eventsByDay['saturday']?.push(event);
          break;
        case 0: // Sunday
          eventsByDay['sunday']?.push(event);
          break;
      }
    });

    return eventsByDay;
  }

  /**
   * Create weekly schedule with all days
   */
  private async createWeeklySchedule(eventsByDay: Record<string, Event[]>): Promise<WeeklyEvent[]> {
    const weeklySchedule: WeeklyEvent[] = [];
    const days = ['wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

    for (const day of days) {
      const dayEvents = eventsByDay[day];
      
      if (dayEvents && dayEvents.length > 0) {
        // Use the first event for the day (most common case)
        const primaryEvent = dayEvents[0];
        
        if (primaryEvent) {
          // Get DJ info from Wix CMS
          const djInfo = await this.wixDJLoader.getDJInfoWithFallback(primaryEvent.djName || '');
          
          weeklySchedule.push({
            day,
            eventType: this.mapWeeklyEventType(primaryEvent.eventType),
            djName: primaryEvent.djName || 'TBA',
            ticketUrl: primaryEvent.ticketUrl,
            date: primaryEvent.date,
            ...(djInfo?.soundcloudUrl && { djSoundcloudUrl: djInfo.soundcloudUrl })
          });
        } else {
          // Fallback if primaryEvent is undefined
          weeklySchedule.push({
            day,
            eventType: 'Ecstatic Dance',
            djName: 'TBA',
            ticketUrl: this.baseUrl,
            date: this.getDateForDay(day).toISOString()
          });
        }
      } else {
        // No events found for this day
        weeklySchedule.push({
          day,
          eventType: 'Ecstatic Dance',
          djName: 'TBA',
          ticketUrl: this.baseUrl,
          date: this.getDateForDay(day).toISOString()
        });
      }
    }

    return weeklySchedule;
  }

  /**
   * Get date for a specific day of the week
   */
  private getDateForDay(day: string): Date {
    const today = new Date();
    const currentDay = today.getDay();
    
    const dayMap: Record<string, number> = {
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0
    };
    
    const targetDay = dayMap[day];
    if (targetDay === undefined) {
      // Fallback to current day if day not found
      return today;
    }
    
    const daysToAdd = (targetDay - currentDay + 7) % 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    targetDate.setHours(12, 0, 0, 0);
    
    return targetDate;
  }

  /**
   * Map event type to Event interface format
   */
  private mapEventType(eventType: string): 'ED' | 'Cacao ED' | 'Live Music' | 'Queerstatic' | undefined {
    switch (eventType) {
      case 'Ecstatic Dance':
        return 'ED';
      case 'Cacao Ecstatic Dance':
        return 'Cacao ED';
      case 'Queerstatic':
        return 'Queerstatic';
      case 'Live Music':
        return 'Live Music';
      default:
        return 'ED';
    }
  }

  /**
   * Map event type to WeeklyEvent interface format
   */
  private mapWeeklyEventType(eventType?: string): 'Ecstatic Dance' | 'Cacao Ecstatic Dance' | 'Queerstatic' | 'Live Music' {
    switch (eventType) {
      case 'ED':
        return 'Ecstatic Dance';
      case 'Cacao ED':
        return 'Cacao Ecstatic Dance';
      case 'Queerstatic':
        return 'Queerstatic';
      case 'Live Music':
        return 'Live Music';
      default:
        return 'Ecstatic Dance';
    }
  }

  /**
   * Parse date from text
   */
  private parseDate(dateText: string): Date | null {
    if (!dateText) return null;
    
    try {
      // Try various date formats
      const dateFormats = [
        /(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|aug|sep|okt|nov|dec)/i,
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        /(\d{4})-(\d{1,2})-(\d{1,2})/
      ];
      
      for (const format of dateFormats) {
        const match = dateText.match(format);
        if (match) {
          // Handle different date formats
          if (format.source.includes('jan|feb')) {
            // Dutch month format
            const day = parseInt(match[1] || '1');
            const month = this.getMonthNumber(match[2] || 'jan');
            const year = new Date().getFullYear();
            return new Date(year, month, day);
          } else if (format.source.includes('\\/')) {
            // DD/MM/YYYY format
            const day = parseInt(match[1] || '1');
            const month = parseInt(match[2] || '1') - 1;
            const year = parseInt(match[3] || '2024');
            return new Date(year, month, day);
          } else {
            // YYYY-MM-DD format
            const year = parseInt(match[1] || '2024');
            const month = parseInt(match[2] || '1') - 1;
            const day = parseInt(match[3] || '1');
            return new Date(year, month, day);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to parse date:', dateText, error);
      return null;
    }
  }

  /**
   * Get month number from Dutch month name
   */
  private getMonthNumber(monthName: string): number {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, okt: 9, nov: 10, dec: 11
    };
    return months[monthName.toLowerCase()] || 0;
  }

  /**
   * Extract date from text content
   */
  private extractDateFromText(text: string): Date | null {
    // Look for date patterns in text
    const datePatterns = [
      /(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|aug|sep|okt|nov|dec)/i,
      /(\d{1,2})\/(\d{1,2})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return this.parseDate(match[0]);
      }
    }
    
    return null;
  }

  /**
   * Extract DJ name from event title
   */
  private extractDJName(title: string): string {
    // Look for DJ name patterns
    const djPatterns = [
      /\|\s*([^|]+)$/, // "Event | DJ Name"
      /with\s+([A-Z][a-z]+)/, // "Event with DJ Name"
      /DJ\s+([A-Z][a-z]+)/, // "Event DJ Name"
      /by\s+([A-Z][a-z]+)/ // "Event by DJ Name"
    ];
    
    for (const pattern of djPatterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return '';
  }

  /**
   * Determine event type from title
   */
  private determineEventType(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('cacao')) {
      return 'Cacao Ecstatic Dance';
    } else if (lowerTitle.includes('queerstatic')) {
      return 'Queerstatic';
    } else if (lowerTitle.includes('live music') || lowerTitle.includes('live muziek')) {
      return 'Live Music';
    } else {
      return 'Ecstatic Dance';
    }
  }

  /**
   * Check if text contains event keywords
   */
  private containsEventKeywords(text: string): boolean {
    const keywords = ['ecstatic', 'dance', 'cacao', 'queerstatic', 'live'];
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(title: string, date: Date): string {
    return `${title.replace(/\s+/g, '-').toLowerCase()}-${date.toISOString().split('T')[0]}`;
  }
} 