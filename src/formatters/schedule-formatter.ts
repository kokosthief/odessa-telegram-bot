import { Event } from '../types/event';
import { DJLoader } from '../utils/dj-loader';
import { WixDJLoader } from '../utils/wix-dj-loader';

export class ScheduleFormatter {
  private djLoader: DJLoader;
  private wixDJLoader: WixDJLoader;

  constructor() {
    this.djLoader = new DJLoader();
    this.wixDJLoader = new WixDJLoader();
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

      events.forEach((event, index) => {
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

        // Special handling for multiple Sunday events
        let dayLabel: string;
        if (day === 'Sun' && events.length > 1) {
          if (index === 0) {
            // First Sunday event (morning)
            dayLabel = `${day}: Morning ED`;
          } else {
            // Subsequent Sunday events (evening/night)
            dayLabel = `${day}: ${eventType}`;
          }
        } else {
          // Use event type in the day label for other multiple events
          dayLabel = eventType === 'ED' ? `${day}: ED` : `${day}: ${eventType}`;
        }

        lines.push(`🗓️ <b>${dayLabel} ${eventDescription}</b>`);
      });

      return lines.join('\n');
    } else {
      // Single event
      const event = events[0];
      if (!event) {
        return `🗓️ <b>${day}: No events</b>`;
      }

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

      return `🗓️ <b>${day}: ${eventType} ${eventDescription}</b>`;
    }
  }

  /**
   * Format event type for display
   */
  private formatEventType(eventType?: string): string {
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
   * Generate intro text
   */
  private generateIntroText(): string {
    return "🪩 <b><u>This Week</u></b> 🌴🎶";
  }

  /**
   * Format schedule with DJ social media links
   */
  async formatScheduleWithDJLinks(events: Event[]): Promise<string> {
    return this.formatWeeklySchedule(events);
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

  /**
   * Format enhanced today's schedule with Wix DJ data
   */
  async formatEnhancedTodaySchedule(events: Event[]): Promise<{ text: string; photos?: string[]; keyboard?: any }> {
    console.log('🎭 Formatting enhanced today schedule...');
    console.log(`📊 Processing ${events.length} events`);
    console.log('🔍 WixDJLoader available:', !!this.wixDJLoader);
    
    if (events.length === 0) {
      return { text: '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.' };
    }

    // Generate exciting intro text for today with DJ name
    const djName = events[0]?.djName || 'TBA';
    const isEvening = new Date().getHours() >= 12; // Afternoon/evening events
    const timeText = isEvening ? 'on the boat tonight' : 'today';
    const introText = `🌟 <b>${timeText}</b> with <b>${djName}</b> ✨`;
    
    // Format today's events with enhanced DJ info
    const eventLines: string[] = [];
    const photos: string[] = [];
    
    for (const event of events) {
      console.log(`🎭 Raw event data:`, {
        eventType: event.eventType,
        djName: event.djName,
        title: event.title
      });
      
      console.log(`🎭 Hipsy event title: "${event.title}"`);
      console.log(`🎭 Hipsy event type: "${event.eventType}"`);
      
      const eventType = this.formatEventType(event.eventType);
      const djName = event.djName || 'TBA';
      
      console.log(`🎭 Formatted event type: "${eventType}" from raw: "${event.eventType}"`);
      console.log(`🎭 Event title: "${event.title}"`);
      console.log(`🎭 Event type detection: "${event.eventType}" -> "${eventType}"`);
      console.log(`Processing event with DJ: "${djName}"`);
      
      // Get enhanced DJ info from Wix with fallback
      const djInfo = await this.wixDJLoader.getDJInfoWithFallback(djName);
      
      console.log(`Enhanced DJ info found: ${djInfo ? 'YES' : 'NO'}`);
      if (djInfo) {
        console.log(`✅ Found Wix data for: ${djInfo.name}`);
        console.log(`   Photo: ${djInfo.photo ? 'YES' : 'NO'}`);
        console.log(`   Photo URL: ${djInfo.photo || 'NONE'}`);
        console.log(`   Description: ${djInfo.shortDescription ? 'YES' : 'NO'}`);
        console.log(`   Description text: ${djInfo.shortDescription || 'NONE'}`);
      } else {
        console.log(`❌ No Wix data found for: "${djName}"`);
      }
      
      // Build the enhanced event text
      let eventText = `🎶 <b>${eventType}</b> with <b>${djInfo ? djInfo.name : djName}</b> 🎶`;
      
      // Add photo if available
      if (djInfo && djInfo.photo) {
        console.log(`📸 Adding photo to array: ${djInfo.photo}`);
        photos.push(djInfo.photo);
      }
      
      // Add description if available
      if (djInfo && djInfo.shortDescription) {
        console.log(`📝 Adding description to text: ${djInfo.shortDescription}`);
        eventText += `\n\n${djInfo.shortDescription}`;
      }
      
      console.log(`🎭 Final event text: ${eventText}`);
      eventLines.push(eventText);
    }
    
    // Join events with line breaks
    const eventsText = eventLines.join('\n\n');
    
    // Create ticket and SoundCloud buttons for each event
    const keyboardButtons = await Promise.all(events.map(async (event) => {
      const eventType = this.formatEventType(event.eventType);
      const ticketButtonText = events.length === 1 ? 'TICKETS 🎟️' : `${eventType} TICKETS 🎟️`;
      
      // Get DJ info for SoundCloud link
      const djName = event.djName || 'TBA';
      const djInfo = await this.wixDJLoader.getDJInfoWithFallback(djName);
      
      const buttons = [{
        text: ticketButtonText,
        url: event.ticketUrl || 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance'
      }];
      
      // Add SoundCloud button if available
      if (djInfo && djInfo.soundcloudUrl) {
        buttons.push({
          text: '🎵 SOUNDCLOUD',
          url: djInfo.soundcloudUrl
        });
      }
      
      return buttons;
    }));
    
    const keyboard = {
      inline_keyboard: keyboardButtons
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
} 