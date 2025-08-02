import axios from 'axios';
import { Event, ScrapingResult } from '../types/event';

export class HipsyScraper {
  private baseUrl = 'https://api.hipsy.nl/v1';
  private apiKey = process.env['HIPSY_API_KEY'] || '';
  private organisationSlug = 'odessa-amsterdam-ecstatic-dance';

  constructor() {
    // Set default headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
    axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  }

  /**
   * Fetch events from Hipsy.nl API with retry logic
   */
  async getEvents(page: number = 1, period: 'past' | 'upcoming' | 'all' = 'upcoming', limit: number = 10): Promise<ScrapingResult> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Fetching events from Hipsy.nl API page ${page}, period: ${period} (attempt ${attempt}/${maxRetries})`);
        
        const response = await axios.get(`${this.baseUrl}/organisation/${this.organisationSlug}/events`, {
          params: {
            page,
            limit,
            period
          },
          timeout: 30000, // Increased from 10000ms to 30000ms (30 seconds)
        });

        if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
          console.error('Invalid response format from Hipsy.nl API');
          return {
            events: [],
            totalCount: 0,
            success: false,
            error: 'Invalid response format'
          };
        }

        const events: Event[] = response.data.data.map((event: any) => ({
          id: event.id.toString(),
          title: event.title,
          date: event.date,
          picture: event.picture || event.picture_small || 'https://via.placeholder.com/150',
          ticketUrl: event.url_ticketshop || event.url_hipsy,
          originalDate: event.date,
          djName: this.extractDJName(event.title),
          eventType: this.classifyEventType(event.title),
          description: event.description || ''
        }));

        console.log(`Successfully fetched ${events.length} events from Hipsy.nl API`);
        
        return {
          events,
          totalCount: events.length,
          success: true
        };

      } catch (error) {
        console.error(`Error fetching events from Hipsy.nl API (attempt ${attempt}/${maxRetries}):`, error);
        
        // If this is the last attempt, return the error
        if (attempt === maxRetries) {
          // Handle timeout errors specifically
          if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
            console.error('API request timed out after all retries, returning empty result');
            return {
              events: [],
              totalCount: 0,
              success: false,
              error: 'API request timed out'
            };
          }
          
          return {
            events: [],
            totalCount: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        await this.delay(delay);
      }
    }

    // This should never be reached, but just in case
    return {
      events: [],
      totalCount: 0,
      success: false,
      error: 'All retry attempts failed'
    };
  }

  /**
   * Extract DJ name from event title
   * Based on actual Hipsy.nl event titles like "Ecstatic Dance | Divana"
   */
  private extractDJName(title: string): string | undefined {
    // Pattern for "Event Type | DJ Name" format
    const pipePattern = /\|\s*([A-Za-z\s]+)$/;
    const match = title.match(pipePattern);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Fallback patterns
    const patterns = [
      /w\/\s*([A-Za-z\s]+)/i,  // "W/ DJ Name"
      /with\s+([A-Za-z\s]+)/i, // "With DJ Name"
      /feat\.\s*([A-Za-z\s]+)/i, // "Feat. DJ Name"
      /by\s+([A-Za-z\s]+)/i,   // "By DJ Name"
      /-\s*([A-Za-z\s]+)/i,    // "Event - DJ Name"
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Classify event type based on title
   */
  private classifyEventType(title: string): 'ED' | 'Cacao ED' | 'Live Music' | 'Queerstatic' | undefined {
    const text = title.toLowerCase();
    
    if (text.includes('queerstatic')) {
      return 'Queerstatic';
    } else if (text.includes('cacao') && (text.includes('ecstatic') || text.includes('ed'))) {
      return 'Cacao ED';
    } else if (text.includes('ecstatic dance') || text.includes('ed')) {
      return 'ED';
    } else if (text.includes('live music') || text.includes('live')) {
      return 'Live Music';
    }
    
    return undefined;
  }

  /**
   * Get events for a specific date range (Wednesday to Sunday)
   */
  async getEventsForWeek(startDate: Date): Promise<Event[]> {
    const allEvents: Event[] = [];
    let currentPage = 1;
    const maxPages = 3; // Increased to 3 pages to get more data
    const maxEvents = 20; // Increased to get enough events for full week coverage

    // First get upcoming events
    while (currentPage <= maxPages && allEvents.length < maxEvents) {
      const result = await this.getEvents(currentPage, 'upcoming', 20); // Increased to 20 events per page
      
      if (!result.success) {
        console.error(`Failed to fetch upcoming page ${currentPage}:`, result.error);
        break;
      }

      if (result.events.length === 0) {
        break; // No more events
      }

      // Filter events for the target week (Wednesday to Sunday)
      const weekEvents = this.filterEventsForWeek(result.events, startDate);
      allEvents.push(...weekEvents);

      // Early termination if we have enough events for full week coverage
      if (allEvents.length >= 6) { // We need max 6 events (Wed-Sun)
        break;
      }

      currentPage++;
      
      // Add delay to be respectful to the API
      await this.delay(500);
    }

    // Get past events if we don't have enough events for full week coverage
    if (allEvents.length < 6) {
      currentPage = 1;
      while (currentPage <= maxPages && allEvents.length < 6) {
        const result = await this.getEvents(currentPage, 'past', 20); // Increased to 20 events per page
        
        if (!result.success) {
          console.error(`Failed to fetch past page ${currentPage}:`, result.error);
          break;
        }

        if (result.events.length === 0) {
          break; // No more events
        }

        // Filter events for the target week (Wednesday to Sunday)
        const weekEvents = this.filterEventsForWeek(result.events, startDate);
        allEvents.push(...weekEvents);

        // Early termination if we have enough events for full week coverage
        if (allEvents.length >= 6) {
          break;
        }

        currentPage++;
        
        // Add delay to be respectful to the API
        await this.delay(500);
      }
    }

    // Sort events by date and limit to max 6 events (Wed-Sun)
    return allEvents
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6); // Maximum 6 events (Wednesday through Sunday)
  }

  /**
   * Filter events for Wednesday to Sunday of the target week
   */
  private filterEventsForWeek(events: Event[], startDate: Date): Event[] {
    const startOfWeek = this.getStartOfWeek(startDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Sunday (Wednesday + 4 days = Sunday)

    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      
      // Normalize dates to compare only the date part (ignore time)
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const startDateOnly = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
      const endDateOnly = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate());
      
      return eventDateOnly >= startDateOnly && eventDateOnly <= endDateOnly;
    });

    return filteredEvents;
  }

  /**
   * Get the start of the week (Wednesday)
   */
  private getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    // Wednesday is day 3 (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday)
    let diff;
    if (day === 0) { // Sunday
      diff = -4; // Go back 4 days to Wednesday
    } else if (day >= 3) { // Wednesday, Thursday, Friday, Saturday
      diff = 3 - day; // Days to subtract to get to Wednesday
    } else { // Monday, Tuesday
      diff = 3 - day + 7; // Days to subtract to get to Wednesday (next week)
    }
    const result = new Date(date);
    result.setDate(date.getDate() + diff);
    
    // If we're past Wednesday this week, look back to the previous Wednesday
    // This ensures we get the full week including past events
    const today = new Date();
    const currentDay = today.getDay();
    if (currentDay > 3) { // If we're past Wednesday (Thursday, Friday, Saturday, Sunday)
      result.setDate(result.getDate() - 7); // Go back one more week
    }
    
    return result;
  }

  /**
   * Add delay between requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set the organisation slug (call this before making API calls)
   */
  setOrganisationSlug(slug: string): void {
    this.organisationSlug = slug;
  }

  /**
   * Get the current organisation slug
   */
  getOrganisationSlug(): string {
    return this.organisationSlug;
  }
} 