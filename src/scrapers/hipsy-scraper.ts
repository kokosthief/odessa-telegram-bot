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
          ticketUrl: this.convertToPublicUrl(event.url_ticketshop || event.url_hipsy),
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
   */
  private extractDJName(title: string): string | undefined {
    // Common patterns for DJ names in event titles
    const patterns = [
      /\|\s*([^|]+)$/, // "Event Name | DJ Name"
      /\s+with\s+([^|]+)$/i, // "Event Name with DJ Name"
      /\s+feat\.?\s+([^|]+)$/i, // "Event Name feat. DJ Name"
      /\s+by\s+([^|]+)$/i, // "Event Name by DJ Name"
      /\s+-\s+([^|]+)$/, // "Event Name - DJ Name"
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        const djName = match[1].trim();
        if (djName && djName !== 'TBA' && djName !== 'TBD') {
          return djName;
        }
      }
    }

    return undefined;
  }

  /**
   * Classify event type based on title
   */
  private classifyEventType(title: string): 'ED' | 'Cacao ED' | 'Live Music' | 'Queerstatic' | undefined {
    const lowerTitle = title.toLowerCase();
    
    console.log(`🎭 Classifying event type for title: "${title}" -> lowercase: "${lowerTitle}"`);
    
    if (lowerTitle.includes('ecstatic dance') || lowerTitle.includes('ed')) {
      if (lowerTitle.includes('cacao') || lowerTitle.includes('cacao ed')) {
        return 'Cacao ED';
      }
      return 'ED';
    }
    
    if (lowerTitle.includes('live music') || lowerTitle.includes('live')) {
      return 'Live Music';
    }
    
    if (lowerTitle.includes('queerstatic')) {
      return 'Queerstatic';
    }
    
    console.log(`🎭 No event type found in: "${title}"`);
    return undefined;
  }

  /**
   * Convert API URL to public URL
   */
  private convertToPublicUrl(apiUrl: string): string {
    if (!apiUrl) {
      return 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance';
    }
    
    // Convert API URL to public URL
    // From: https://api.hipsy.nl/shop/128407-queerstatic-dance-inphiknight
    // To: https://hipsy.nl/event/128407-queerstatic-dance-inphiknight
    return apiUrl
      .replace('https://api.hipsy.nl/shop/', 'https://hipsy.nl/event/')
      .replace('https://api.hipsy.nl/', 'https://hipsy.nl/');
  }

  /**
   * Delay function for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set organisation slug
   */
  setOrganisationSlug(slug: string): void {
    this.organisationSlug = slug;
  }

  /**
   * Get organisation slug
   */
  getOrganisationSlug(): string {
    return this.organisationSlug;
  }
} 