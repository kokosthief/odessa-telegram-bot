# Odessa Telegram Bot - Implementation Guide

This guide provides implementation patterns and standards for building an automated today's schedule checking tool for Odessa boat events in Amsterdam. The system scrapes event data from Hipsy.no, formats it into enhanced today's schedules with DJ information and photos, and responds to Telegram commands with interactive support.

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

**IMPORTANT: This is a Node.js/TypeScript application for automated today's schedule checking with web scraping, Telegram integration, and interactive command handling.**

### Current Project Structure

```
/
├── context/                     # Context engineering documentation
│   ├── CLAUDE.md               # This file - project-specific rules
│   ├── README.md               # Project documentation
│   ├── PRPs/                   # Product Requirements Prompts
│   │   ├── templates/          # PRP templates
│   │   └── enhanced-whosplaying-prp.md # Enhanced command PRP
│   └── examples/               # Code examples and patterns
│       └── README.md
├── src/                        # TypeScript source code
│   ├── index.ts                # Main application entry point
│   ├── scrapers/               # Web scraping components
│   │   └── hipsy-scraper.ts   # Hipsy.no event scraping
│   ├── formatters/             # Today's schedule formatting
│   │   └── whosplaying-formatter.ts # Today's schedule formatting
│   ├── telegram/               # Telegram integration
│   │   └── bot.ts             # Bot with command handling
│   ├── types/                  # TypeScript type definitions
│   │   ├── event.ts           # Event data types
│   │   └── dj.ts             # DJ data types
│   ├── utils/                  # Utility functions
│   │   ├── dj-loader.ts      # Legacy DJ data management
│   │   └── wix-dj-loader.ts  # Enhanced Wix DJ data management
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
- **Today's Schedule Generation**: Real-time today's schedule creation with DJ information
- **Telegram Integration**: Bot API integration with message posting
- **Interactive Commands**: `/whosplaying`, `/start`, `/help` command handling
- **Rate Limiting**: 60-second rate limit per user to prevent spam
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Enhanced DJ Integration**: Photos and descriptions from Wix CMS
- **DJ Database**: 20+ DJs with social media links in `src/data/djs.json`

### ✅ User Experience Features
- **Typing Indicators**: Shows typing status during schedule generation
- **Inline Keyboards**: Ticket booking and SoundCloud buttons in messages
- **Multi-platform Support**: Works in group chats and direct messages
- **User-friendly Messages**: Clear error messages and help information
- **Today's Schedule**: `/whosplaying` command for current day events
- **Photo Uploads**: DJ photos from Wix CMS in enhanced messages

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
npm run test:enhanced-whosplaying # Test enhanced whosplaying
npm run test:wix-integration # Test Wix API integration
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
npm run cli whosplaying      # Generate today's schedule (without posting)
```

### Environment Configuration

**Environment Variables Setup:**

```bash
# Create .env file for local development based on env.example
cp env.example .env

# Required environment variables:
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
HIPSY_API_KEY=your_hipsy_api_key_here
HIPSY_ORGANISATION_SLUG=odessa-amsterdam-ecstatic-dance
TIMEZONE=Europe/Amsterdam

**IMPORTANT: Production Environment Variables**
- All environment variables are configured in Vercel dashboard for production
- `HIPSY_API_KEY` is set in Vercel environment variables
- Local development uses `.env` file, production uses Vercel environment variables
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
  photo?: string;
  shortDescription?: string;
}
```

### Today's Schedule Format

```typescript
interface TodaySchedule {
  text: string;
  photos?: string[];
  keyboard?: any;
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

## Today's Schedule Formatting Guidelines

### Template Structure

**Follow this exact format for today's schedule posts:**

```
🌟 <b>today</b> with <b>DJ Name</b> ✨

🎶 <b>Ecstatic Dance</b> with <b>DJ Name</b> 🎶

[DJ Description if available]

[TICKETS BUTTON] [SOUNDCLOUD BUTTON]
```

**For multiple events with different DJs:**
```
🌟 <b>today</b> with <b>DJ1 & DJ2</b> ✨

A day filled with amazing music!

🎶 <b>Ecstatic Dance</b> with <b>DJ1</b> 🎶

🎶 <b>Queerstatic</b> with <b>DJ2</b> 🎶
```

**For multiple events with same DJ:**
```
🌟 <b>today</b> with <b>DJ Name</b> ✨

Multiple events with the same DJ!

🎶 <b>Ecstatic Dance</b> with <b>DJ Name</b> 🎶

🎶 <b>Cacao Ecstatic Dance</b> with <b>DJ Name</b> 🎶
```

### Enhanced DJ Information

**Implement enhanced DJ data with photos and descriptions:**

- Photos from Wix CMS
- Short descriptions from Wix CMS
- Social media links (SoundCloud, etc.)
- Fallback to existing JSON data when Wix unavailable

### Event Type Mapping

**Map scraped event data to display format:**

- "Ecstatic Dance" → "Ecstatic Dance" (was "ED")
- "Cacao Ecstatic Dance" → "Cacao Ecstatic Dance" (was "Cacao ED")
- "Live Music" → "Live Music"
- "Queerstatic" → "Queerstatic"

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
bot.onText(/\/whosplaying/, async (msg) => {
  try {
    // Check rate limiting
    if (isRateLimited(msg.from.id)) {
      await bot.sendMessage(msg.chat.id, 'Please wait before requesting again.');
      return;
    }
    
    // Show typing indicator
    await bot.sendChatAction(msg.chat.id, 'typing');
    
    // Generate today's schedule
    const todaySchedule = await generator.generateEnhancedTodaySchedule();
    
    // Send response with photos and keyboard
    if (todaySchedule.photos && todaySchedule.photos.length > 0) {
      await bot.sendPhoto(msg.chat.id, todaySchedule.photos[0], {
        caption: todaySchedule.text,
        parse_mode: 'HTML',
        reply_markup: todaySchedule.keyboard
      });
    } else {
      await bot.sendMessage(msg.chat.id, todaySchedule.text, {
        parse_mode: 'HTML',
        reply_markup: todaySchedule.keyboard
      });
    }
  } catch (error) {
    // Handle errors gracefully
    await bot.sendMessage(msg.chat.id, 'Sorry, I could not fetch today\'s schedule right now.');
  }
});
```

### Posting Implementation

```typescript
// Example posting pattern
async function postTodayScheduleToTelegram(schedule: TodaySchedule): Promise<void> {
  try {
    if (schedule.photos && schedule.photos.length > 0) {
      await telegramBot.sendPhoto(chatId, schedule.photos[0], {
        caption: schedule.text,
        parse_mode: 'HTML',
        reply_markup: schedule.keyboard
      });
    } else {
      await telegramBot.sendMessage(chatId, schedule.text, {
        parse_mode: 'HTML',
        reply_markup: schedule.keyboard
      });
    }
    logger.info('Today\'s schedule posted successfully');
  } catch (error) {
    logger.error('Failed to post today\'s schedule:', error);
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
5. **Wix Integration**: Enhanced DJ data with photos and descriptions

### DJ Data Structure

```json
{
  "DJ Name": {
    "link": "https://soundcloud.com/dj_name",
    "photo": "https://wix-cms-photo-url",
    "shortDescription": "DJ description from Wix"
  }
}
```

### DJ Data Implementation

```typescript
// Example DJ lookup pattern
async function getDJInfo(djName: string): Promise<DJ | null> {
  try {
    // Try Wix CMS first
    const wixDJInfo = await wixDJLoader.getDJInfoWithFallback(djName);
    if (wixDJInfo) {
      return wixDJInfo;
    }
    
    // Fallback to JSON data
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
6. **Wix API Errors**: Connection failures, data availability issues

### Error Handling Pattern

```typescript
// Example error handling pattern
async function generateTodaySchedule(): Promise<TodaySchedule> {
  try {
    const events = await scrapeEvents();
    const validatedEvents = validateEvents(events);
    const schedule = await formatTodaySchedule(validatedEvents);
    return schedule;
  } catch (error) {
    logger.error('Today\'s schedule generation failed:', error);
    // Implement fallback or retry logic
    throw new Error('Today\'s schedule generation failed');
  }
}
```

## Testing Requirements

### Unit Tests

**Required test coverage:**

1. **Scraping Tests**: Mock Hipsy responses, test data parsing
2. **Formatting Tests**: Test today's schedule template generation
3. **DJ Data Tests**: Test DJ lookup and data validation
4. **Telegram Tests**: Mock Telegram API, test message formatting
5. **Command Tests**: Test command handling and rate limiting
6. **Wix Integration Tests**: Test Wix API integration and fallback

### Integration Tests

**Test complete workflows:**

1. **End-to-End**: Full today's schedule generation and posting
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
6. **Wix API Performance**: Connection status, cache performance

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
2. **Today's Schedule Generation**: Real-time today's schedule creation
3. **Telegram Integration**: Bot with command handling
4. **Interactive Commands**: `/whosplaying`, `/start`, `/help`
5. **Rate Limiting**: 60-second rate limit per user
6. **Error Handling**: Comprehensive error handling
7. **CLI Interface**: Command-line tools for management
8. **Testing Suite**: Test coverage for all components
9. **Documentation**: Complete documentation and guides
10. **Enhanced DJ Integration**: Photos and descriptions from Wix CMS
11. **DJ Database**: 20+ DJs with social media links
12. **Context Engineering**: Organized documentation in `context/`

### 🔄 Future Enhancements

1. **Schedule Caching**: Cache generated schedules for performance
2. **Advanced DJ Integration**: More comprehensive DJ information
3. **Analytics Dashboard**: Usage statistics and monitoring
4. **Multi-language Support**: Internationalization
5. **Advanced Templates**: Multiple today's schedule format options
6. **Database Migration**: Move from JSON to PostgreSQL for scalability 