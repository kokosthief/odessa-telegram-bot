#!/bin/bash

# Odessa Telegram Bot - Quick Start Script
# This script will help you set up and launch your bot quickly

echo "🚀 Odessa Telegram Bot - Quick Start"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your bot token and chat ID"
    echo "   - Get your bot token from @BotFather on Telegram"
    echo "   - Get your chat ID by sending a message to your bot and visiting:"
    echo "     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
    echo ""
    read -p "Press Enter when you've updated the .env file..."
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the application
echo ""
echo "🔨 Building application..."
npm run build

# Test bot connection
echo ""
echo "🧪 Testing bot connection..."
npm run cli test

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Bot connection successful!"
    echo ""
    echo "🎉 Your bot is ready to launch!"
    echo ""
    echo "Next steps:"
    echo "1. Start the bot: npm run cli run"
    echo "2. Test in Telegram: Send /start to your bot"
    echo "3. Try the schedule: Send /schedule to your bot"
    echo ""
    echo "For production deployment, see PRODUCTION_LAUNCH.md"
else
    echo ""
    echo "❌ Bot connection failed!"
    echo ""
    echo "Please check:"
    echo "1. Your TELEGRAM_BOT_TOKEN in .env file"
    echo "2. Your TELEGRAM_CHAT_ID in .env file"
    echo "3. Your internet connection"
    echo ""
    echo "Try running: npm run cli test"
fi

echo ""
echo "📚 For more information, see:"
echo "   - README.md (project overview)"
echo "   - USAGE.md (usage guide)"
echo "   - PRODUCTION_LAUNCH.md (production setup)"
echo "" 