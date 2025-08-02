# Odessa Telegram Bot - Who's Playing Today

An automated schedule checking tool for Odessa boat events in Amsterdam. This system scrapes event data from Hipsy.no, formats it into enhanced today's schedules with DJ information and photos, and responds to Telegram commands with interactive support.

## 🚀 Current Status

### ✅ **Production Ready & Deployed**
- **Live on Vercel**: https://odessa-telegram-bot.vercel.app
- **Webhook Active**: Receiving Telegram messages
- **Environment Configured**: All production variables set
- **Auto-deployments**: From GitHub main branch

### ✅ **Core Features Implemented**
- **Web Scraping**: Hipsy.no event data extraction with robust error handling
- **Today's Schedule**: Real-time today's schedule creation with DJ information
- **Telegram Integration**: Bot API with interactive command handling
- **Interactive Commands**: `/whosplaying`, `/start`, `/help`
- **Rate Limiting**: 60-second rate limit per user to prevent spam
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Enhanced DJ Integration**: Photos and descriptions from Wix CMS
- **DJ Database**: 20+ DJs with social media links in `src/data/djs.json`

### ✅ **User Experience Features**
- **Typing Indicators**: Shows typing status during schedule generation
- **Inline Keyboards**: Ticket booking and SoundCloud buttons in messages
- **Multi-platform Support**: Works in group chats and direct messages
- **Rich Formatting**: HTML formatting with bold text and emojis
- **Enhanced DJ Info**: Photos and descriptions from Wix CMS
- **Photo Uploads**: DJ photos in today's schedule messages

## 📋 Project Structure

```
Team-Odessa-Telegram-Bot/
├── context/                     # Context engineering documentation
│   ├── CLAUDE.md               # Project-specific rules and conventions
│   ├── README.md               # This file - project documentation
│   ├── PRPs/                   # Product Requirements Prompts
│   │   ├── templates/          # PRP templates
│   │   └── enhanced-whosplaying-prp.md # Enhanced command PRP
│   └── examples/               # Code examples and patterns
│       └── README.md
├── src/                        # TypeScript source code
│   ├── index.ts                # Main application entry point
│   ├── scrapers/               # Web scraping components
│   │   └── hipsy-scraper.ts   # Hipsy.no event scraping
│   ├── formatters/             # Schedule formatting
│   │   └── whosplaying-formatter.ts # Today's schedule formatting
│   ├── telegram/               # Telegram integration
│   │   └── bot.ts             # Bot with command handling
│   ├── types/                  # TypeScript type definitions
│   │   ├── event.ts           # Event data types
│   │   └── dj.ts             # DJ data types
│   ├── utils/                  # Utility functions
│   │   ├── dj-loader.ts      # DJ data management
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
└── README.md                   # This file
```

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Database**: JSON-based DJ data (`src/data/djs.json`) + Wix CMS
- **Web Scraping**: Puppeteer/Cheerio for HTML parsing
- **Telegram**: node-telegram-bot-api for Bot API integration
- **Wix Integration**: Wix Data API for enhanced DJ information
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
- `/whosplaying` - Check who is playing today with DJ photos and descriptions
- `/start` - Welcome message and bot introduction
- `/help` - Show help information and available commands

**Features:**
- Works in both group chats and direct messages
- Rate limiting (60 seconds between requests per user)
- Real-time today's schedule generation from Hipsy.no
- Error handling with user-friendly messages
- Typing indicators during generation
- Rich HTML formatting with bold text
- Interactive inline keyboards with ticket and SoundCloud buttons
- Enhanced DJ information with photos from Wix CMS

### CLI Commands

```bash
# Generate today's schedule (without posting)
npm run cli whosplaying

# Test bot connection
npm run cli test

# Start interactive bot with command handling
npm run cli run

# Test enhanced whosplaying functionality
npm run test:enhanced-whosplaying

# Test Wix integration
npm run test:wix-integration

# Quick setup
npm run quick-start

# Deploy to production
npm run deploy
```

### Today's Schedule Generation

The application provides a simple API for generating today's schedules:

```typescript
// Example usage
import { OdessaScheduleGenerator } from './src/index';

const generator = new OdessaScheduleGenerator();

// Generate enhanced today's schedule with photos
const todaySchedule = await generator.generateEnhancedTodaySchedule();

// Generate legacy today's schedule (fallback)
const legacySchedule = await generator.generateTodaySchedule();
```

## 🌐 Production Deployment

### Current Deployment Status

✅ **Live on Vercel**: https://odessa-telegram-bot.vercel.app  
✅ **Webhook Configured**: Receiving Telegram messages  
✅ **Environment Variables**: Set and working  
✅ **Automatic Deployments**: From GitHub main branch  
✅ **Enhanced DJ Info**: Photos and descriptions from Wix CMS  

### Deployment Features

- **Serverless**: Runs on Vercel's global network
- **Auto-scaling**: Handles traffic automatically
- **HTTPS**: Secure connections by default
- **Monitoring**: Built-in logging and analytics
- **CI/CD**: Automatic deployments from GitHub

## 🔧 Development

### Project Structure

- **`src/scrapers/`**: Web scraping components for Hipsy.no
- **`src/formatters/`**: Today's schedule formatting with enhanced DJ info
- **`src/telegram/`**: Telegram Bot API integration with command handling
- **`src/types/`**: TypeScript type definitions
- **`src/utils/`**: Utility functions for DJ data management
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

# Test enhanced whosplaying functionality
npm run test:enhanced-whosplaying

# Test Wix integration
npm run test:wix-integration
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
- Today's schedule generation time
- Rate limiting violations
- Wix API performance and cache hit rates

### Example Logs

```
🤖 Starting Odessa Schedule Bot...
✅ Bot connected: @your_bot_username (ID: 123456789)
✅ Bot is now running and listening for commands!
🎭 /whosplaying command received - generating enhanced schedule...
📊 Processing 2 events
✅ Enhanced schedule generated successfully
📸 Sending schedule with photos...
```

## 🔒 Security

### Rate Limiting

- 60-second rate limit per user for `/whosplaying` command
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

4. **Wix Integration Issues**
   - Check Wix API connectivity
   - Verify DJ data availability
   - Check cache configuration

5. **Vercel Deployment Issues**
   - Check environment variables in Vercel dashboard
   - Verify webhook URL is correct
   - Check function logs in Vercel dashboard

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file.

---

**Built with ❤️ for the Odessa community** 