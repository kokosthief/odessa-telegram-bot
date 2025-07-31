# Odessa Telegram Bot - Automated Schedule Generator

An automated schedule generation tool for Odessa boat events in Amsterdam. This system provides a Telegram bot that responds to commands with formatted schedules and ticket links.

## 🚀 Features

- **Interactive Commands**: Responds to `/schedule`, `/start`, and `/help` commands
- **Rich Formatting**: HTML formatting with bold text and emojis
- **Inline Keyboards**: Clickable ticket booking buttons
- **Multi-platform Support**: Works in group chats and direct messages
- **Vercel Deployment**: Serverless deployment with automatic scaling
- **Error Handling**: Robust error handling and user feedback

## 📋 Project Structure

```
Team-Odessa-Telegram-Bot/
├── api/                          # Vercel API endpoints
│   └── bot.ts                   # Telegram webhook handler
├── scripts/                      # Deployment scripts
│   ├── quick-start.sh           # Quick setup script
│   └── deploy.sh                # Production deployment script
├── PRPs/                        # Product Requirements Prompts
│   ├── templates/               # PRP templates
│   └── schedule-command-prp.md  # Command feature PRP
├── examples/                    # Code examples and patterns
├── CLAUDE.md                   # Project-specific rules and conventions
├── DEPLOYMENT.md               # GitHub + Vercel deployment guide
├── vercel.json                 # Vercel configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Deployment**: Vercel serverless functions
- **Telegram**: Telegram Bot API for webhook handling
- **Testing**: Jest for unit and integration tests
- **Logging**: Console logging for debugging

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- Telegram Bot Token
- Vercel account (for deployment)

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
   # Edit .env with your configuration
   ```

4. **Deploy to Vercel**
   ```bash
   npm run deploy
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Application Configuration
NODE_ENV=production
TIMEZONE=Europe/Amsterdam
LOG_LEVEL=info
```

### Vercel Configuration

The project includes `vercel.json` for automatic deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/bot.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/bot",
      "dest": "/api/bot.ts"
    }
  ]
}
```

## 🚀 Usage

### Bot Commands

The bot responds to these commands in Telegram:

- **`/start`** - Welcome message and bot introduction
- **`/help`** - Detailed help information and available commands
- **`/schedule`** - Get the current week's schedule with ticket links

### Example Schedule Response

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

[TICKETS 🎟️] ← Clickable button!
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run build                 # Build TypeScript to JavaScript
npm run type-check            # Run TypeScript compiler check
npm run lint                  # Lint TypeScript code
npm run format                # Format code with Prettier

# Testing
npm run test                  # Run unit tests
npm run test:watch            # Run tests in watch mode

# Deployment
npm run deploy                # Deploy to production with PM2
npm run quick-start           # Quick setup and testing
```

### Project Structure

- **`api/bot.ts`**: Main Telegram webhook handler
- **`scripts/`**: Deployment and setup scripts
- **`PRPs/`**: Product Requirements Prompts
- **`examples/`**: Code examples and patterns

## 📈 Monitoring

### Vercel Dashboard

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Monitor:**
   - Function invocations
   - Response times
   - Error rates
   - Logs

### Telegram Bot Analytics

- Command usage frequency
- User engagement patterns
- Error tracking

## 🔒 Security

### Data Protection

- All sensitive data stored in environment variables
- URL validation before posting to Telegram
- Input sanitization for all user data
- Rate limiting to prevent abuse

### Access Control

- Minimal required permissions for Telegram bot
- Environment-based configuration
- Audit logging for sensitive operations

## 🚨 Troubleshooting

### Common Issues

1. **Bot Not Responding**
   - Check if webhook is set correctly
   - Verify environment variables in Vercel
   - Check Vercel function logs

2. **Webhook Errors**
   - Verify bot token is correct
   - Check Vercel deployment URL
   - Ensure environment variables are set

3. **Deployment Issues**
   - Check Vercel build logs
   - Verify TypeScript compilation
   - Check environment variable configuration

### Debug Commands

```bash
# Check webhook status
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Test webhook manually
curl -X POST "https://your-project.vercel.app/api/bot" \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"/start","chat":{"id":123},"from":{"id":456}}}'

# View Vercel logs
vercel logs
```

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
- Telegram Bot API for messaging integration
- Vercel for serverless deployment
- The Odessa community for inspiration and feedback

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the Context Engineering documentation
- Contact the development team

---

**Built with ❤️ for the Odessa community** 