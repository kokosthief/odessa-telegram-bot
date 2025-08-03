import { WeeklyScheduleScraper } from './scrapers/weekly-schedule-scraper';
import { WeeklyScheduleFormatter } from './formatters/weekly-schedule-formatter';
import { WeeklyEvent, WeeklySchedule } from './types/weekly-event';

export class WeeklyScheduleGenerator {
  private scraper: WeeklyScheduleScraper;
  private formatter: WeeklyScheduleFormatter;

  constructor() {
    this.scraper = new WeeklyScheduleScraper();
    this.formatter = new WeeklyScheduleFormatter();
  }

  /**
   * Generate weekly schedule with video integration
   */
  async generateWeeklySchedule(): Promise<WeeklySchedule> {
    try {
      console.log('🪩 Generating weekly schedule...');
      
      // Scrape weekly events
      const events = await this.scraper.scrapeWeeklySchedule();
      
      if (!events || events.length === 0) {
        console.warn('No events found, using fallback schedule');
        return this.generateFallbackSchedule();
      }
      
      // Format weekly schedule with video
      const weeklySchedule = await this.formatter.formatWeeklySchedule(events);
      
      console.log('✅ Weekly schedule generated successfully');
      return weeklySchedule;
    } catch (error) {
      console.error('❌ Failed to generate weekly schedule:', error);
      
      // Return fallback schedule on error
      return this.generateFallbackSchedule();
    }
  }

  /**
   * Generate fallback schedule when scraping fails
   */
  private async generateFallbackSchedule(): Promise<WeeklySchedule> {
    console.log('🔄 Generating fallback weekly schedule...');
    
    const fallbackEvents: WeeklyEvent[] = [
      {
        day: 'wednesday',
        eventType: 'Ecstatic Dance',
        djName: 'TBA',
        ticketUrl: 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance',
        date: this.getDateForDay('wednesday').toISOString()
      },
      {
        day: 'thursday',
        eventType: 'Ecstatic Dance',
        djName: 'TBA',
        ticketUrl: 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance',
        date: this.getDateForDay('thursday').toISOString()
      },
      {
        day: 'friday',
        eventType: 'Ecstatic Dance',
        djName: 'TBA',
        ticketUrl: 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance',
        date: this.getDateForDay('friday').toISOString()
      },
      {
        day: 'saturday',
        eventType: 'Ecstatic Dance',
        djName: 'TBA',
        ticketUrl: 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance',
        date: this.getDateForDay('saturday').toISOString()
      },
      {
        day: 'sunday',
        eventType: 'Ecstatic Dance',
        djName: 'TBA',
        ticketUrl: 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance',
        date: this.getDateForDay('sunday').toISOString()
      }
    ];

    return await this.formatter.formatWeeklySchedule(fallbackEvents);
  }

  /**
   * Get date for a specific day of the week
   */
  private getDateForDay(day: string): Date {
    const today = new Date();
    const currentDay = today.getDay();
    
    const dayMap: Record<string, number> = {
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0
    };
    
    const targetDay = dayMap[day];
    if (targetDay === undefined) {
      // Fallback to current day if day not found
      return today;
    }
    
    const daysToAdd = (targetDay - currentDay + 7) % 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    targetDate.setHours(12, 0, 0, 0);
    
    return targetDate;
  }

  /**
   * Test weekly schedule generation (for CLI)
   */
  async testWeeklySchedule(): Promise<void> {
    try {
      console.log('🧪 Testing weekly schedule generation...');
      
      const schedule = await this.generateWeeklySchedule();
      
      console.log('📋 Generated Schedule:');
      console.log('Video File ID:', schedule.videoFileId);
      console.log('Text:', schedule.text);
      console.log('Keyboard:', JSON.stringify(schedule.keyboard, null, 2));
      
      console.log('✅ Weekly schedule test completed successfully');
    } catch (error) {
      console.error('❌ Weekly schedule test failed:', error);
    }
  }
} 