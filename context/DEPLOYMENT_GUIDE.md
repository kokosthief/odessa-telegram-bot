# Deployment Guide - Odessa Telegram Bot

## 🚀 **Current Status**

The bot is ready for deployment to Vercel. All code has been tested locally and is working correctly.

## 📋 **Deployment Steps**

### 1. **Deploy to Vercel**

```bash
# Deploy to Vercel (interactive)
vercel --prod

# Or deploy with automatic confirmation
vercel --prod --yes
```

### 2. **Set Environment Variables in Vercel**

After deployment, add these environment variables in your Vercel dashboard:

#### **Required Variables:**
```
TELEGRAM_BOT_TOKEN=8356476635:AAG8xzGi7AN-4xdGRe8mmAisef2t_EaO7t4
TELEGRAM_CHAT_ID=6099054421
NODE_ENV=production
```

#### **Optional Variables (for Wix integration):**
```
WIX_API_KEY=IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjhlMjFkNDdmLTEyODEtNGZmNi1iZjk0LTg2Y2UzMjBkNTM5YVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjE2ZjMxNzg1LTQ0NjctNDQ4ZS1iZTg3LTA2YjM2ZGE5YzI3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCIzNmZkZTU0ZC1kMTVlLTQ4MzctODI0ZS0yYTZiZTc0NDlkNWFcIn19IiwiaWF0IjoxNzU0MDUyODc1fQ.hA57txFydDRzjUyfA4K9mg-WcF2KrsJC1bCTB_mNrOcuQQ1roM0JhjUxZLvbh_DhT9SMo42nEMj9jfmPRyMbKKJ6NkbOGgejZE0Js5syV_Yg1TIMaNMNbZ9IXw7o9yKx_gw528FYm6iTol2PzrvATxvdKF9gBfSroPC2ghCSQZxf0NAH6YGdQYrRJ1nEOb1_C6e8EkCY8b12XfbiFHBql_xltfJZdXYZjI4bjVrm4bT2TFDInXJ5TEN5R9GxLPggAHnDe7DNwzTU84g2VLzO6exy3Al2MHgJ7SSWIDLHlWbBd7VJKO_FwlKUxAL7O-3V3H0BKpdayeAZLq-oNzpW6g
WIX_SITE_ID=68c3f609-e405-4e64-b712-40239449936b
```

### 3. **Configure Telegram Webhook**

After deployment, set the webhook URL in Telegram:

```
https://your-vercel-domain.vercel.app/api/bot
```

Replace `your-vercel-domain` with your actual Vercel domain.

## 🔧 **Environment Variables Guide**

### **Production Variables (Required)**
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `TELEGRAM_CHAT_ID`: Your Telegram chat ID
- `NODE_ENV`: Set to "production"

### **Wix Integration Variables (Optional)**
- `WIX_API_KEY`: Your Wix API key (for enhanced DJ data)
- `WIX_SITE_ID`: Your Wix site ID

## 📊 **Testing After Deployment**

### 1. **Test Bot Commands**
Send these commands to your bot:
- `/start` - Welcome message
- `/help` - Help information
- `/schedule` - Get weekly schedule
- `/whosplaying` - Get today's schedule

### 2. **Check Logs**
Monitor the deployment in Vercel dashboard for any errors.

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Bot not responding**
   - Check `TELEGRAM_BOT_TOKEN` is correct
   - Verify webhook URL is set correctly

2. **Schedule generation fails**
   - Check network connectivity
   - Verify Hipsy.no is accessible

3. **Wix integration not working**
   - API permissions need to be resolved
   - Bot will fall back to local DJ data

## ✅ **Success Indicators**

- ✅ Bot responds to `/start` command
- ✅ `/schedule` generates weekly schedule
- ✅ `/whosplaying` shows today's events
- ✅ DJ links work in messages
- ✅ No errors in Vercel logs

## 📈 **Post-Deployment**

1. **Monitor Performance**: Check Vercel analytics
2. **Test Commands**: Verify all commands work
3. **Update Documentation**: Mark as "LIVE" in project status
4. **Wix Integration**: Resolve API permissions later

---

**Last Updated**: August 2024  
**Status**: Ready for Deployment  
**Next Step**: Deploy to Vercel 