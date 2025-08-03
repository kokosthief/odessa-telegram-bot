# Product Requirements Prompt (PRP) - /schedule Command Feature

## Project Overview

**Project Name**: Odessa Telegram Bot - /schedule Command Implementation  
**Technology Stack**: Node.js, TypeScript, Telegram Bot API, Hipsy API, Wix API  
**Primary Goal**: Implement `/schedule` command functionality for weekly schedule display with video integration and facilitator links

## Context Analysis

### Current State
- Bot has `/whosplaying` command for today's schedule
- Enhanced DJ integration with Wix CMS for photos and descriptions
- Hipsy API integration for event data
- Telegram Bot API with interactive command handling
- Rate limiting and error handling implemented

### Target State
- New `/schedule` command for weekly schedule (Wednesday to Sunday)
- Video integration with auto-playing video at top of message
- Facilitator names linked to SoundCloud via Wix API
- Tickets button linking to Hipsy.nl shop page
- Separate code module from `/whosplaying` functionality

## Technical Requirements

### Core Components

1. **Weekly Schedule Generator Module**
   - Separate from existing `/whosplaying` functionality
   - Hipsy API integration for weekly event data
   - Date range logic (Wednesday to Sunday, regardless of current day)
   - Event type mapping (ED, Cacao ED, Queerstatic, Morning ED)

2. **Video Integration**
   - Auto-playing video at top of message
   - Video ID: `BAACAgQAAxkBAANIaIyYDXy2RFmnv6EZy2nsU2WqAsgAAmsYAAIvy2hQIXfzFx9DIcY2BA`
   - Telegram video message integration

3. **Facilitator Link Integration**
   - Wix API integration for facilitator data
   - SoundCloud links embedded in facilitator names
   - Fallback handling when Wix API unavailable
   - Same DJ data system as `/whosplaying` command

4. **Message Formatting**
   - Bold and underlined "This Week" header
   - Day-by-day list format (Wed, Thu, Fri, Sat, Sun)
   - Event type and facilitator format: "ED | Facilitator Name"
   - HTML formatting with bold text
   - Tickets button at bottom

### Data Flow

```
User sends /schedule → Generate weekly schedule → Fetch facilitator data → Format message → Send video + schedule
```

## Implementation Plan

### Phase 1: Weekly Schedule Generator
- [ ] Create separate `WeeklyScheduleGenerator` class
- [ ] Implement Hipsy API integration for weekly data
- [ ] Add date range logic (Wednesday to Sunday)
- [ ] Event type mapping and formatting

### Phase 2: Video Integration
- [ ] Integrate Telegram video message functionality
- [ ] Add video ID configuration
- [ ] Implement video + text message combination
- [ ] Handle video sending errors

### Phase 3: Facilitator Link Integration
- [ ] Integrate existing Wix DJ loader for facilitator data
- [ ] Add SoundCloud link embedding in facilitator names
- [ ] Implement fallback to existing DJ data
- [ ] Handle missing facilitator data gracefully

### Phase 4: Command Integration
- [ ] Add `/schedule` command handler to bot
- [ ] Implement rate limiting (60 seconds per user)
- [ ] Add typing indicators during generation
- [ ] Error handling and user feedback

## Success Criteria

### Functional Requirements
- [ ] `/schedule` command responds in groups and DMs
- [ ] Displays weekly schedule (Wednesday to Sunday)
- [ ] Shows auto-playing video at top
- [ ] Facilitator names linked to SoundCloud
- [ ] Includes tickets button linking to Hipsy.nl
- [ ] Works regardless of current day (shows full week)

### Message Format Requirements
```
🪩 This Week 🌴🎶

🗓️ Wed: ED | Yarun Dee
🗓️ Thu: ED | Divana
🗓️ Fri: Cacao ED | Leela
🗓️ Sat: ED | Inphiknight
🗓️ Sun: Morning ED | Leela
🗓️ Sun: Queerstatic | Inphiknight

[TICKETS BUTTON]
```

### Non-Functional Requirements
- [ ] Response time under 30 seconds
- [ ] Rate limiting (60 seconds per user)
- [ ] Proper error handling and logging
- [ ] Graceful fallback when APIs unavailable

## Technical Specifications

### Weekly Schedule Logic
- **Date Range**: Wednesday to Sunday of current week
- **Data Source**: Hipsy API with `HIPSY_API_KEY` environment variable
- **Event Types**: ED, Cacao ED, Morning ED, Queerstatic
- **Special Logic**: First Sunday of month includes Queerstatic event

### Video Integration
- **Video ID**: `BAACAgQAAxkBAANIaIyYDXy2RFmnv6EZy2nsU2WqAsgAAmsYAAIvy2hQIXfzFx9DIcY2BA`
- **Position**: Top of message, auto-playing
- **Format**: Telegram video message with caption

### Facilitator Link Integration
- **Data Source**: Wix API (same as `/whosplaying`)
- **Link Type**: SoundCloud URLs
- **Format**: `<a href="soundcloud_url">Facilitator Name</a>`
- **Fallback**: Existing DJ data from `src/data/djs.json`

### Tickets Integration
- **URL**: `https://hipsy.nl/odessa-amsterdam-ecstatic-dance`
- **Format**: Inline keyboard button
- **Position**: Bottom of message

## Implementation Details

### Weekly Schedule Generator Pattern
```typescript
// Example weekly schedule generation pattern
class WeeklyScheduleGenerator {
  async generateWeeklySchedule(): Promise<WeeklySchedule> {
    // Get Wednesday to Sunday date range
    const weekRange = this.getWeekRange();
    
    // Fetch events from Hipsy API
    const events = await this.hipsyScraper.getEvents(weekRange);
    
    // Format weekly schedule
    const formattedSchedule = this.formatWeeklySchedule(events);
    
    // Add facilitator links
    const scheduleWithLinks = await this.addFacilitatorLinks(formattedSchedule);
    
    return {
      video: VIDEO_ID,
      text: scheduleWithLinks,
      keyboard: this.createTicketsKeyboard()
    };
  }
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
    
    // Send video with schedule
    await bot.sendVideo(msg.chat.id, weeklySchedule.video, {
      caption: weeklySchedule.text,
      parse_mode: 'HTML',
      reply_markup: weeklySchedule.keyboard
    });
  } catch (error) {
    await bot.sendMessage(msg.chat.id, 'Sorry, I could not fetch the weekly schedule.');
  }
});
```

## Risk Assessment

### High Risk
- **Hipsy API Reliability**: Weekly data fetching could fail
- **Video Integration**: Video sending could timeout or fail
- **Wix API Dependencies**: Facilitator data might be unavailable

### Medium Risk
- **Performance**: Weekly data processing could be slow
- **Date Logic**: Complex Wednesday-to-Sunday logic could have edge cases
- **Message Size**: Video + schedule could exceed Telegram limits

### Mitigation Strategies
- Implement comprehensive error handling and fallbacks
- Add caching for weekly schedule data
- Use typing indicators for long operations
- Monitor and alert on API failures

## Dependencies

### External Dependencies
- **Hipsy API**: `HIPSY_API_KEY` environment variable
- **Wix API**: Same DJ data system as `/whosplaying`
- **Telegram Bot API**: Video message support

### Internal Dependencies
- **Existing DJ Data**: `src/data/djs.json` for fallback
- **Wix DJ Loader**: `src/utils/wix-dj-loader.ts`
- **Hipsy Scraper**: `src/scrapers/hipsy-scraper.ts`

## Monitoring and Observability

### Key Metrics
- `/schedule` command usage frequency
- Weekly schedule generation success rate
- Video sending success rate
- Facilitator link resolution success rate
- API response times (Hipsy, Wix)

### Logging Requirements
- Weekly schedule generation logs
- Video integration logs
- Facilitator link resolution logs
- Error tracking for all components

## Security Considerations

### Data Protection
- Validate all API responses
- Rate limiting to prevent abuse
- Secure handling of facilitator data
- Proper error message sanitization

### Access Control
- Minimal required bot permissions
- Secure API key management
- Audit logging for command usage

## Future Enhancements

### Potential Improvements
- Schedule caching for faster responses
- Multiple week views (next week, previous week)
- Advanced filtering options
- Multi-language support
- Analytics dashboard for usage patterns

### Scalability Considerations
- Database optimization for schedule caching
- CDN integration for video assets
- Load balancing for high command volume
- Horizontal scaling for multiple bot instances 