import { WeeklyEvent, WeeklySchedule } from '../types/weekly-event';

export class WeeklyScheduleFormatter {
  private readonly videoFileId = 'BAACAgQAAxkBAANIaIyYDXy2RFmnv6EZy2nsU2WqAsgAAmsYAAIvy2hQIXfzFx9DIcY2BA';
  private readonly ticketsUrl = 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance';

  /**
   * Format weekly events into a Telegram message with video
   */
  async formatWeeklySchedule(events: WeeklyEvent[]): Promise<WeeklySchedule> {
    try {
      // Sort events by day order
      const sortedEvents = this.sortEventsByDay(events);
      
      // Format the schedule text
      const formattedText = this.formatScheduleText(sortedEvents);
      
      // Create inline keyboard for tickets
      const keyboard = this.createTicketsKeyboard();
      
      return {
        videoFileId: this.videoFileId,
        text: formattedText,
        keyboard
      };
    } catch (error) {
      console.error('Failed to format weekly schedule:', error);
      throw new Error('Weekly schedule formatting failed');
    }
  }

  /**
   * Sort events by day order (Wednesday to Sunday)
   */
  private sortEventsByDay(events: WeeklyEvent[]): WeeklyEvent[] {
    const dayOrder = ['wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return events.sort((a, b) => {
      const aIndex = dayOrder.indexOf(a.day);
      const bIndex = dayOrder.indexOf(b.day);
      return aIndex - bIndex;
    });
  }

  /**
   * Format schedule text with proper styling
   */
  private formatScheduleText(events: WeeklyEvent[]): string {
    const dayLabels = {
      wednesday: 'Wed',
      thursday: 'Thu', 
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };

    let formattedText = '🪩 <b><u>This Week</u></b> 🌴🎶\n\n';

    events.forEach(event => {
      const dayLabel = dayLabels[event.day];
      const eventType = this.formatEventType(event.eventType);
      const djName = event.djName || 'TBA';
      
      // Create clickable event name with ticket link
      const eventName = `<a href="${event.ticketUrl}">${eventType} | ${djName}</a>`;
      
      formattedText += `🗓️ ${dayLabel}: ${eventName}\n`;
    });

    return formattedText.trim();
  }

  /**
   * Format event type for display
   */
  private formatEventType(eventType: string): string {
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
   * Create inline keyboard with tickets button
   */
  private createTicketsKeyboard(): any {
    return {
      inline_keyboard: [
        [
          {
            text: '🎫 Tickets',
            url: this.ticketsUrl
          }
        ]
      ]
    };
  }




} 