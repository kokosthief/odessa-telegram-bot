## FEATURE:

Create an automated schedule generation tool for Odessa boat events in Amsterdam that:

1. **Web Scraping Component**: Pulls event data from Hipsy.no website on-demand
2. **Schedule Formatting**: Generates custom formatted schedules for Wednesday-Sunday events
3. **DJ Information Integration**: Automatically includes DJ SoundCloud/MixCloud links from database
4. **Telegram Integration**: Creates shareable schedule posts for Telegram groups
5. **One-Click Operation**: Single button to generate and post the weekly schedule

**Core Requirements:**
- Scrape event data from Hipsy.no (events, dates, DJs, ticket links)
- Format events into custom schedule template with intro text variations
- Include DJ social media links (SoundCloud/MixCloud) from database
- Generate Telegram-ready formatted posts
- Handle different event types (ED = Ecstatic Dance, Cacao ED, Live Music)
- Support weekly schedule generation with date filtering (Wed-Sun)

## EXAMPLES:

The project should follow these patterns from the existing codebase:

- **Web Scraping Pattern**: Use the existing `getEvents()` function pattern from the provided code
- **Data Processing**: Follow the event mapping and sorting logic shown in the example
- **Date Formatting**: Use the `Intl.DateTimeFormat` pattern for consistent date display
- **Error Handling**: Implement robust error handling for API failures and data validation
- **Batch Processing**: Consider pagination/batching for large event datasets

**Key Code Patterns to Follow:**
- Event data structure with `id`, `title`, `date`, `picture`, `ticketUrl`
- Date parsing and formatting for schedule display
- URL generation for ticket links
- Data validation and filtering

## DOCUMENTATION:

**Required APIs and Services:**
- Hipsy.no API/website scraping documentation
- Telegram Bot API documentation
- Database schema for DJ information (SoundCloud/MixCloud links)

**External Dependencies:**
- Web scraping library (Puppeteer/Cheerio for Node.js or similar)
- Telegram Bot API client
- Database connection (PostgreSQL/MySQL for DJ data)
- Date/time manipulation libraries

**Integration Points:**
- Hipsy.no event data extraction
- DJ database lookup system
- Telegram message formatting and posting
- Schedule template system with intro text variations

## OTHER CONSIDERATIONS:

**Critical Requirements:**
- Handle different event types (ED, Cacao ED, Live Music) with proper formatting
- Support weekly schedule generation with date range filtering (Wednesday to Sunday)
- Implement intro text variations for different weeks
- Ensure proper error handling for missing DJ data or failed API calls
- Handle timezone differences (Amsterdam timezone)
- Validate event data before posting to Telegram

**Common AI Assistant Pitfalls to Avoid:**
- Don't hardcode event types - make them dynamic from scraped data
- Don't assume all DJs have SoundCloud/MixCloud links - handle missing data gracefully
- Don't forget to handle API rate limits for web scraping
- Don't ignore timezone considerations for date parsing
- Don't create overly complex scheduling logic - keep it simple and reliable

**Performance Considerations:**
- Cache DJ database lookups to avoid repeated queries
- Implement request throttling for web scraping
- Consider storing recent schedules to avoid regenerating identical content
- Handle large event datasets efficiently

**Security & Reliability:**
- Validate all URLs before posting to Telegram
- Implement retry logic for failed API calls
- Sanitize user-generated content
- Handle network timeouts gracefully 