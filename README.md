# Odessa Telegram Bot

An automated schedule generation tool for Odessa boat events in Amsterdam. This system scrapes event data from Hipsy.no, formats it into custom schedules with DJ information, and posts to Telegram groups with interactive command support.

## 🚀 **PRODUCTION STATUS: LIVE & DEPLOYED**

- **🌐 Live URL**: https://odessa-telegram-bot.vercel.app
- **🤖 Bot Active**: Receiving and responding to Telegram messages
- **📊 Webhook Status**: Active and processing commands
- **📱 Commands Working**: All interactive commands functional

## 📋 **QUICK START**

### Available Commands
- **`/schedule`** - Get current week's schedule with DJ info and ticket links
- **`/whosplaying`** - Check who is playing today
- **`/start`** - Welcome message and bot introduction
- **`/help`** - Show help information and available commands

### Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your actual values

# Start development
npm run dev

# Test commands
npm run test:commands

# Deploy to production
npm run deploy
```

## 📚 **DOCUMENTATION**

### Context Engineering Structure
All project documentation is organized in the `context/` directory:

- **`context/README.md`** - Complete project documentation and setup guide
- **`context/CLAUDE.md`** - Implementation guidelines and coding standards
- **`context/PROJECT_STATUS.md`** - Current status and feature overview
- **`context/PRPs/`** - Product Requirements Prompts for new features
- **`context/examples/`** - Code examples and patterns

### Key Documentation Files
- **`USAGE.md`** - Comprehensive usage guide
- **`DEPLOYMENT.md`** - GitHub + Vercel deployment guide
- **`PRODUCTION_LAUNCH.md`** - Production setup guide
- **`FEATURES.md`** - Complete feature summary

## 🛠️ **TECHNOLOGY STACK**

- **Runtime**: Node.js with TypeScript
- **Database**: JSON-based DJ data (`src/data/djs.json`)
- **Web Scraping**: Puppeteer/Cheerio for HTML parsing
- **Telegram**: node-telegram-bot-api for Bot API integration
- **Testing**: Jest for unit and integration tests
- **Deployment**: Vercel for serverless deployment
- **CI/CD**: GitHub Actions for automatic deployments

## 🚀 **CORE FEATURES**

### ✅ Implemented Features
- **Web Scraping**: Hipsy.no event data extraction with robust error handling
- **Schedule Generation**: Real-time schedule creation with DJ information
- **Telegram Integration**: Bot API with interactive command handling
- **Interactive Commands**: `/schedule`, `/whosplaying`, `/start`, `/help`
- **Rate Limiting**: 60-second rate limit per user to prevent spam
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Video Integration**: Optimized video uploads with cached file_id
- **DJ Database**: 20+ DJs with social media links

### 🎯 User Experience
- **Typing Indicators**: Shows typing status during schedule generation
- **Inline Keyboards**: Ticket booking buttons in schedule messages
- **Multi-platform Support**: Works in group chats and direct messages
- **Rich Formatting**: HTML formatting with bold text and emojis
- **Today's Schedule**: `/whosplaying` command for current day events

## 📁 **PROJECT STRUCTURE**

```
Team-Odessa-Telegram-Bot/
├── context/                     # Context engineering documentation
│   ├── CLAUDE.md               # Project-specific rules and conventions
│   ├── README.md               # Complete project documentation
│   ├── PROJECT_STATUS.md       # Current status and features
│   ├── PRPs/                   # Product Requirements Prompts
│   └── examples/               # Code examples and patterns
├── src/                        # TypeScript source code
│   ├── scrapers/               # Web scraping components
│   ├── formatters/             # Schedule formatting
│   ├── telegram/               # Telegram integration
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   ├── data/                   # Static data files
│   └── cli.ts                  # Command-line interface
├── api/                        # Vercel API routes
├── scripts/                    # Deployment scripts
└── [configuration files]
```

## 🔧 **DEVELOPMENT**

### Context Engineering Workflow
1. **Feature Requests**: Create PRPs in `context/PRPs/`
2. **Implementation**: Follow patterns in `context/CLAUDE.md`
3. **Testing**: Add tests for all new functionality
4. **Documentation**: Update relevant files in `context/`

### Development Commands
```bash
# Development
npm run dev                   # Start development server
npm run build                 # Build TypeScript to JavaScript
npm run type-check            # Run TypeScript compiler check

# Testing
npm run test                  # Run unit tests
npm run test:commands         # Test command functionality
npm run test:telegram         # Test Telegram integration

# Bot Management
npm run cli run              # Start interactive bot
npm run cli generate         # Generate schedule (without posting)
npm run cli post             # Generate and post to Telegram
```

## 🚨 **TROUBLESHOOTING**

### Common Issues
- **Bot not responding**: Check `TELEGRAM_BOT_TOKEN` in environment variables
- **Schedule generation fails**: Check network connectivity and Hipsy.no access
- **Rate limiting**: Wait 60 seconds between `/schedule` requests
- **Deployment issues**: Check Vercel environment variables and webhook URL

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file.

---

**Built with ❤️ for the Odessa community**

For detailed documentation, see `context/README.md` and `context/PROJECT_STATUS.md`. 