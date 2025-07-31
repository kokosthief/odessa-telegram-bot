# 🚀 Production Launch Guide - Odessa Telegram Bot

This guide will walk you through launching your Odessa Telegram Bot in production.

## 📋 **Pre-Launch Checklist**

### ✅ **Step 1: Environment Setup**

1. **Create your environment file:**
   ```bash
   cp env.example .env
   ```

2. **Set up your Telegram Bot:**
   - Go to [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot` to create a new bot
   - Choose a name (e.g., "Odessa Schedule Bot")
   - Choose a username (e.g., "odessa_schedule_bot")
   - Save the bot token you receive

3. **Get your Chat ID:**
   - Add your bot to a group or start a conversation
   - Send a message to the bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your chat ID in the response

4. **Edit your `.env` file:**
   ```env
   # Telegram Configuration
   TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   
   # Database Configuration (if using PostgreSQL)
   DATABASE_URL=postgresql://username:password@localhost:5432/odessa_bot
   
   # Application Configuration
   NODE_ENV=production
   TIMEZONE=Europe/Amsterdam
   LOG_LEVEL=info
   ```

### ✅ **Step 2: Install Dependencies**

```bash
# Install all dependencies
npm install

# Build the application
npm run build
```

### ✅ **Step 3: Test Your Setup**

```bash
# Test bot connection
npm run cli test

# Test command functionality
npm run test:commands

# Test schedule generation
npm run cli generate
```

### ✅ **Step 4: Launch the Bot**

```bash
# Start the interactive bot
npm run cli run
```

## 🎯 **Production Deployment Options**

### **Option A: Local Server (Recommended for Testing)**

1. **Start the bot locally:**
   ```bash
   npm run cli run
   ```

2. **Test in Telegram:**
   - Send `/start` to your bot
   - Send `/schedule` to get a schedule
   - Send `/help` for help information

### **Option B: Cloud Deployment (Recommended for Production)**

#### **Using Vercel (Free Tier)**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

#### **Using Railway (Recommended)**

1. **Connect your GitHub repo to Railway**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically**

#### **Using DigitalOcean/AWS/GCP**

1. **Set up a VPS or cloud instance**
2. **Install Node.js and dependencies**
3. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start "npm run cli run" --name "odessa-bot"
   pm2 startup
   pm2 save
   ```

## 🔧 **Production Configuration**

### **Environment Variables for Production**

```env
# Production Settings
NODE_ENV=production
LOG_LEVEL=info
TIMEZONE=Europe/Amsterdam

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_production_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Database (if using)
DATABASE_URL=your_production_database_url

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10

# Error Handling
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY=1000
```

### **Process Management**

#### **Using PM2 (Recommended)**

```bash
# Install PM2
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'odessa-bot',
    script: 'npm',
    args: 'run cli run',
    cwd: '/path/to/your/project',
    env: {
      NODE_ENV: 'production',
      TELEGRAM_BOT_TOKEN: 'your_token',
      TELEGRAM_CHAT_ID: 'your_chat_id'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log'
  }]
};
EOF

# Start the bot
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

#### **Using Docker**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "cli", "run"]
```

## 📱 **Testing Your Bot**

### **1. Basic Functionality Test**

```bash
# Test bot connection
npm run cli test

# Expected output:
# ✅ Bot connection successful
# 🤖 Bot username: @your_bot_username
# 🆔 Bot ID: 123456789
```

### **2. Command Testing in Telegram**

Send these commands to your bot:

- **`/start`** - Should show welcome message
- **`/help`** - Should show help information  
- **`/schedule`** - Should generate and send a schedule

### **3. Error Handling Test**

- Send `/schedule` twice within 60 seconds
- Should get rate limiting message
- Wait 60 seconds and try again

## 🔍 **Monitoring & Maintenance**

### **Logs to Monitor**

```bash
# View PM2 logs
pm2 logs odessa-bot

# View specific log files
tail -f logs/combined.log
tail -f logs/error.log
```

### **Health Checks**

```bash
# Check if bot is running
pm2 status

# Restart if needed
pm2 restart odessa-bot

# Check memory usage
pm2 monit
```

### **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| Bot not responding | Check if process is running: `pm2 status` |
| Rate limiting errors | Normal behavior, wait 60 seconds |
| Scraping failures | Check Hipsy.no accessibility |
| Memory issues | Restart: `pm2 restart odessa-bot` |

## 🚨 **Security Checklist**

- ✅ Bot token is secure and not logged
- ✅ Environment variables are set correctly
- ✅ Rate limiting is enabled
- ✅ Error messages don't expose sensitive data
- ✅ Logs don't contain sensitive information

## 📊 **Performance Monitoring**

### **Key Metrics to Track**

- **Uptime**: Should be > 99%
- **Response Time**: < 30 seconds for schedule generation
- **Error Rate**: < 5%
- **Memory Usage**: Monitor for leaks
- **Command Usage**: Track `/schedule` frequency

### **Alerting Setup**

```bash
# Set up basic monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🎉 **Launch Checklist**

### **Final Steps Before Going Live**

- [ ] Environment variables configured
- [ ] Bot token and chat ID set correctly
- [ ] Database configured (if using)
- [ ] Bot is responding to commands
- [ ] Schedule generation works
- [ ] Rate limiting is working
- [ ] Error handling is graceful
- [ ] Logs are being generated
- [ ] Process management is set up
- [ ] Monitoring is configured

### **Go Live Commands**

```bash
# Start the bot in production
pm2 start ecosystem.config.js

# Verify it's running
pm2 status

# Check logs
pm2 logs odessa-bot

# Test in Telegram
# Send /start to your bot
```

## 🆘 **Troubleshooting**

### **Bot Not Responding**

1. **Check if process is running:**
   ```bash
   pm2 status
   ```

2. **Check logs for errors:**
   ```bash
   pm2 logs odessa-bot
   ```

3. **Restart the bot:**
   ```bash
   pm2 restart odessa-bot
   ```

### **Environment Issues**

1. **Verify environment variables:**
   ```bash
   pm2 env odessa-bot
   ```

2. **Check bot token:**
   ```bash
   npm run cli test
   ```

### **Performance Issues**

1. **Monitor memory usage:**
   ```bash
   pm2 monit
   ```

2. **Restart if needed:**
   ```bash
   pm2 restart odessa-bot
   ```

## 📞 **Support**

If you encounter issues:

1. **Check the logs first**
2. **Review this guide**
3. **Test with `npm run cli test`**
4. **Check environment variables**
5. **Restart the bot if needed**

---

**🎉 Congratulations! Your Odessa Telegram Bot is now ready for production!**

**Next: Start your bot and test the `/schedule` command in Telegram!** 