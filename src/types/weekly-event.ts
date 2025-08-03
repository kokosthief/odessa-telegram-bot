export interface WeeklyEvent {
  day: 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  eventType: 'Ecstatic Dance' | 'Cacao Ecstatic Dance' | 'Queerstatic' | 'Live Music';
  djName: string;
  djSoundcloudUrl?: string;
  ticketUrl: string;
  date: string; // ISO date string
}

export interface WeeklySchedule {
  videoFileId: string;
  text: string;
  keyboard: any;
} 