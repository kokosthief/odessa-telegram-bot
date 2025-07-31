#!/bin/bash

# Odessa Telegram Bot - Production Deployment Script
# This script will deploy your bot to production using PM2

echo "🚀 Odessa Telegram Bot - Production Deployment"
echo "============================================="
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please run: cp env.example .env"
    echo "Then edit .env with your bot token and chat ID"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Create logs directory
mkdir -p logs

# Create PM2 ecosystem file
echo "📝 Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'odessa-bot',
    script: 'npm',
    args: 'run cli run',
    cwd: '$(pwd)',
    env: {
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Stop existing process if running
echo "🛑 Stopping existing bot process..."
pm2 stop odessa-bot 2>/dev/null || true
pm2 delete odessa-bot 2>/dev/null || true

# Start the bot
echo "🚀 Starting bot with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Set up PM2 startup script
echo "🔧 Setting up PM2 startup script..."
pm2 startup

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Bot Status:"
pm2 status odessa-bot

echo ""
echo "📝 Useful Commands:"
echo "  pm2 status                    # Check bot status"
echo "  pm2 logs odessa-bot          # View bot logs"
echo "  pm2 restart odessa-bot       # Restart bot"
echo "  pm2 stop odessa-bot          # Stop bot"
echo "  pm2 monit                    # Monitor resources"
echo ""
echo "🎉 Your bot is now running in production!"
echo "Test it by sending /start to your bot on Telegram"
echo "" 