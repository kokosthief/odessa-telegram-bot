import { Event } from '../types/event';
import { DJLoader } from '../utils/dj-loader';

export class ScheduleFormatter {
  private djLoader: DJLoader;

  constructor() {
    this.djLoader = new DJLoader();
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
    // Sort events by date to ensure AM/PM order
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Handle multiple events on the same day
    if (events.length > 1) {
      const lines: string[] = [];
      
      events.forEach((event, index) => {
        const eventType = this.formatEventType(event.eventType);
        const djName = event.djName || 'TBA';
        
        // Determine AM/PM suffix
        const timeSuffix = index === 0 ? '(AM)' : '(PM)';
        
        // Check if DJ has a link and create hyperlink
        const djInfo = this.djLoader.getDJInfo(djName);
        let eventDescription: string;
        
        if (djInfo && djInfo.link && djInfo.link.trim() !== '') {
          const link = djInfo.link;
          eventDescription = `<b>${eventType} W/ <a href="${link}">${djName}</a></b>`;
        } else {
          eventDescription = `<b>${eventType} W/ ${djName}</b>`;
        }
        
        lines.push(`🗓️ <b>${day} ${timeSuffix}: ${eventDescription}</b>`);
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
        eventDescription = `<b>${eventType} W/ <a href="${link}">${djName}</a></b>`;
      } else {
        eventDescription = `<b>${eventType} W/ ${djName}</b>`;
      }
      
      return `🗓️ <b>${day}: ${eventDescription}</b>`;
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
    return "🪩 <b><u>Schedule</u></b> 🌴🎶";
  }

  /**
   * Format schedule with DJ social media links
   */
  formatScheduleWithDJLinks(events: Event[]): string {
    return this.formatWeeklySchedule(events);
  }

} 