# Security Guide

## 🔒 Sensitive Information Protection

This project follows security best practices to protect sensitive information from being exposed in public repositories.

### ✅ **Secured Information**

The following sensitive information has been moved to environment variables and removed from public documentation:

1. **Hipsy API Key**
   - ❌ **Removed from**: `src/scrapers/hipsy-scraper.ts`
   - ❌ **Removed from**: `src/test-*.ts` files
   - ❌ **Removed from**: `TELEGRAM_SETUP.md`
   - ✅ **Now uses**: `process.env['HIPSY_API_KEY']`

2. **Telegram Bot Token**
   - ❌ **Removed from**: `USAGE.md`
   - ✅ **Now uses**: `process.env['TELEGRAM_BOT_TOKEN']`

3. **Telegram Chat ID**
   - ❌ **Removed from**: `USAGE.md`
   - ✅ **Now uses**: `process.env['TELEGRAM_CHAT_ID']`

### 🔧 **Environment Variables**

All sensitive configuration is now handled through environment variables:

```bash
# Copy the example file
cp env.example .env

# Edit with your actual values
nano .env
```

**Required Variables:**
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `TELEGRAM_CHAT_ID` - Target chat ID
- `HIPSY_API_KEY` - Your Hipsy.nl API key

### 🚫 **What's Not in the Repository**

- ✅ No API keys in source code
- ✅ No bot tokens in documentation
- ✅ No chat IDs in public files
- ✅ No database credentials in code
- ✅ No production secrets in examples

### 🔐 **Security Best Practices**

1. **Environment Variables**: All secrets stored in `.env` (gitignored)
2. **Example Files**: `env.example` shows structure without real values
3. **Documentation**: References environment variables, not actual values
4. **Production**: Secrets stored securely in Vercel environment variables

### 📋 **Setup Instructions**

1. **Local Development**:
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

2. **Production Deployment**:
   - Set environment variables in Vercel dashboard
   - Never commit `.env` files to repository
   - Use different values for development and production

### 🛡️ **Additional Security Measures**

- **Gitignore**: `.env` files are excluded from version control
- **Validation**: Application validates required environment variables on startup
- **Error Handling**: Graceful handling of missing environment variables
- **Logging**: No sensitive data logged in production

### ⚠️ **Important Notes**

- **Never commit `.env` files** to the repository
- **Use different API keys** for development and production
- **Rotate secrets regularly** for production environments
- **Monitor access logs** for any suspicious activity

---

**Last Updated**: December 2024  
**Security Status**: ✅ All sensitive information secured 