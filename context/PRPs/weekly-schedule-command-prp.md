# Product Requirements Prompt (PRP) - Weekly /schedule Command Feature

## Project Overview

**Project Name**: Odessa Telegram Bot - Weekly Schedule Command Implementation  
**Technology Stack**: Node.js, TypeScript, Telegram Bot API, Hipsy.no scraping  
**Primary Goal**: Implement `/schedule` command for weekly schedule display with video integration

## Context Analysis

### Current State
- Bot has `/whosplaying` command for today's schedule
- Enhanced DJ integration with photos from Wix CMS
- Hipsy.no scraping functionality exists
- Video file already uploaded to bot (File ID: BAACAgQAAxkBAANIaIyYDXy2RFmnv6EZy2nsU2WqAsgAAmsYAAIvy2hQIXfzFx9DIcY2BA)

### Target State
- New `/schedule` command for weekly schedule view
- Video integration with auto-playing video at top
- Weekly format showing Wednesday to Sunday
- Embedded ticket links in event names
- Separate implementation from `/whosplaying` command

## Technical Requirements

### Core Components

1. **Weekly Schedule Generator**
   - Scrape Hipsy.no for full week data (Wednesday to Sunday)
   - Handle historical data (past few days) + future data
   - Map event types to display format
   - Extract DJ names and ticket URLs

2. **Video Integration**
   - Auto-playing video at top of message
   - Use provided File ID: BAACAgQAAxkBAANIaIyYDXy2RFmnv6EZy2nsU2WqAsgAAmsYAAIvy2hQIXfzFx9DIcY2BA
   - Video positioning before schedule text

3. **Schedule Formatting**
   - Bold & underlined title: "🪩 This Week 🌴🎶"
   - List format: "🗓️ Day: Event Type | DJ Name"
   - Embedded ticket links in event names
   - Tickets button at bottom linking to https://hipsy.nl/odessa-amsterdam-ecstatic-dance

4. **Command Handler**
   - Separate implementation from `/whosplaying`
   - Rate limiting (60 seconds per user)
   - Error handling and user feedback
   - Typing indicators during generation

### Data Flow

```
User sends /schedule → Bot detects command → Scrape weekly data → Format with video → Send response
```

## Implementation Plan

### Phase 1: Weekly Schedule Scraper
- [ ] Create `weekly-schedule-scraper.ts` for Hipsy.no scraping
- [ ] Implement date range logic (Wednesday to Sunday)
- [ ] Handle historical + future data scraping
- [ ] Extract event types, DJ names, and ticket URLs

### Phase 2: Schedule Formatter
- [ ] Create `weekly-schedule-formatter.ts` for formatting
- [ ] Implement video integration with File ID
- [ ] Format weekly schedule with proper styling
- [ ] Add embedded ticket links and tickets button

### Phase 3: Command Handler
- [ ] Create separate command handler for `/schedule`
- [ ] Integrate weekly scraper and formatter
- [ ] Add rate limiting and error handling
- [ ] Implement typing indicators

### Phase 4: Testing and Validation
- [ ] Unit tests for weekly scraping
- [ ] Integration tests for complete workflow
- [ ] Error scenario testing
- [ ] Performance testing

## Success Criteria

### Functional Requirements
- [ ] Bot responds to `/schedule` with weekly view
- [ ] Shows events from Wednesday to Sunday
- [ ] Includes auto-playing video at top
- [ ] Embedded ticket links in event names
- [ ] Tickets button at bottom
- [ ] Handles special events (Queerstatic on first Sunday)

### Non-Functional Requirements
- [ ] Response time under 30 seconds
- [ ] Rate limiting prevents spam (60 seconds per user)
- [ ] Proper error logging and monitoring
- [ ] Graceful handling of scraping failures

### Quality Gates
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met

## Risk Assessment

### High Risk
- **Scraping Reliability**: Hipsy.no structure changes could break scraping
- **Video Integration**: Video file ID might become invalid
- **Date Logic**: Complex date range calculations for full week

### Medium Risk
- **Performance**: Weekly scraping could be slower than daily
- **Data Accuracy**: Missing events or incorrect DJ information
- **Special Events**: Queerstatic and other special event handling

### Mitigation Strategies
- Implement robust error handling for scraping failures
- Add fallback mechanisms for video integration
- Comprehensive testing of date logic
- Monitor and alert on scraping failures

## Implementation Details

### Weekly Schedule Scraper Pattern
```typescript
// Example weekly scraping pattern
async function scrapeWeeklySchedule(): Promise<WeeklyEvent[]> {
  const events: WeeklyEvent[] = [];
  const weekRange = getWeekRange(); // Wednesday to Sunday
  
  try {
    // Scrape historical data (past few days)
    const historicalEvents = await scrapeHistoricalEvents(weekRange.start);
    
    // Scrape future data (remaining days)
    const futureEvents = await scrapeFutureEvents(weekRange.end);
    
    // Combine and validate events
    const allEvents = [...historicalEvents, ...futureEvents];
    return validateAndFormatEvents(allEvents);
  } catch (error) {
    logger.error('Failed to scrape weekly schedule:', error);
    throw new Error('Weekly schedule scraping failed');
  }
}
```

### Schedule Formatting Pattern
```typescript
// Example weekly formatting pattern
async function formatWeeklySchedule(events: WeeklyEvent[]): Promise<WeeklySchedule> {
  const videoFileId = 'BAACAgQAAxkBAANIaIyYDXy2RFmnv6EZy2nsU2WqAsgAAmsYAAIvy2hQIXfzFx9DIcY2BA';
  
  const formattedText = `
🪩 <b><u>This Week</u></b> 🌴🎶

🗓️ Wed: ${formatEvent(events.wednesday)}
🗓️ Thu: ${formatEvent(events.thursday)}
🗓️ Fri: ${formatEvent(events.friday)}
🗓️ Sat: ${formatEvent(events.saturday)}
🗓️ Sun: ${formatEvent(events.sunday)}
  `.trim();
  
  return {
    videoFileId,
    text: formattedText,
    keyboard: createTicketsKeyboard()
  };
}
```

### Command Handler Pattern
```typescript
// Example command handling pattern
bot.onText(/\/schedule/, async (msg) => {
  try {
    // Check rate limiting
    if (isRateLimited(msg.from.id)) {
      await bot.sendMessage(msg.chat.id, 'Please wait before requesting again.');
      return;
    }
    
    // Show typing indicator
    await bot.sendChatAction(msg.chat.id, 'typing');
    
    // Generate weekly schedule
    const weeklySchedule = await weeklyGenerator.generateWeeklySchedule();
    
    // Send video with caption
    await bot.sendVideo(msg.chat.id, weeklySchedule.videoFileId, {
      caption: weeklySchedule.text,
      parse_mode: 'HTML',
      reply_markup: weeklySchedule.keyboard
    });
  } catch (error) {
    await bot.sendMessage(msg.chat.id, 'Sorry, I could not fetch the weekly schedule right now.');
  }
});
```

## Data Models

### Weekly Event Structure
```typescript
interface WeeklyEvent {
  day: 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  eventType: 'Ecstatic Dance' | 'Cacao Ecstatic Dance' | 'Queerstatic' | 'Live Music';
  djName: string;
  ticketUrl: string;
  date: string; // ISO date string
}
```

### Weekly Schedule Structure
```typescript
interface WeeklySchedule {
  videoFileId: string;
  text: string;
  keyboard: any;
}
```

## Event Type Mapping

### Display Format
- "Ecstatic Dance" → "ED"
- "Cacao Ecstatic Dance" → "Cacao ED"  
- "Queerstatic" → "Queerstatic"
- "Live Music" → "Live Music"

### Special Event Handling
- **Queerstatic**: First Sunday of each month
- **Multiple Events**: Handle cases where Sunday has both ED and Queerstatic
- **Missing Events**: Graceful handling when no events found for certain days

## Testing Requirements

### Unit Tests
- Weekly scraping functionality
- Date range calculations
- Event type mapping
- Schedule formatting
- Video integration

### Integration Tests
- Complete weekly schedule generation
- Command handling workflow
- Error scenarios
- Rate limiting

### Performance Tests
- Weekly scraping performance
- Video upload and display
- Command response times

## Monitoring and Observability

### Key Metrics
- Weekly schedule generation success rate
- Command usage frequency
- Video display success rate
- Scraping performance and reliability
- Error rates and types

### Logging Requirements
- Structured logging for weekly scraping
- Command usage tracking
- Error tracking with stack traces
- Performance metrics collection

## Security Considerations

### Data Protection
- Validate all scraped data
- Rate limiting to prevent abuse
- Secure handling of video file IDs
- Proper error message sanitization

### Access Control
- Minimal required permissions for bot
- Group permission validation
- User permission checking
- Audit logging for command usage

## Future Enhancements

### Potential Improvements
- Schedule caching for faster responses
- Multiple weekly format options
- Advanced filtering options
- Multi-language support
- Analytics dashboard for usage

### Scalability Considerations
- Horizontal scaling for high command volume
- Database optimization for schedule caching
- CDN integration for video assets
- Load balancing for multiple bot instances 