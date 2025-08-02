import { Event } from '../types/event';
import { DJLoader } from '../utils/dj-loader';
import { WixDJLoader } from '../utils/wix-dj-loader';

export class ScheduleFormatter {
  private djLoader: DJLoader;
  private wixDJLoader: WixDJLoader;

  constructor() {
    this.djLoader = new DJLoader();
    console.log('🔧 Creating WixDJLoader...');
    this.wixDJLoader = new WixDJLoader();
    console.log('✅ WixDJLoader created successfully');
  }

  /**
   * Format events into a weekly schedule
   */
  formatWeeklySchedule(events: Event[]): string {
    if (events.length === 0) {
      return 'No events found for this week.';
    }

    // Group events by day of week
    const eventsByDay = this.groupEventsByDay(events);
    
    // Generate intro text
    const introText = this.generateIntroText();
    
    // Format schedule lines
    const scheduleLines = this.formatScheduleLines(eventsByDay);
    
    // Combine into final format
    return `${introText}\n\n${scheduleLines}`;
  }

  /**
   * Group events by day of week
   */
  private groupEventsByDay(events: Event[]): { [key: string]: Event[] } {
    const grouped: { [key: string]: Event[] } = {};
    
    events.forEach(event => {
      const date = new Date(event.date);
      const dayName = this.getDayName(date);
      
      if (!grouped[dayName]) {
        grouped[dayName] = [];
      }
      grouped[dayName].push(event);
    });
    
    return grouped;
  }

  /**
   * Get day name for schedule display
   */
  private getDayName(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()] || 'Unknown';
  }

  /**
   * Format schedule lines for each day
   */
  private formatScheduleLines(eventsByDay: { [key: string]: Event[] }): string {
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const lines: string[] = [];
    
    dayOrder.forEach(day => {
      const dayEvents = eventsByDay[day];
      if (dayEvents && dayEvents.length > 0) {
        const eventLine = this.formatDayEvents(day, dayEvents);
        lines.push(eventLine);
      }
    });
    
    return lines.join('\n');
  }

  /**
   * Format events for a specific day
   */
  private formatDayEvents(day: string, events: Event[]): string {
    // Sort events by date to ensure chronological order
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Handle multiple events on the same day
    if (events.length > 1) {
      const lines: string[] = [];
      
      events.forEach((event) => {
        const eventType = this.formatEventType(event.eventType);
        const djName = event.djName || 'TBA';
        
        // Check if DJ has a link and create hyperlink
        const djInfo = this.djLoader.getDJInfo(djName);
        let eventDescription: string;
        
        if (djInfo && djInfo.link && djInfo.link.trim() !== '') {
          const link = djInfo.link;
          eventDescription = `<b>| <a href="${link}">${djName}</a></b>`;
        } else {
          eventDescription = `<b>| ${djName}</b>`;
        }
        
        const eventTitle = event.title || `${eventType} Event`;
        const line = `🗓️ ${day}: ${eventTitle} W/ ${eventDescription}`;
        lines.push(line);
      });
      
      return lines.join('\n');
          } else {
        // Single event for the day
        const event = events[0];
        if (!event) {
          return `🗓️ ${day}: No events`;
        }
        
        const eventType = this.formatEventType(event.eventType);
        const djName = event.djName || 'TBA';
        
        // Check if DJ has a link and create hyperlink
        const djInfo = this.djLoader.getDJInfo(djName);
        let eventDescription: string;
        
        if (djInfo && djInfo.link && djInfo.link.trim() !== '') {
          const link = djInfo.link;
          eventDescription = `<b><a href="${link}">${djName}</a></b>`;
        } else {
          eventDescription = `<b>${djName}</b>`;
        }
        
        const eventTitle = event.title || `${eventType} Event`;
        return `🗓️ ${day}: ${eventTitle} W/ ${eventDescription}`;
      }
  }

  /**
   * Format event type for display
   */
  private formatEventType(eventType?: string): string {
    if (!eventType) return 'Event';
    
    switch (eventType.toLowerCase()) {
      case 'ecstatic dance':
        return 'ED';
      case 'cacao ecstatic dance':
        return 'Cacao ED';
      case 'live music':
        return 'Live Music';
      case 'queerstatic':
        return 'Queerstatic';
      default:
        return 'Event';
    }
  }

  /**
   * Generate intro text
   */
  private generateIntroText(): string {
    return "🪩 <b><u>This Week</u></b> 🌴🎶";
  }

  /**
   * Format schedule with DJ links
   */
  formatScheduleWithDJLinks(events: Event[]): string {
    if (events.length === 0) {
      return 'No events found for this week.';
    }

    // Group events by day of week
    const eventsByDay = this.groupEventsByDay(events);
    
    // Generate intro text
    const introText = this.generateIntroText();
    
    // Format schedule lines
    const scheduleLines = this.formatScheduleLines(eventsByDay);
    
    // Combine into final format
    return `${introText}\n\n${scheduleLines}`;
  }

  /**
   * Format today's schedule with enhanced DJ information
   */
  async formatEnhancedTodaySchedule(events: Event[]): Promise<{ text: string; photos?: string[]; keyboard?: any }> {
    console.log('🎭 Formatting enhanced today schedule...');
    console.log(`📊 Processing ${events.length} events`);
    console.log('🔍 WixDJLoader available:', !!this.wixDJLoader);
    
    if (events.length === 0) {
      return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
    }

    const today = new Date();
    const dayName = this.getDayName(today);
    
    // Generate intro text for today
    const introText = `🎭 <b>Today's Schedule</b> (${dayName})`;
    
    // Format today's events with enhanced DJ info
    const eventLines: string[] = [];
    const photos: string[] = [];
    
    for (const event of events) {
      const eventType = this.formatEventType(event.eventType);
      const djName = event.djName || 'TBA';
      
      console.log(`Processing event with DJ: "${djName}"`);
      
      // Get enhanced DJ info from Wix with fallback
      const djInfo = await this.wixDJLoader.getDJInfoWithFallback(djName);
      
      console.log(`Enhanced DJ info found: ${djInfo ? 'YES' : 'NO'}`);
      
      // Build the full event description with title and DJ
      let eventDescription: string;
      
      // Start with the event title
      const eventTitle = event.title || `${eventType} Event`;
      console.log(`🎭 Processing event: "${eventTitle}" with DJ: "${djName}"`);
      eventDescription = `<b>${eventTitle}</b>`;
      
      // Add DJ information
      if (djInfo) {
        // Use enhanced DJ info if available
        if (djInfo.soundcloudUrl && djInfo.soundcloudUrl.trim() !== '') {
          eventDescription += `\n🎵 <b>${eventType} W/ <a href="${djInfo.soundcloudUrl}">${djInfo.name}</a></b>`;
        } else if (djInfo.website && djInfo.website.trim() !== '') {
          eventDescription += `\n🎵 <b>${eventType} W/ <a href="${djInfo.website}">${djInfo.name}</a></b>`;
        } else {
          eventDescription += `\n🎵 <b>${eventType} W/ ${djInfo.name}</b>`;
        }
        
        // Add photo if available
        if (djInfo.photo) {
          photos.push(djInfo.photo);
        }
        
        // Add description if available
        if (djInfo.shortDescription) {
          eventDescription += `\n\n${djInfo.shortDescription}`;
        }
      } else {
        // Fallback to existing DJ loader
        const fallbackInfo = this.djLoader.getDJInfo(djName);
        
        if (fallbackInfo && fallbackInfo.link && fallbackInfo.link.trim() !== '') {
          const link = fallbackInfo.link;
          eventDescription += `\n🎵 <b>${eventType} W/ <a href="${link}">${djName}</a></b>`;
        } else {
          eventDescription += `\n🎵 <b>${eventType} W/ ${djName}</b>`;
        }
      }
      
      let eventText = eventDescription;
      eventLines.push(eventText);
    }
    
    // Join events with line breaks
    const eventsText = eventLines.join('\n\n');
    
    // Create ticket buttons for each event
    const ticketButtons = events.map((event) => {
      const eventType = this.formatEventType(event.eventType);
      const buttonText = events.length === 1 ? 'TICKETS 🎟️' : `${eventType} TICKETS 🎟️`;
      
      return [{
        text: buttonText,
        url: event.ticketUrl || 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance'
      }];
    });
    
    const keyboard = {
      inline_keyboard: ticketButtons
    };
    
    const result: { text: string; photos?: string[]; keyboard?: any } = {
      text: `${introText}\n\n${eventsText}`,
      keyboard: keyboard
    };
    
    if (photos.length > 0) {
      result.photos = photos;
    }
    
    return result;
  }

  /**
   * Format today's schedule specifically (legacy method for backward compatibility)
   */
  formatTodaySchedule(events: Event[]): { text: string; keyboard?: any } {
    if (events.length === 0) {
      return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
    }

    const today = new Date();
    const dayName = this.getDayName(today);
    
    // Generate intro text for today
    const introText = `🎭 <b>Today's Schedule</b> (${dayName})`;
    
    // Format today's events with enhanced DJ info
    const eventLines = events.map(event => {
      const eventType = this.formatEventType(event.eventType);
      const djName = event.djName || 'TBA';
      
      console.log(`Processing event with DJ: "${djName}"`);
      
      // Get DJ info from existing loader
      const djInfo = this.djLoader.getDJInfo(djName);
      
      console.log(`DJ info found: ${djInfo ? 'YES' : 'NO'}`);
      
      let eventDescription: string;
      
      if (djInfo && djInfo.link && djInfo.link.trim() !== '') {
        const link = djInfo.link;
        eventDescription = `<b>${eventType} W/ <a href="${link}">${djName}</a></b>`;
      } else {
        eventDescription = `<b>${eventType} W/ ${djName}</b>`;
      }
      
      let eventText = `🎵 ${eventDescription}`;
      
      return eventText;
    });
    
    // Join events with line breaks
    const eventsText = eventLines.join('\n\n');
    
    // Create ticket buttons for each event
    const ticketButtons = events.map((event) => {
      const eventType = this.formatEventType(event.eventType);
      const buttonText = events.length === 1 ? 'TICKETS 🎟️' : `${eventType} TICKETS 🎟️`;
      
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

} 