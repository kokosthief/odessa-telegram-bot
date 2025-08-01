# Odessa Telegram Bot - Implementation Guide

This guide provides implementation patterns and standards for building an automated schedule generation tool for Odessa boat events in Amsterdam. The system scrapes event data from Hipsy.no, formats it into custom schedules, and posts to Telegram groups with interactive command support.

## Core Principles

**IMPORTANT: You MUST follow these principles in all code changes and PRP generations:**

### KISS (Keep It Simple, Stupid)
- Simplicity should be a key goal in design
- Choose straightforward solutions over complex ones whenever possible
- Simple solutions are easier to understand, maintain, and debug

### YAGNI (You Aren't Gonna Need It)
- Avoid building functionality on speculation
- Implement features only when they are needed, not when you anticipate they might be useful in the future

### Reliability First
- Web scraping can be fragile - always implement robust error handling
- Telegram posting should be idempotent and safe to retry
- Data validation is critical before posting to Telegram

## Project Architecture

**IMPORTANT: This is a Node.js/TypeScript application for automated schedule generation with web scraping, Telegram integration, and interactive command handling.**

### Current Project Structure

```
/
├── context/                     # Context engineering documentation
│   ├── CLAUDE.md               # This file - project-specific rules
│   ├── README.md               # Project documentation
│   ├── PRPs/                   # Product Requirements Prompts
│   │   ├── templates/          # PRP templates
│   │   └── schedule-command-prp.md # Command feature PRP
│   └── examples/               # Code examples and patterns
│       └── README.md
├── src/                        # TypeScript source code
│   ├── index.ts                # Main application entry point
│   ├── scrapers/               # Web scraping components
│   │   └── hipsy-scraper.ts   # Hipsy.no event scraping
│   ├── formatters/             # Schedule formatting
│   │   └── schedule-formatter.ts # Schedule template generation
│   ├── telegram/               # Telegram integration
│   │   └── bot.ts             # Bot with command handling
│   ├── types/                  # TypeScript type definitions
│   │   ├── event.ts           # Event data types
│   │   └── dj.ts             # DJ data types
│   ├── utils/                  # Utility functions
│   │   └── dj-loader.ts      # DJ data management
│   ├── data/                  # Static data files
│   │   └── djs.json          # DJ database with social links
│   ├── cli.ts                 # Command-line interface
│   └── test-*.ts              # Test files
├── api/                        # Vercel API routes
│   ├── bot.ts                 # Telegram webhook handler
│   └── test.ts                # Test endpoint
├── scripts/                    # Deployment scripts
│   ├── quick-start.sh         # Quick setup script
│   └── deploy.sh              # Production deployment script
├── vercel.json                 # Vercel configuration
├── env.example                 # Environment variables template
└── README.md                   # Project documentation
```

## Implemented Features

### ✅ Core Functionality
- **Web Scraping**: Hipsy.no event data extraction with error handling
- **Schedule Generation**: Real-time schedule creation with DJ information
- **Telegram Integration**: Bot API integration with message posting
- **Interactive Commands**: `/schedule`, `/whosplaying`, `/start`, `/help` command handling
- **Rate Limiting**: 60-second rate limit per user to prevent spam
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Video Integration**: Optimized video uploads with cached file_id
- **DJ Database**: 20+ DJs with social media links in `src/data/djs.json`

### ✅ User Experience Features
- **Typing Indicators**: Shows typing status during schedule generation
- **Inline Keyboards**: Ticket booking buttons in schedule messages
- **Multi-platform Support**: Works in group chats and direct messages
- **User-friendly Messages**: Clear error messages and help information
- **Today's Schedule**: `/whosplaying` command for current day events
- **Admin Commands**: `/getfileid` and `/setfileid` for video optimization

### ✅ Development Features
- **CLI Interface**: Command-line tools for testing and management
- **Testing Suite**: Comprehensive test coverage for all components
- **Type Safety**: Full TypeScript implementation with strict typing
- **Documentation**: Complete documentation and usage guides
- **Context Engineering**: Organized documentation in `context/` directory

## Development Commands

### Core Workflow Commands

```bash
# Setup & Dependencies
npm install                    # Install all dependencies
npm install --save-dev @types/package  # Add dev dependency with types

# Development
npm run dev                   # Start development server
npm run build                 # Build TypeScript to JavaScript

# Type Checking & Validation
npm run type-check            # Run TypeScript compiler check
npm run lint                  # Lint TypeScript code
npm run format                # Format code with Prettier

# Testing
npm run test                  # Run unit tests
npm run test:integration      # Run integration tests
npm run test:watch            # Run tests in watch mode
npm run test:commands         # Test command functionality
npm run test:telegram         # Test Telegram integration

# Database (JSON-based)
npm run db:seed              # Seed database with DJ data
```

### Bot Management Commands

```bash
# Interactive Bot
npm run cli run              # Start interactive bot with command handling

# Testing & Validation
npm run cli test             # Test bot connection
npm run cli generate         # Generate schedule (without posting)
npm run cli post             # Generate and post to Telegram
```

### Environment Configuration

**Environment Variables Setup:**

```bash
# Create .env file for local development based on env.example
cp env.example .env

# Required environment variables:
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
HIPSY_BASE_URL=https://hipsy.nl
TIMEZONE=Europe/Amsterdam
```

## Data Models

### Event Data Structure

```typescript
interface Event {
  id: string;
  title: string;
  date: string; // ISO date string
  picture?: string;
  ticketUrl: string;
  djName?: string;
  eventType?: 'ED' | 'Cacao ED' | 'Live Music';
  description?: string;
}
```

### DJ Data Structure

```typescript
interface DJ {
  id: string;
  name: string;
  soundcloudUrl?: string;
  mixcloudUrl?: string;
  instagramUrl?: string;
  bio?: string;
}
```

### Schedule Format

```typescript
interface Schedule {
  weekStart: Date;
  weekEnd: Date;
  events: Event[];
  introText: string;
  formattedSchedule: string;
}
```

## Web Scraping Guidelines

### Hipsy.no Scraping Pattern

**CRITICAL: Follow these patterns for reliable scraping:**

1. **Rate Limiting**: Always implement delays between requests (2-3 seconds minimum)
2. **Error Handling**: Handle network timeouts, 404s, and malformed HTML
3. **Data Validation**: Validate all scraped data before processing
4. **Retry Logic**: Implement exponential backoff for failed requests
5. **User Agent**: Use realistic user agents to avoid blocking

### Scraping Implementation

```typescript
// Example scraping pattern to follow
async function scrapeHipsyEvents(dateRange: DateRange): Promise<Event[]> {
  const events: Event[] = [];
  
  try {
    // Implement pagination handling
    // Validate each event before adding to array
    // Handle different event types (ED, Cacao ED, Live Music)
    // Extract DJ names from event titles/descriptions
    
    return events;
  } catch (error) {
    logger.error('Failed to scrape Hipsy events:', error);
    throw new Error('Scraping failed');
  }
}
```

## Schedule Formatting Guidelines

### Template Structure

**Follow this exact format for schedule posts:**

```
🪩 Schedule 🌴🎶  

[Intro text variation]

🗓️ Wed: [Event Type] W/ [DJ Name]
🗓️ Thu: [Event Type] W/ [DJ Name]
🗓️ Fri: [Event Type] W/ [DJ Name]
🗓️ Sat: [Event Type] W/ [DJ Name]
🗓️ Sun: [Event Type] W/ [DJ Name]

[TICKETS BUTTON]
```

### Intro Text Variations

**Implement multiple intro text variations to avoid repetition:**

- Summer festival themes
- Weather-based themes
- Special event announcements
- General vibe descriptions

### Event Type Mapping

**Map scraped event data to display format:**

- "Ecstatic Dance" → "ED"
- "Cacao Ecstatic Dance" → "Cacao ED"
- "Live Music" → "Live Music"

## Telegram Integration Guidelines

### Bot Setup Requirements

1. **Bot Token**: Secure storage of Telegram Bot API token
2. **Chat ID**: Target chat/group ID for posting
3. **Message Formatting**: Support for Markdown/HTML formatting
4. **Error Handling**: Graceful handling of posting failures
5. **Rate Limiting**: Respect Telegram API rate limits

### Interactive Command Handling

**CRITICAL: Follow these patterns for command handling:**

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
    
    // Generate schedule
    const schedule = await generator.generateSchedule();
    
    // Send response with inline keyboard
    await bot.sendMessage(msg.chat.id, schedule, {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  } catch (error) {
    // Handle errors gracefully
    await bot.sendMessage(msg.chat.id, 'Sorry, I could not generate the schedule right now.');
  }
});
```

### Posting Implementation

```typescript
// Example posting pattern
async function postScheduleToTelegram(schedule: Schedule): Promise<void> {
  try {
    const message = formatScheduleForTelegram(schedule);
    await telegramBot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    logger.info('Schedule posted successfully');
  } catch (error) {
    logger.error('Failed to post schedule:', error);
    throw new Error('Telegram posting failed');
  }
}
```

## Database Guidelines

### DJ Data Management

**CRITICAL: Implement proper DJ data handling:**

1. **Lookup System**: Efficient DJ name to social media links mapping
2. **Fallback Handling**: Graceful handling of missing DJ data
3. **Data Validation**: Ensure all URLs are valid before posting
4. **Caching**: Cache DJ lookups to avoid repeated database queries

### DJ Data Structure

```json
{
  "DJ Name": {
    "link": "https://soundcloud.com/dj_name"
  }
}
```

### DJ Data Implementation

```typescript
// Example DJ lookup pattern
async function getDJInfo(djName: string): Promise<DJ | null> {
  try {
    const djData = await loadDJData();
    const normalizedName = normalizeDJName(djName);
    return djData[normalizedName] || null;
  } catch (error) {
    logger.error('Failed to get DJ info:', error);
    return null;
  }
}
```

## Error Handling Standards

### Critical Error Scenarios

1. **Scraping Failures**: Network timeouts, blocked requests, malformed data
2. **DJ Data Errors**: Missing DJ data, invalid URLs
3. **Telegram Errors**: Invalid bot token, chat not found, rate limiting
4. **Data Validation**: Invalid dates, missing required fields
5. **Command Errors**: Rate limiting, user permission issues

### Error Handling Pattern

```typescript
// Example error handling pattern
async function generateSchedule(): Promise<Schedule> {
  try {
    const events = await scrapeEvents();
    const validatedEvents = validateEvents(events);
    const schedule = await formatSchedule(validatedEvents);
    return schedule;
  } catch (error) {
    logger.error('Schedule generation failed:', error);
    // Implement fallback or retry logic
    throw new Error('Schedule generation failed');
  }
}
```

## Testing Requirements

### Unit Tests

**Required test coverage:**

1. **Scraping Tests**: Mock Hipsy responses, test data parsing
2. **Formatting Tests**: Test schedule template generation
3. **DJ Data Tests**: Test DJ lookup and data validation
4. **Telegram Tests**: Mock Telegram API, test message formatting
5. **Command Tests**: Test command handling and rate limiting

### Integration Tests

**Test complete workflows:**

1. **End-to-End**: Full schedule generation and posting
2. **Error Scenarios**: Test failure handling and recovery
3. **Data Validation**: Test with various data quality scenarios
4. **Command Workflows**: Test complete command handling

## Performance Considerations

### Optimization Guidelines

1. **Caching**: Cache DJ data and recent schedules
2. **Batch Processing**: Process events in batches for large datasets
3. **Request Throttling**: Implement proper delays for web scraping
4. **Memory Management**: Clean up large datasets after processing
5. **Rate Limiting**: Implement user-based rate limiting

### Monitoring

**Implement logging for:**

1. **Scraping Performance**: Response times, success rates
2. **DJ Data Performance**: Lookup times, cache hit rates
3. **Telegram Performance**: Posting success rates, response times
4. **Error Rates**: Track and alert on high error rates
5. **Command Usage**: Track command frequency and patterns

## Security Guidelines

### Data Protection

1. **Environment Variables**: Never hardcode sensitive data
2. **URL Validation**: Validate all URLs before posting
3. **Input Sanitization**: Sanitize all user-generated content
4. **Rate Limiting**: Implement proper rate limiting for all APIs

### Access Control

1. **Bot Permissions**: Minimal required permissions for Telegram bot
2. **Environment-based Configuration**: Secure environment variables
3. **API Keys**: Secure storage and rotation of API keys
4. **User Rate Limiting**: Prevent abuse through rate limiting

## Deployment Guidelines

### Environment Setup

1. **Production Environment**: Separate config for production
2. **Environment Variables**: Secure management of secrets
3. **Monitoring**: Logging and error tracking setup

### Deployment Commands

```bash
# Production deployment
npm run build
npm run deploy

# Bot deployment
npm run cli run
```

## Code Quality Standards

### TypeScript Guidelines

1. **Strict Mode**: Enable strict TypeScript configuration
2. **Type Safety**: Define interfaces for all data structures
3. **Error Types**: Use custom error types for different scenarios
4. **Async/Await**: Use async/await consistently, avoid callbacks

### Code Organization

1. **Separation of Concerns**: Separate scraping, formatting, and posting logic
2. **Dependency Injection**: Use dependency injection for testability
3. **Configuration**: Externalize all configuration values
4. **Logging**: Implement comprehensive logging throughout

### Documentation

1. **JSDoc Comments**: Document all public functions and interfaces
2. **README**: Comprehensive setup and usage instructions
3. **API Documentation**: Document all external API integrations
4. **Error Codes**: Document all error scenarios and recovery steps

## Current Implementation Status

### ✅ Completed Features

1. **Web Scraping**: Hipsy.no scraper with error handling
2. **Schedule Generation**: Real-time schedule creation
3. **Telegram Integration**: Bot with command handling
4. **Interactive Commands**: `/schedule`, `/whosplaying`, `/start`, `/help`
5. **Rate Limiting**: 60-second rate limit per user
6. **Error Handling**: Comprehensive error handling
7. **CLI Interface**: Command-line tools for management
8. **Testing Suite**: Test coverage for all components
9. **Documentation**: Complete documentation and guides
10. **Video Integration**: Optimized video uploads with cached file_id
11. **DJ Database**: 20+ DJs with social media links
12. **Context Engineering**: Organized documentation in `context/`

### 🔄 Future Enhancements

1. **Schedule Caching**: Cache generated schedules for performance
2. **Advanced DJ Integration**: More comprehensive DJ information
3. **Analytics Dashboard**: Usage statistics and monitoring
4. **Multi-language Support**: Internationalization
5. **Advanced Templates**: Multiple schedule format options
6. **Database Migration**: Move from JSON to PostgreSQL for scalability 