# Telegram Bot Setup Guide

## 🚀 Quick Start

### 1. Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Send** `/newbot` to BotFather
3. **Choose a name** for your bot (e.g., "Odessa Schedule Bot")
4. **Choose a username** (e.g., "odessa_schedule_bot")
5. **Save the token** that BotFather gives you

### 2. Get Your Chat ID

#### Option A: Using @userinfobot
1. Search for `@userinfobot` in Telegram
2. Send `/start` to get your chat ID
3. Save the chat ID number

#### Option B: Using the Bot API
1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find your chat ID in the response

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Hipsy.nl API Configuration
HIPSY_API_KEY=your_hipsy_api_key_here
HIPSY_ORGANISATION_SLUG=odessa-amsterdam-ecstatic-dance

# Application Configuration
NODE_ENV=production
TIMEZONE=Europe/Amsterdam
LOG_LEVEL=info
```

### 4. Test the Bot

```bash
# Test bot connection
npm run cli test

# Generate a schedule (without posting)
npm run cli generate

# Generate and post to Telegram
npm run cli post
```

## 🤖 Bot Features

### Available Commands

- **`generate`** - Generate a schedule without posting
- **`post`** - Generate and post to Telegram
- **`test`** - Test bot connection

### API Endpoints

- **`GET /api/generate-schedule`** - Generate schedule
- **`GET /api/generate-schedule?action=post-to-telegram`** - Post to Telegram

## 📱 Message Format

The bot posts schedules in this format:

```
🪩 Schedule 🌴🎶

This week on the Odessa boat promises to be absolutely magical! 
We've curated the perfect lineup to keep your spirits high and your feet moving.

Join us for a week filled with rhythm, connection, and pure joy.

Let's make this week unforgettable together!

🗓️ Thu: ED W/ Divana
🗓️ Fri: Cacao ED W/ Leela
🗓️ Sat: ED W/ Inphiknight
🗓️ Sun: ED W/ Leela + Event W/ Inphiknight

{TICKETS BUTTON}

**🎵 DJ Links:**
**Divana**: 🌐 [Website](https://www.divanamusic.com/)
**Leela**: 🎵 [SoundCloud](https://soundcloud.com/djleela)
**Inphiknight**: 🎵 [SoundCloud](https://soundcloud.com/inphiknight)
```

## 🔧 Troubleshooting

### Common Issues

1. **"Bot connection failed"**
   - Check your bot token is correct
   - Ensure the bot is not blocked

2. **"Missing environment variables"**
   - Verify `.env` file exists
   - Check variable names are correct

3. **"Failed to post message"**
   - Ensure bot has permission to send messages
   - Check chat ID is correct
   - Verify bot is added to the group/channel

### Testing Steps

1. **Test bot connection:**
   ```bash
   npm run cli test
   ```

2. **Test schedule generation:**
   ```bash
   npm run cli generate
   ```

3. **Test posting to Telegram:**
   ```bash
   npm run cli post
   ```

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set environment variables** in Vercel dashboard
4. **Deploy**

### Environment Variables for Vercel

Set these in your Vercel project settings:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `HIPSY_API_KEY`
- `HIPSY_ORGANISATION_SLUG`

## 📊 Monitoring

### Logs to Watch

- ✅ **"Bot connection successful"** - Bot is working
- ✅ **"Schedule posted successfully"** - Message sent
- ❌ **"Bot connection failed"** - Check token
- ❌ **"Failed to post message"** - Check permissions

### Health Check

Visit your API endpoint to test:
```
https://your-app.vercel.app/api/generate-schedule
```

## 🔐 Security

### Best Practices

1. **Never commit** your bot token to Git
2. **Use environment variables** for all secrets
3. **Regularly rotate** your bot token
4. **Monitor** bot usage and logs

### Token Security

- Keep your bot token private
- Don't share it in public repositories
- Use different tokens for development/production

## 📞 Support

If you encounter issues:

1. **Check the logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test bot connection** with `npm run cli test`
4. **Check Telegram bot permissions**

## 🎯 Next Steps

Once the bot is working:

1. **Set up automated posting** (cron job, GitHub Actions)
2. **Add error monitoring** (Sentry, LogRocket)
3. **Create backup posting** methods
4. **Add user interaction** features 