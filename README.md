# Odessa Telegram Bot - Automated Schedule Generator

An automated schedule generation tool for Odessa boat events in Amsterdam. This system scrapes event data from Hipsy.no, formats it into custom schedules with DJ information, and posts to Telegram groups with interactive command support.

## 🚀 Features

- **Automated Web Scraping**: Pulls event data from Hipsy.no on-demand
- **Smart Schedule Formatting**: Generates custom formatted schedules for Wednesday-Sunday events
- **DJ Information Integration**: Automatically includes DJ SoundCloud/MixCloud links from database
- **Telegram Integration**: Creates shareable schedule posts for Telegram groups
- **Interactive Commands**: Responds to `/schedule`, `/start`, and `/help` commands
- **Real-time Generation**: On-demand schedule generation with live data
- **Rate Limiting**: Prevents spam with 60-second rate limiting per user
- **Error Handling**: Robust error handling and validation throughout
- **One-Click Operation**: Single button to generate and post the weekly schedule
- **Multi-platform Support**: Works in group chats and direct messages

## 📋 Project Structure

```
Team-Odessa-Telegram-Bot/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Main application entry point
│   ├── scrapers/                 # Web scraping components
│   │   └── hipsy-scraper.ts     # Hipsy.no event scraping
│   ├── formatters/               # Schedule formatting
│   │   └── schedule-formatter.ts # Schedule template generation
│   ├── telegram/                 # Telegram integration
│   │   └── bot.ts               # Bot with command handling
│   ├── types/                   # TypeScript type definitions
│   │   ├── event.ts            # Event data types
│   │   └── dj.ts              # DJ data types
│   ├── utils/                   # Utility functions
│   │   └── dj-loader.ts       # DJ data management
│   ├── cli.ts                  # Command-line interface
│   └── test-*.ts               # Test files
├── PRPs/                        # Product Requirements Prompts
│   ├── templates/              # PRP templates
│   └── schedule-command-prp.md # Command feature PRP
├── examples/                    # Code examples and patterns
├── CLAUDE.md                   # Project-specific rules and conventions
├── USAGE.md                    # Comprehensive usage guide
├── env.example                 # Environment variables template
└── README.md                   # This file
```

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL for DJ data storage
- **Web Scraping**: Puppeteer/Cheerio for HTML parsing
- **Telegram**: node-telegram-bot-api for Bot API integration
- **Testing**: Jest for unit and integration tests
- **Logging**: Winston for structured logging

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Telegram Bot Token
- Hipsy.no access

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Team-Odessa-Telegram-Bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Configure database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Set up Telegram Bot**
   - Create a bot via @BotFather on Telegram
   - Get your bot token and chat ID
   - Add them to your .env file

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/odessa_bot
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=odessa_bot
DATABASE_USER=username
DATABASE_PASSWORD=password

# Scraping Configuration
HIPSY_BASE_URL=https://hipsy.nl
SCRAPING_DELAY=2000
MAX_RETRIES=3
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36

# Application Configuration
NODE_ENV=development
TIMEZONE=Europe/Amsterdam
LOG_LEVEL=info
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10
```

### Database Schema

The application requires a PostgreSQL database with the following schema:

```sql
-- DJ table for storing DJ information
CREATE TABLE djs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  soundcloud_url VARCHAR(500),
  mixcloud_url VARCHAR(500),
  instagram_url VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events table for caching scraped events
CREATE TABLE events (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  date TIMESTAMP NOT NULL,
  event_type VARCHAR(100),
  dj_name VARCHAR(255),
  ticket_url VARCHAR(500),
  picture_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Usage

### Interactive Bot Commands

The bot now supports interactive commands in Telegram:

```bash
# Start the interactive bot
npm run cli run
```

**Available Commands:**
- `/schedule` - Get the current week's schedule with DJ information and ticket links
- `/start` - Welcome message and bot introduction
- `/help` - Show help information and available commands

**Features:**
- Works in both group chats and direct messages
- Rate limiting (60 seconds between requests per user)
- Real-time schedule generation
- Error handling with user-friendly messages
- Typing indicators during generation

### CLI Commands

```bash
# Generate schedule (without posting)
npm run cli generate

# Generate and post to Telegram
npm run cli post

# Test bot connection
npm run cli test

# Start interactive bot with command handling
npm run cli run

# Test command functionality
npm run test:commands
```

### Schedule Generation

The application provides a simple API for generating and posting schedules:

```typescript
// Example usage
import { OdessaScheduleGenerator } from './src/index';

const generator = new OdessaScheduleGenerator();

// Generate and post this week's schedule
const schedule = await generator.generateSchedule();

// Generate schedule for specific date range
const scheduleForWeek = await generator.generateScheduleForWeek(new Date('2024-01-01'));
```

## 📊 Schedule Format

The generated schedules follow this format:

```
🪩 Schedule 🌴🎶  

Amsterdam's buzzing as the Summer Festival hits this weekend—last tickets available, so snag yours quick!  

We're spinning vibrant melodies and free-spirited dance flows all week, with this Sunday morning session now a Sunday evening groove starting at 7pm!

Jump into the city's rhythm and make this week epic!

🗓️ Wed: ED W/ Jethro
🗓️ Thu: ED W/ Samaya
🗓️ Fri: Cacao ED + Live Music W/ Inphiknight
🗓️ Sat: ED W/ Samaya
🗓️ Sun: Morning ED W/ Henners

{TICKETS BUTTON}
```

## 🔧 Development

### Project Structure

- **`src/scrapers/`**: Web scraping components for Hipsy.no
- **`src/formatters/`**: Schedule formatting and template generation
- **`src/database/`**: Database operations and DJ data management
- **`src/telegram/`**: Telegram Bot API integration with command handling
- **`src/types/`**: TypeScript type definitions
- **`src/utils/`**: Utility functions for date handling, validation, etc.

### Adding New Features

1. **Create a feature request** in `INITIAL.md`
2. **Generate a PRP** using the Context Engineering workflow
3. **Implement the feature** following the established patterns
4. **Add tests** for all new functionality
5. **Update documentation** as needed

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Test command functionality
npm run test:commands

# Test Telegram integration
npm run test:telegram
```

## 📈 Monitoring

### Logging

The application uses structured logging with different levels:

- **DEBUG**: Detailed debugging information
- **INFO**: General application flow
- **WARN**: Warning conditions
- **ERROR**: Error conditions

### Key Metrics

- Scraping success rate and response times
- Database query performance
- Telegram posting success rate
- Command usage frequency
- Error rates and types
- Schedule generation time
- Rate limiting violations

### Example Logs

```
🤖 Starting Odessa Schedule Bot...
✅ Bot connected: @your_bot_username (ID: 123456789)
✅ Bot is now running and listening for commands!
🤖 Generating schedule for user 123456 in chat -987654321
✅ Schedule sent successfully to user 123456
```

## 🔒 Security

### Data Protection

- All sensitive data stored in environment variables
- URL validation before posting to Telegram
- Input sanitization for all user data
- Rate limiting to prevent abuse

### Access Control

- Minimal required permissions for Telegram bot
- Secure database credentials
- Environment-based configuration
- Audit logging for sensitive operations

### Rate Limiting

- 60-second rate limit per user for `/schedule` command
- Prevents spam and abuse
- User-friendly error messages

## 🚨 Troubleshooting

### Common Issues

1. **Scraping Failures**
   - Check network connectivity
   - Verify Hipsy.no is accessible
   - Check rate limiting settings

2. **Database Connection Issues**
   - Verify database credentials
   - Check database server status
   - Ensure migrations are up to date

3. **Telegram Posting Failures**
   - Verify bot token is correct
   - Check chat ID is valid
   - Ensure bot has posting permissions

4. **Command Not Working**
   - Ensure bot is running with `npm run cli run`
   - Check bot permissions in group chats
   - Verify bot token is correct

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file.

### Error Messages

| Error | Solution |
|-------|----------|
| "Bot connection failed" | Check `TELEGRAM_BOT_TOKEN` in `.env` |
| "Missing environment variables" | Set required variables in `.env` |
| "Could not generate schedule" | Check scraping functionality and network |
| "Please wait a moment" | Rate limiting - wait 60 seconds |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the established coding patterns
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Context Engineering principles for systematic AI development
- Hipsy.no for providing event data
- Telegram Bot API for messaging integration
- The Odessa community for inspiration and feedback

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the Context Engineering documentation
- Contact the development team

---

**Built with ❤️ for the Odessa community** 