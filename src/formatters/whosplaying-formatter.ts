import { Event } from '../types/event';
import { DJLoader } from '../utils/dj-loader';
import { utcToZonedTime } from 'date-fns-tz';
import { sanitizeUrl } from '../utils/url-validator';

export class WhosPlayingFormatter {
  private djLoader: DJLoader;
  private amsterdamTimezone = 'Europe/Amsterdam';

  constructor() {
    this.djLoader = new DJLoader();
  }

  /**
   * Get DJ info from local database
   */
  private getDJInfo(djName: string): {
    name: string;
    photo?: string | undefined;
    shortDescription?: string | undefined;
    soundcloudUrl?: string | undefined;
    instagramUrl?: string | undefined;
    website?: string | undefined;
  } | null {
    const info = this.djLoader.getDJInfo(djName);
    if (!info) return null;

    return {
      name: djName,
      photo: info.photo,
      shortDescription: info.shortDescription,
      soundcloudUrl: info.soundcloud || info.link,
      instagramUrl: info.instagram,
      website: info.website
    };
  }

  /**
   * Get today's date in Amsterdam timezone
   */
  private getTodayInAmsterdam(): Date {
    const utcNow = new Date();
    return utcToZonedTime(utcNow, this.amsterdamTimezone);
  }

  /**
   * Get day name for schedule display
   */
  private getDayName(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()] || 'Unknown';
  }

  /**
   * Get time text for event (Today for Sunday morning, Tonight for others)
   * Returns lowercase version - capitalize when using as first word
   */
  private getTimeText(eventDate: string): string {
    const date = new Date(eventDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = date.getHours();
    
    // Sunday morning events (before 4 PM) use "Today"
    if (dayOfWeek === 0 && hour < 16) {
      return 'today';
    }
    
    // All other events use "tonight"
    return 'tonight';
  }

  /**
   * Format event type for display
   */
  private formatEventType(eventType?: string, eventDate?: string): string {
    switch (eventType) {
      case 'ED':
        // Check if it's Sunday for Morning Ecstatic Dance
        if (eventDate) {
          const date = new Date(eventDate);
          if (date.getDay() === 0) { // Sunday
            return 'Morning Ecstatic Dance';
          }
        }
        return 'Ecstatic Dance';
      case 'Cacao ED':
        return 'Cacao Ecstatic Dance';
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
   * Generate intro text for multiple events
   */
  private generateMultiEventIntro(events: Event[]): string {
    if (events.length === 1) {
      // Single event - use event-based logic for time text
      const event = events[0]!;
      const timeTextLower = this.getTimeText(event.date);
      const timeText = timeTextLower.charAt(0).toUpperCase() + timeTextLower.slice(1);
      
      // Single event - check if it's a B2B event
      if (event.djNames && event.djNames.length > 1) {
        // B2B event with multiple DJs
        const djNames = event.djNames.join(' & ');
        return `🌟 <b>${timeText}</b> with <b>${djNames}</b> ✨`;
      } else {
        // Single DJ event
        const djName = event.djName || 'TBA';
        return `🌟 <b>${timeText}</b> with <b>${djName}</b> ✨`;
      }
    } else {
      // Multiple events - check if any are Sunday morning, otherwise use "Tonight"
      const hasSundayMorning = events.some(event => {
        const date = new Date(event.date);
        return date.getDay() === 0 && date.getHours() < 16;
      });
      const timeText = hasSundayMorning ? 'Today' : 'Tonight';
      
      // Multiple events - create a more dynamic intro
      const uniqueDJs = new Set<string>();
      
      events.forEach(event => {
        if (event.djNames && event.djNames.length > 1) {
          // B2B event - add all DJ names
          event.djNames.forEach(dj => uniqueDJs.add(dj));
        } else if (event.djName) {
          // Single DJ event
          uniqueDJs.add(event.djName);
        }
      });
      
      const uniqueDJsArray = Array.from(uniqueDJs).filter(Boolean);
      
      if (uniqueDJsArray.length === 1) {
        // Same DJ for multiple events
        const djName = uniqueDJsArray[0];
        return `🌟 <b>${timeText}</b> with <b>${djName}</b> ✨\n\nMultiple events with the same DJ!`;
      } else if (uniqueDJsArray.length === 2) {
        // Two different DJs
        const djNames = uniqueDJsArray.join(' & ');
        return `🌟 <b>${timeText}</b> with <b>${djNames}</b> ✨\n\nA day filled with amazing music!`;
      } else {
        // Multiple different DJs
        const djNames = uniqueDJsArray.slice(0, 2).join(' & ');
        const remainingCount = uniqueDJsArray.length - 2;
        const djText = remainingCount > 0 ? `${djNames} & ${remainingCount} more` : djNames;
        
        return `🌟 <b>${timeText}</b> with <b>${djText}</b> ✨\n\nA day filled with amazing music!`;
      }
    }
  }

  /**
   * Format today's schedule specifically (legacy method for backward compatibility)
   */
  formatTodaySchedule(events: Event[]): { text: string; photos?: string[]; keyboard?: any } {
    if (events.length === 0) {
      return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
    }

    const today = this.getTodayInAmsterdam();
    const dayName = this.getDayName(today);
    
    // Generate intro text for today
    const introText = `🎭 <b>Today's Schedule</b> (${dayName})`;
    
    // Format today's events with enhanced DJ info
    const eventLines = events.map(event => {
      const eventType = this.formatEventType(event.eventType, event.date);
      const djName = event.djName || 'TBA';
      
      console.log(`Processing event with DJ: "${djName}"`);
      
      // Use Wix DJ loader for enhanced info
      const eventDescription = `<b>${eventType}</b> with <b>${djName}</b>`;
      
      let eventText = `🎵 ${eventDescription}`;
      
      return eventText;
    });
    
    // Join events with line breaks
    const eventsText = eventLines.join('\n\n');
    
    // Create ticket buttons for each event
    const ticketButtons = events.map((event) => {
      const buttonText = 'TICKETS 🎟️';
      
      return [{
        text: buttonText,
        url: sanitizeUrl(event.ticketUrl)
      }];
    });
    
    const keyboard = {
      inline_keyboard: ticketButtons
    };
    
    return {
      text: `${introText}\n\n${eventsText}`,
      keyboard: keyboard
    };
  }

  /**
   * Format enhanced today's schedule with Wix DJ data
   */
  async formatEnhancedTodaySchedule(events: Event[]): Promise<{ 
    text: string; 
    photos?: string[]; 
    keyboard?: any;
    messages?: Array<{
      text: string;
      photo?: string;
      keyboard?: any;
    }>;
  }> {
    console.log('🎭 Formatting enhanced today schedule...');
    console.log(`📊 Processing ${events.length} events`);
    console.log('🔍 DJLoader available:', !!this.djLoader);
    
    if (events.length === 0) {
      return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
    }

    // Generate exciting intro text for today with DJ name
    const introText = this.generateMultiEventIntro(events);
    
    // If single event, use the original format
    if (events.length === 1) {
      return this.formatSingleEvent(events[0]!);
    }
    
    // For multiple events, create separate messages for each DJ with photo
    return this.formatMultipleEvents(events, introText);
  }

  /**
   * Format a single event (original logic)
   */
  private async formatSingleEvent(event: Event): Promise<{ 
    text: string; 
    photos?: string[]; 
    keyboard?: any;
    messages?: Array<{
      text: string;
      photo?: string;
      keyboard?: any;
    }>;
  }> {
    const eventType = this.formatEventType(event.eventType, event.date);
    
    // Check if this is a B2B event
    if (event.djNames && event.djNames.length > 1) {
      // B2B event with multiple DJs - create intro message + separate messages for each DJ
      const messages: Array<{
        text: string;
        photo?: string;
        keyboard?: any;
      }> = [];
      
      // Create intro message mentioning the B2B
      // Use the same time logic as single events - capitalize when first word
      const timeTextLower = this.getTimeText(event.date);
      const timeText = timeTextLower.charAt(0).toUpperCase() + timeTextLower.slice(1);
      
      const introMessage = {
        text: `🌟 ${timeText} with <b>${event.djNames.join(' & ')}</b> ✨\n\n🎶 ${eventType} B2B 🎶`
      };
      messages.push(introMessage);
      
      // Create separate message for each DJ in the B2B event
      for (const djName of event.djNames) {
        // Get enhanced DJ info from Wix with fallback
        const djInfo = this.getDJInfo(djName);
        
        // For B2B events, just show the description without repetitive event text
        let eventText = '';
        
        // Add description if available
        if (djInfo && djInfo.shortDescription) {
          eventText = djInfo.shortDescription;
        }
        
        // Create buttons row for this DJ
        const buttons: Array<{ text: string; url: string }> = [];

        // Tickets button
        const ticketUrl = sanitizeUrl(event.ticketUrl);
        if (ticketUrl) {
          buttons.push({ text: '🎟️ TICKETS', url: ticketUrl });
        }

        // SoundCloud button if available
        if (djInfo?.soundcloudUrl) {
          const soundcloudUrl = sanitizeUrl(djInfo.soundcloudUrl);
          if (soundcloudUrl) {
            buttons.push({ text: '🎧 LISTEN', url: soundcloudUrl });
          }
        }

        // Instagram button if available
        if (djInfo?.instagramUrl) {
          const instagramUrl = sanitizeUrl(djInfo.instagramUrl);
          if (instagramUrl) {
            buttons.push({ text: '📸 INSTAGRAM', url: instagramUrl });
          }
        }

        // Website button if available
        if (djInfo?.website) {
          const websiteUrl = sanitizeUrl(djInfo.website);
          if (websiteUrl) {
            buttons.push({ text: '🌐 WEBSITE', url: websiteUrl });
          }
        }

        const keyboard = buttons.length > 0 ? { inline_keyboard: [buttons] } : undefined;
        
        const message: {
          text: string;
          photo?: string;
          keyboard?: any;
        } = {
          text: eventText,
          keyboard: keyboard
        };
        
        // Add photo if available for this DJ
        if (djInfo && djInfo.photo) {
          message.photo = djInfo.photo;
        }
        
        messages.push(message);
      }
      
      // Return the intro text and separate messages for each DJ
      return {
        text: '', // No intro text since it's included in messages
        messages: messages
      };
    } else {
      // Single DJ event - simplified one-line format
      const djName = event.djName || 'TBA';
      
      // Get enhanced DJ info from Wix with fallback
      const djInfo = this.getDJInfo(djName);
      
      // Build the enhanced event text - combine intro and event into one line
      // Use the same time logic as B2B events - capitalize when first word
      const timeTextLower = this.getTimeText(event.date);
      const timeText = timeTextLower.charAt(0).toUpperCase() + timeTextLower.slice(1);
      
      let eventText = `🎶 ${timeText} ${eventType} with <b>${djInfo ? djInfo.name : djName}</b> 🎶`;
      
      // Add description if available
      if (djInfo && djInfo.shortDescription) {
        eventText += `\n\n${djInfo.shortDescription}`;
      }
      
      // Create buttons row
      const buttons: Array<{ text: string; url: string }> = [];

      // Tickets button
      const ticketUrl = sanitizeUrl(event.ticketUrl);
      if (ticketUrl) {
        buttons.push({ text: '🎟️ TICKETS', url: ticketUrl });
      }

      // SoundCloud button if available
      if (djInfo?.soundcloudUrl) {
        const soundcloudUrl = sanitizeUrl(djInfo.soundcloudUrl);
        if (soundcloudUrl) {
          buttons.push({ text: '🎧 LISTEN', url: soundcloudUrl });
        }
      }

      // Instagram button if available
      if (djInfo?.instagramUrl) {
        const instagramUrl = sanitizeUrl(djInfo.instagramUrl);
        if (instagramUrl) {
          buttons.push({ text: '📸 INSTAGRAM', url: instagramUrl });
        }
      }

      // Website button if available
      if (djInfo?.website) {
        const websiteUrl = sanitizeUrl(djInfo.website);
        if (websiteUrl) {
          buttons.push({ text: '🌐 WEBSITE', url: websiteUrl });
        }
      }

      const keyboard = buttons.length > 0 ? { inline_keyboard: [buttons] } : undefined;

      return {
        text: eventText,
        photos: djInfo?.photo ? [djInfo.photo] : undefined,
        keyboard
      } as { text: string; photos?: string[]; keyboard?: any };
    }
  }

  /**
   * Format multiple events with separate messages for each DJ
   */
  private async formatMultipleEvents(events: Event[], introText: string): Promise<{ 
    text: string; 
    photos?: string[]; 
    keyboard?: any;
    messages?: Array<{
      text: string;
      photo?: string;
      keyboard?: any;
    }>;
  }> {
    const messages: Array<{
      text: string;
      photo?: string;
      keyboard?: any;
    }> = [];
    
    // Create separate message for each event/DJ
    for (const event of events) {
      const eventType = this.formatEventType(event.eventType, event.date);
      const djName = event.djName || 'TBA';
      
      // Get enhanced DJ info from Wix with fallback
      const djInfo = this.getDJInfo(djName);
      
      // Build the event text - use simplified one-line format
      // Use the same time logic as other formats - capitalize when first word
      const timeTextLower = this.getTimeText(event.date);
      const timeText = timeTextLower.charAt(0).toUpperCase() + timeTextLower.slice(1);
      
      let eventText = `🎶 ${timeText} ${eventType} with <b>${djInfo ? djInfo.name : djName}</b> 🎶`;
      
      // Add description if available
      if (djInfo && djInfo.shortDescription) {
        eventText += `\n\n${djInfo.shortDescription}`;
      }
      
      // Create buttons row for this event
      const buttons: Array<{ text: string; url: string }> = [];

      // Tickets button
      const ticketUrl = sanitizeUrl(event.ticketUrl);
      if (ticketUrl) {
        buttons.push({ text: '🎟️ TICKETS', url: ticketUrl });
      }

      // SoundCloud button if available
      if (djInfo?.soundcloudUrl) {
        const soundcloudUrl = sanitizeUrl(djInfo.soundcloudUrl);
        if (soundcloudUrl) {
          buttons.push({ text: '🎧 LISTEN', url: soundcloudUrl });
        }
      }

      // Instagram button if available
      if (djInfo?.instagramUrl) {
        const instagramUrl = sanitizeUrl(djInfo.instagramUrl);
        if (instagramUrl) {
          buttons.push({ text: '📸 INSTAGRAM', url: instagramUrl });
        }
      }

      // Website button if available
      if (djInfo?.website) {
        const websiteUrl = sanitizeUrl(djInfo.website);
        if (websiteUrl) {
          buttons.push({ text: '🌐 WEBSITE', url: websiteUrl });
        }
      }

      const keyboard = buttons.length > 0 ? { inline_keyboard: [buttons] } : undefined;
      
      const message: {
        text: string;
        photo?: string;
        keyboard?: any;
      } = {
        text: eventText,
        keyboard: keyboard
      };
      
      // Add photo if available
      if (djInfo && djInfo.photo) {
        message.photo = djInfo.photo;
      }
      
      messages.push(message);
    }
    
    // Return the intro text and separate messages
    return {
      text: introText,
      messages: messages
    };
  }
} 