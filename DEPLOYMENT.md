# 🚀 GitHub + Vercel Deployment Guide

This guide will walk you through deploying your Odessa Telegram Bot to GitHub and Vercel.

## 📋 **Pre-Deployment Checklist**

### ✅ **Step 1: Prepare Your Repository**

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Odessa Telegram Bot"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/odessa-telegram-bot.git

# Push to GitHub
git push -u origin main
```

### ✅ **Step 2: Set Up GitHub Repository**

1. **Go to GitHub.com** and create a new repository
2. **Name it**: `odessa-telegram-bot`
3. **Make it public** (Vercel needs access)
4. **Don't initialize** with README (we already have one)

### ✅ **Step 3: Push Your Code**

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add Telegram bot with command handling"

# Push to GitHub
git push origin main
```

## 🌐 **Vercel Deployment**

### **Step 1: Install Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

### **Step 2: Deploy to Vercel**

```bash
# Deploy to Vercel
vercel --prod
```

**During deployment, Vercel will ask:**
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **What's your project's name?** → `odessa-telegram-bot`
- **In which directory is your code located?** → `./` (current directory)

### **Step 3: Configure Environment Variables**

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add these variables:**

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
NODE_ENV=production
```

### **Step 4: Set Up Telegram Webhook**

Once deployed, you'll get a URL like: `https://your-project.vercel.app`

Set up the webhook:

```bash
# Replace with your actual values
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-project.vercel.app/api/bot",
    "allowed_updates": ["message"]
  }'
```

## 🔧 **Alternative: GitHub Actions + Vercel**

### **Step 1: Create GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./
```

### **Step 2: Set Up Vercel Integration**

1. **Go to Vercel dashboard**
2. **Import your GitHub repository**
3. **Configure environment variables**
4. **Deploy automatically**

## 📱 **Testing Your Deployed Bot**

### **Step 1: Test Webhook**

```bash
# Test if webhook is set correctly
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### **Step 2: Test Commands**

Send these to your bot:
- `/start` - Welcome message
- `/help` - Help information
- `/schedule` - Generate schedule

### **Step 3: Check Logs**

```bash
# View Vercel function logs
vercel logs your-project-name
```

## 🔍 **Monitoring & Maintenance**

### **Vercel Dashboard**

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Monitor:**
   - Function invocations
   - Response times
   - Error rates
   - Logs

### **GitHub Repository**

1. **Monitor commits and deployments**
2. **Set up branch protection**
3. **Add issue templates**

## 🚨 **Troubleshooting**

### **Common Issues**

| Issue | Solution |
|-------|----------|
| Webhook not receiving updates | Check webhook URL and token |
| Environment variables missing | Add them in Vercel dashboard |
| Function timeout | Increase maxDuration in vercel.json |
| Build errors | Check TypeScript compilation |

### **Debug Commands**

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

## 🔄 **Continuous Deployment**

### **Automatic Deployments**

Once set up, every push to `main` will:
1. **Trigger GitHub Actions**
2. **Build the project**
3. **Deploy to Vercel**
4. **Update the webhook**

### **Manual Deployments**

```bash
# Deploy manually
vercel --prod

# Deploy to preview
vercel
```

## 📊 **Performance Monitoring**

### **Vercel Analytics**

- **Function invocations per day**
- **Average response time**
- **Error rate**
- **Cold start frequency**

### **Telegram Bot Analytics**

- **Command usage frequency**
- **User engagement**
- **Error patterns**

## 🎉 **Success Checklist**

- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Webhook set up correctly
- [ ] Bot responding to commands
- [ ] Logs being generated
- [ ] Monitoring configured

---

## 🚀 **Quick Deploy Commands**

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to Vercel"
git push origin main

# 2. Deploy to Vercel
vercel --prod

# 3. Set webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-project.vercel.app/api/bot"}'

# 4. Test your bot
# Send /start to your bot on Telegram
```

**🎉 Your bot will now be live and automatically deployed!** 