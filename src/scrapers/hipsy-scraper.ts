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

        const events: Event[] = response.data.data.map((event: any) => {
          const djInfo = this.extractDJName(event.title);
          console.log(`📋 Event: "${event.title}"`);
          console.log(`   → djName: ${djInfo.djName || 'undefined'}`);
          console.log(`   → djNames: ${djInfo.djNames ? JSON.stringify(djInfo.djNames) : 'undefined'}`);
          return {
            id: event.id.toString(),
            title: event.title,
            date: event.date,
            picture: event.picture || event.picture_small || 'https://via.placeholder.com/150',
            ticketUrl: this.convertToPublicUrl(event.url_ticketshop || event.url_hipsy),
            originalDate: event.date,
            djName: djInfo.djName,
            djNames: djInfo.djNames,
            eventType: this.classifyEventType(event.title),
            description: event.description || ''
          };
        });

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
   * Extract DJ name(s) from event title
   * Handles both single DJ and B2B (back-to-back) events
   */
  private extractDJName(title: string): { djName?: string; djNames?: string[] } {
    console.log(`🔍 extractDJName called with title: "${title}"`);
    
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
        const djText = match[1].trim();
        console.log(`   → Matched pattern, extracted DJ text: "${djText}"`);
        if (djText && djText !== 'TBA' && djText !== 'TBD') {
          // Check if this is a B2B event or has multiple DJs with "and"
          // First check for explicit B2B indicators
          if (djText.toLowerCase().includes('b2b') || djText.toLowerCase().includes('back to back')) {
            // Extract multiple DJ names from B2B format
            const djNames = this.extractB2BDJNames(djText);
            if (djNames.length > 0) {
              const firstDJ = djNames[0];
              if (firstDJ) {
                return { djNames, djName: firstDJ }; // First DJ for backward compatibility
              }
            }
          } else {
            // Check for "and" separator (e.g., "Samaya and Henners", "Samaya & Henners")
            // Try patterns in order of specificity (most specific first)
            const andSeparators = [
              { pattern: /\s+and\s+/i, name: 'and' },           // "Samaya and Henners"
              { pattern: /\s+&\s+/, name: '& with spaces' },   // "Samaya & Henners" (with spaces)
              { pattern: /&/, name: '&' },                      // "Samaya&Henners" or any & (catch-all)
              { pattern: /\s*\+\s*/, name: '+' },               // "Samaya+Henners" or "Samaya + Henners"
            ];
            
            for (const { pattern, name } of andSeparators) {
              console.log(`   → Testing pattern "${name}": ${pattern}`);
              if (pattern.test(djText)) {
                console.log(`   → Pattern "${name}" matched! Splitting...`);
                const parts = djText.split(pattern);
                console.log(`   → Split result: ${JSON.stringify(parts)}`);
                if (parts.length >= 2) {
                  const dj1 = parts[0]?.trim();
                  const dj2 = parts.slice(1).join(' ').trim(); // Handle multiple separators by joining remaining parts
                  console.log(`   → dj1: "${dj1}", dj2: "${dj2}"`);
                  
                  if (dj1 && dj2 && dj1.length > 0 && dj2.length > 0) {
                    console.log(`✅ Detected B2B event via "${name}": "${dj1}" & "${dj2}" from "${djText}"`);
                    return { djNames: [dj1, dj2], djName: dj1 }; // Return as B2B event
                  } else {
                    console.log(`   ⚠️ Split failed validation: dj1="${dj1}", dj2="${dj2}"`);
                  }
                } else {
                  console.log(`   ⚠️ Split produced < 2 parts: ${parts.length}`);
                }
              } else {
                console.log(`   → Pattern "${name}" did not match`);
              }
            }
            
            // Single DJ event
            console.log(`ℹ️ Single DJ event: "${djText}"`);
            return { djName: djText };
          }
        }
      }
    }

    return {};
  }

  /**
   * Extract DJ names from B2B (back-to-back) format
   * Handles formats like: "Ruby B2B Indi Raeva", "DJ1 Back to Back DJ2", etc.
   */
  private extractB2BDJNames(b2bText: string): string[] {
    const djNames: string[] = [];
    
    // Common B2B separators
    const separators = [
      /\s+b2b\s+/i,           // "Ruby B2B Indi Raeva"
      /\s+back\s+to\s+back\s+/i, // "Ruby Back to Back Indi Raeva"
      /\s+vs\s+/i,            // "Ruby vs Indi Raeva"
      /\s+&\s+/i,             // "Ruby & Indi Raeva"
      /\s+and\s+/i,           // "Ruby and Indi Raeva"
      /\s*\+\s*/i,            // "Ruby + Indi Raeva"
    ];

    for (const separator of separators) {
      if (separator.test(b2bText)) {
        const parts = b2bText.split(separator);
        if (parts.length === 2) {
          const dj1 = parts[0]?.trim();
          const dj2 = parts[1]?.trim();
          
          if (dj1 && dj2) {
            djNames.push(dj1, dj2);
            break;
          }
        }
      }
    }

    // If no separators found, try to split by common conjunctions
    if (djNames.length === 0) {
      const conjunctionPatterns = [
        /\s+and\s+/i,
        /\s+&\s+/,
        /\s*\+\s*/,
      ];

      for (const pattern of conjunctionPatterns) {
        if (pattern.test(b2bText)) {
          const parts = b2bText.split(pattern);
          if (parts.length === 2) {
            const dj1 = parts[0]?.trim();
            const dj2 = parts[1]?.trim();
            
            if (dj1 && dj2) {
              djNames.push(dj1, dj2);
              break;
            }
          }
        }
      }
    }

    return djNames;
  }

  /**
   * Classify event type based on title
   */
  private classifyEventType(title: string): 'ED' | 'Cacao ED' | 'Live Music' | 'Queerstatic' | 'Ecstatic Journey' | undefined {
    const lowerTitle = title.toLowerCase();
    
    console.log(`🎭 Classifying event type for title: "${title}" -> lowercase: "${lowerTitle}"`);
    
    // Check for Ecstatic Journey - must be exact phrase to avoid false matches
    // Use word boundaries to ensure "ecstatic journey" is a complete phrase
    if (/\becstatic\s+journey\b/i.test(title)) {
      return 'Ecstatic Journey';
    }
    
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