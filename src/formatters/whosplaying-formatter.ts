import { Event } from '../types/event';
import { WixDJLoader } from '../utils/wix-dj-loader';
import { utcToZonedTime } from 'date-fns-tz';

export class WhosPlayingFormatter {
  private wixDJLoader: WixDJLoader;
  private amsterdamTimezone = 'Europe/Amsterdam';

  constructor() {
    this.wixDJLoader = new WixDJLoader();
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
      const hasEveningEvents = events.some(event => {
        const eventTime = new Date(event.date);
        return eventTime.getHours() >= 18; // 6:00 PM
      });
      const timeText = hasEveningEvents ? 'on the boat tonight' : 'Today';
      
      // Single event - use DJ name
      const djName = events[0]?.djName || 'TBA';
      return `🌟 <b>${timeText}</b> with <b>${djName}</b> ✨`;
    } else {
      // Multiple events - always use "Today on the boat" for simplicity
      const timeText = 'Today on the boat';
      
      // Multiple events - create a more dynamic intro
      const uniqueDJs = [...new Set(events.map(e => e.djName).filter(Boolean))];
      
      if (uniqueDJs.length === 1) {
        // Same DJ for multiple events
        const djName = uniqueDJs[0];
        return `🌟 <b>${timeText}</b> with <b>${djName}</b> ✨\n\nMultiple events with the same DJ!`;
      } else {
        // Different DJs - create a more exciting intro
        const djNames = uniqueDJs.slice(0, 2).join(' & ');
        const remainingCount = uniqueDJs.length - 2;
        const djText = remainingCount > 0 ? `${djNames} & ${remainingCount} more` : djNames;
        
        return `🌟 <b>${timeText}</b> with <b>${djText}</b> ✨\n\nA day filled with amazing music!`;
      }
    }
  }

  /**
   * Format today's schedule specifically (legacy method for backward compatibility)
   */
  formatTodaySchedule(events: Event[]): { text: string; keyboard?: any } {
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
        url: event.ticketUrl || 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance'
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
    console.log('🔍 WixDJLoader available:', !!this.wixDJLoader);
    
    if (events.length === 0) {
      return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
    }

    // Generate exciting intro text for today with DJ name
    const introText = this.generateMultiEventIntro(events);
    
    // If single event, use the original format
    if (events.length === 1) {
      return this.formatSingleEvent(events[0]!, introText);
    }
    
    // For multiple events, create separate messages for each DJ with photo
    return this.formatMultipleEvents(events, introText);
  }

  /**
   * Format a single event (original logic)
   */
  private async formatSingleEvent(event: Event, introText: string): Promise<{ 
    text: string; 
    photos?: string[]; 
    keyboard?: any;
  }> {
    const eventType = this.formatEventType(event.eventType, event.date);
    const djName = event.djName || 'TBA';
    
    // Get enhanced DJ info from Wix with fallback
    const djInfo = await this.wixDJLoader.getDJInfoWithFallback(djName);
    
    // Build the enhanced event text
    let eventText = `🎶 <b>${eventType}</b> with <b>${djInfo ? djInfo.name : djName}</b> 🎶`;
    
    // Add description if available
    if (djInfo && djInfo.shortDescription) {
      eventText += `\n\n${djInfo.shortDescription}`;
    }
    
    // Create ticket and SoundCloud buttons
    const ticketButtonText = 'TICKETS 🎟️';
    const buttons = [{
      text: ticketButtonText,
      url: event.ticketUrl || 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance'
    }];
    
    // Add SoundCloud button if available
    if (djInfo && djInfo.soundcloudUrl) {
      buttons.push({
        text: '🎧 LISTEN',
        url: djInfo.soundcloudUrl
      });
    }
    
    const keyboard = {
      inline_keyboard: [buttons]
    };
    
    const result: { text: string; photos?: string[]; keyboard?: any } = {
      text: `${introText}\n\n${eventText}`,
      keyboard: keyboard
    };
    
    // Add photo if available
    if (djInfo && djInfo.photo) {
      result.photos = [djInfo.photo];
    }
    
    return result;
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
      const djInfo = await this.wixDJLoader.getDJInfoWithFallback(djName);
      
      // Build the event text
      let eventText = `🎶 <b>${eventType}</b> with <b>${djInfo ? djInfo.name : djName}</b> 🎶`;
      
      // Add description if available
      if (djInfo && djInfo.shortDescription) {
        eventText += `\n\n${djInfo.shortDescription}`;
      }
      
      // Create ticket and SoundCloud buttons for this event
      const ticketButtonText = 'TICKETS 🎟️';
      const buttons = [{
        text: ticketButtonText,
        url: event.ticketUrl || 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance'
      }];
      
      // Add SoundCloud button if available
      if (djInfo && djInfo.soundcloudUrl) {
        buttons.push({
          text: '🎧 LISTEN',
          url: djInfo.soundcloudUrl
        });
      }
      
      const keyboard = {
        inline_keyboard: [buttons]
      };
      
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