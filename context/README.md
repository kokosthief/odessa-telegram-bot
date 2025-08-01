# Odessa Telegram Bot - Automated Schedule Generator

An automated schedule generation tool for Odessa boat events in Amsterdam. This system scrapes event data from Hipsy.no, formats it into custom schedules with DJ information, and posts to Telegram groups with interactive command support.

## 🚀 Current Status

### ✅ **Production Ready & Deployed**
- **Live on Vercel**: https://odessa-telegram-bot.vercel.app
- **Webhook Active**: Receiving Telegram messages
- **Environment Configured**: All production variables set
- **Auto-deployments**: From GitHub main branch

### ✅ **Core Features Implemented**
- **Web Scraping**: Hipsy.no event data extraction with robust error handling
- **Schedule Generation**: Real-time schedule creation with DJ information
- **Telegram Integration**: Bot API with interactive command handling
- **Interactive Commands**: `/schedule`, `/whosplaying`, `/start`, `/help`
- **Rate Limiting**: 60-second rate limit per user to prevent spam
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Video Integration**: Optimized video uploads with cached file_id
- **DJ Database**: 20+ DJs with social media links in `src/data/djs.json`

### ✅ **User Experience Features**
- **Typing Indicators**: Shows typing status during schedule generation
- **Inline Keyboards**: Ticket booking buttons in schedule messages
- **Multi-platform Support**: Works in group chats and direct messages
- **Rich Formatting**: HTML formatting with bold text and emojis
- **Today's Schedule**: `/whosplaying` command for current day events

## 📋 Project Structure

```
Team-Odessa-Telegram-Bot/
├── context/                     # Context engineering documentation
│   ├── CLAUDE.md               # Project-specific rules and conventions
│   ├── README.md               # This file - project documentation
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
├── PRPs/                       # Product Requirements Prompts
├── examples/                   # Code examples and patterns
├── CLAUDE.md                   # Project-specific rules and conventions
├── USAGE.md                    # Comprehensive usage guide
├── DEPLOYMENT.md               # GitHub + Vercel deployment guide
├── PRODUCTION_LAUNCH.md        # Production setup guide
├── FEATURES.md                 # Complete feature summary
├── vercel.json                 # Vercel configuration
├── env.example                 # Environment variables template
└── README.md                   # This file
```

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Database**: JSON-based DJ data (`src/data/djs.json`)
- **Web Scraping**: Puppeteer/Cheerio for HTML parsing
- **Telegram**: node-telegram-bot-api for Bot API integration
- **Testing**: Jest for unit and integration tests
- **Logging**: Winston for structured logging
- **Deployment**: Vercel for serverless deployment
- **CI/CD**: GitHub Actions for automatic deployments

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- Telegram Bot Token
- Hipsy.no API access

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/kokosthief/odessa-telegram-bot.git
   cd odessa-telegram-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

4. **Set up Telegram Bot**
   - Create a bot via @BotFather on Telegram
   - Get your bot token and chat ID
   - Add them to your .env file

5. **Get Hipsy API Key**
   - Contact Hipsy.nl for API access
   - Add the API key to your .env file

## ⚙️ Configuration

### Environment Variables

The application uses environment variables for all sensitive configuration. Copy `env.example` to `.env` and fill in your values:

**Required Variables:**
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from @BotFather
- `TELEGRAM_CHAT_ID` - The chat ID where the bot should post
- `HIPSY_API_KEY` - Your Hipsy.nl API key

**Optional Variables:**
- `NODE_ENV` - Set to 'production' for production deployment
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `TIMEZONE` - Timezone for date handling (default: Europe/Amsterdam)

See `env.example` for the complete list of available variables.

## 🚀 Usage

### Interactive Bot Commands

The bot supports interactive commands in Telegram:

**Available Commands:**
- `/schedule` - Get the current week's schedule with DJ information and ticket links
- `/whosplaying` - Check who is playing today
- `/start` - Welcome message and bot introduction
- `/help` - Show help information and available commands
- `/getfileid` - (Admin) Store video file_id for faster uploads
- `/setfileid <id>` - (Admin) Manually set video file_id

**Features:**
- Works in both group chats and direct messages
- Rate limiting (60 seconds between requests per user)
- Real-time schedule generation from Hipsy.no
- Error handling with user-friendly messages
- Typing indicators during generation
- Rich HTML formatting with bold text
- Interactive inline keyboards with ticket buttons
- Optimized video uploads using cached file_id

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

# Quick setup
npm run quick-start

# Deploy to production
npm run deploy
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

// Generate today's schedule
const todaySchedule = await generator.generateTodaySchedule();
```

## 🌐 Production Deployment

### Current Deployment Status

✅ **Live on Vercel**: https://odessa-telegram-bot.vercel.app  
✅ **Webhook Configured**: Receiving Telegram messages  
✅ **Environment Variables**: Set and working  
✅ **Automatic Deployments**: From GitHub main branch  
✅ **Video Integration**: Optimized video uploads with cached file_id  

### Deployment Features

- **Serverless**: Runs on Vercel's global network
- **Auto-scaling**: Handles traffic automatically
- **HTTPS**: Secure connections by default
- **Monitoring**: Built-in logging and analytics
- **CI/CD**: Automatic deployments from GitHub

```

## 🔧 Development

### Project Structure

- **`src/scrapers/`**: Web scraping components for Hipsy.no
- **`src/formatters/`**: Schedule formatting and template generation
- **`src/telegram/`**: Telegram Bot API integration with command handling
- **`src/types/`**: TypeScript type definitions
- **`src/utils/`**: Utility functions for date handling, validation, etc.
- **`src/data/`**: Static data files including DJ database
- **`api/`**: Vercel serverless functions for webhook handling

### Adding New Features

1. **Create a feature request** in `context/PRPs/`
2. **Generate a PRP** using the Context Engineering workflow
3. **Implement the feature** following the established patterns in `context/CLAUDE.md`
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
- DJ lookup performance
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

2. **Telegram Posting Failures**
   - Verify bot token is correct
   - Check chat ID is valid
   - Ensure bot has posting permissions

3. **Command Not Working**
   - Ensure bot is running with `npm run cli run`
   - Check bot permissions in group chats
   - Verify bot token is correct

4. **Vercel Deployment Issues**
   - Check environment variables in Vercel dashboard
   - Verify webhook URL is correct
   - Check function logs in Vercel dashboard

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file.

---

**Built with ❤️ for the Odessa community** 