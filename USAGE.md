# Odessa Telegram Bot - Usage Guide

This guide explains how to use the Odessa Telegram Bot with the new interactive command functionality.

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Test Bot Connection

```bash
# Test basic functionality
npm run cli test

# Test command handling
npm run test:commands
```

### 4. Start Interactive Bot

```bash
# Start the bot with command handling
npm run cli run
```

## 📱 Using the Bot

### Available Commands

#### `/schedule`
Get the current week's schedule with DJ information and ticket links.

**Usage:**
- Send `/schedule` in a group chat where the bot is added
- Send `/schedule` in a direct message to the bot

**Features:**
- Real-time schedule generation from Hipsy.no
- DJ information with social media links
- Direct ticket booking button
- Rate limited to once per 60 seconds per user

**Example Response:**
```
🪩 Schedule 🌴🎶  

Amsterdam's buzzing as the Summer Festival hits this weekend—last tickets available, so snag yours quick!  

🗓️ Wed: ED W/ Jethro
🗓️ Thu: ED W/ Samaya
🗓️ Fri: Cacao ED + Live Music W/ Inphiknight
🗓️ Sat: ED W/ Samaya
🗓️ Sun: Morning ED W/ Henners

[TICKETS BUTTON]
```

#### `/start`
Welcome message and bot introduction.

**Usage:**
- Send `/start` to get a welcome message
- Useful for new users or to see available commands

#### `/help`
Show help information and available commands.

**Usage:**
- Send `/help` to see detailed help information
- Lists all available commands and features

## 🔧 Development Commands

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
```

### Testing Commands

```bash
# Test command functionality
npm run test:commands

# Test Telegram integration
npm run test:telegram

# Run all tests
npm run test
```

## 🛠️ Troubleshooting

### Common Issues

#### Bot Not Responding to Commands

1. **Check if bot is running:**
   ```bash
   npm run cli run
   ```

2. **Verify bot token:**
   ```bash
   npm run cli test
   ```

3. **Check bot permissions in group:**
   - Ensure bot is added to the group
   - Check if bot has permission to send messages
   - Verify bot can read group messages

#### Rate Limiting

- Users can only request `/schedule` once every 60 seconds
- If rate limited, users will see: "Please wait a moment before requesting another schedule"
- This prevents spam and abuse

#### Schedule Generation Fails

1. **Check scraping functionality:**
   ```bash
   npm run cli generate
   ```

2. **Verify Hipsy.no is accessible:**
   - Check network connectivity
   - Verify Hipsy.no website is up

3. **Check logs for errors:**
   - Look for scraping errors in console output
   - Verify environment variables are set correctly

### Error Messages

| Error | Solution |
|-------|----------|
| "Bot connection failed" | Check `TELEGRAM_BOT_TOKEN` in `.env` |
| "Missing environment variables" | Set required variables in `.env` |
| "Could not generate schedule" | Check scraping functionality and network |
| "Please wait a moment" | Rate limiting - wait 60 seconds |

## 📊 Monitoring

### Logs

The bot provides detailed logging:

```
🤖 Starting Odessa Schedule Bot...
✅ Bot connected: @your_bot_username (ID: 123456789)
✅ Bot is now running and listening for commands!
🤖 Generating schedule for user 123456 in chat -987654321
✅ Schedule sent successfully to user 123456
```

### Key Metrics to Monitor

- Command usage frequency
- Schedule generation success rate
- Response times
- Error rates
- Rate limiting violations

## 🔒 Security

### Rate Limiting

- 60-second rate limit per user for `/schedule` command
- Prevents spam and abuse
- User-friendly error messages

### Permissions

- Bot only needs basic permissions in groups
- Can read messages and send messages
- No admin privileges required

### Data Protection

- No sensitive data logged
- User IDs are anonymized in logs
- Environment variables for all secrets

## 🚀 Deployment

### Production Setup

1. **Set environment variables:**
   ```env
   NODE_ENV=production
   TELEGRAM_BOT_TOKEN=your_production_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Start the bot:**
   ```bash
   npm run cli run
   ```

### Process Management

For production, consider using a process manager:

```bash
# Using PM2
npm install -g pm2
pm2 start "npm run cli run" --name "odessa-bot"

# Using systemd
# Create a systemd service file for automatic startup
```

## 📞 Support

### Getting Help

1. **Check the logs:**
   ```bash
   npm run cli run
   ```

2. **Test functionality:**
   ```bash
   npm run test:commands
   ```

3. **Review documentation:**
   - README.md for project overview
   - CLAUDE.md for development guidelines
   - PRPs/ for feature requirements

### Common Questions

**Q: Why isn't the bot responding to commands?**
A: Make sure the bot is running with `npm run cli run` and has proper permissions in the group.

**Q: How do I add the bot to a group?**
A: Add the bot as a member to the group, then send `/start` to see if it responds.

**Q: Can I customize the schedule format?**
A: Yes, modify the `ScheduleFormatter` class in `src/formatters/schedule-formatter.ts`.

**Q: How do I change the rate limiting?**
A: Modify the `RATE_LIMIT_MS` constant in `src/telegram/bot.ts`.

---

**Happy scheduling! 🌴🎶** 