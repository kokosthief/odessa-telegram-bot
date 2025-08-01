import { Event } from '../types/event';
import { DJLoader } from '../utils/dj-loader';
import { DJDataLoader } from '../utils/dj-data-loader';

export class ScheduleFormatter {
  private djLoader: DJLoader;
  private djDataLoader?: DJDataLoader;

  constructor() {
    this.djLoader = new DJLoader();
    // Temporarily disable DJDataLoader to fix 500 error
    // console.log('Initializing DJDataLoader...');
    // this.djDataLoader = new DJDataLoader();
    // console.log('DJDataLoader initialized');
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
   * Format today's schedule specifically
   */
  formatTodaySchedule(events: Event[]): string {
    if (events.length === 0) {
      return '🎭 <b>Today\'s Schedule</b>\n\nNo events scheduled for today.';
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
      
      // Get enhanced DJ info from CSV
      const djInfo = this.djDataLoader?.getDJInfo(djName);
      const onlineLink = djInfo && this.djDataLoader ? this.djDataLoader.getBestOnlineLink(djInfo) : null;
      
      console.log(`DJ info found: ${djInfo ? 'YES' : 'NO'}, Online link: ${onlineLink ? 'YES' : 'NO'}`);
      
      let eventDescription: string;
      
      if (djInfo && onlineLink) {
        eventDescription = `<b>${eventType} W/ <a href="${onlineLink.url}">${djName}</a></b>`;
      } else {
        // Fallback to original DJ loader
        const fallbackDJInfo = this.djLoader.getDJInfo(djName);
        if (fallbackDJInfo && fallbackDJInfo.link && fallbackDJInfo.link.trim() !== '') {
          const link = fallbackDJInfo.link;
          eventDescription = `<b>${eventType} W/ <a href="${link}">${djName}</a></b>`;
        } else {
          eventDescription = `<b>${eventType} W/ ${djName}</b>`;
        }
      }
      
      let eventText = `🎵 ${eventDescription}`;
      
      // Add DJ description and online link if available
      if (djInfo) {
        if (djInfo.shortDescription && djInfo.shortDescription.trim()) {
          eventText += `\n💭 ${djInfo.shortDescription}`;
        }
        
        if (onlineLink) {
          eventText += `\n🎧 <b>Listen to them online:</b> <a href="${onlineLink.url}">${onlineLink.platform}</a>`;
        }
      }
      
      return eventText;
    });
    
    // Join events with line breaks
    const eventsText = eventLines.join('\n\n');
    
    return `${introText}\n\n${eventsText}`;
  }

} 