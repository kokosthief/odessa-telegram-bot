export interface Event {
  id: string;
  title: string;
  date: string; // ISO date string
  picture?: string;
  ticketUrl: string;
  originalDate: string;
  djName?: string | undefined;
  eventType?: 'ED' | 'Cacao ED' | 'Live Music' | 'Queerstatic' | undefined;
  description?: string;
}

export interface ProcessedEvent {
  _id: string;
  title: string;
  date: string; // Formatted date
  picture: string;
  ticketUrl: string;
  originalDate: string;
  djName?: string;
  eventType?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ScrapingResult {
  events: Event[];
  totalCount: number;
  success: boolean;
  error?: string;
} 