# Odessa Telegram Bot

Automated schedule generator for Odessa boat events (Ecstatic Dance) in Amsterdam. Scrapes event data from Hipsy.nl, enriches with DJ info from Wix CMS, and posts to Telegram.

## Quick Reference

**Live**: https://odessa-telegram-bot.vercel.app
**Status**: Production-ready, deployed on Vercel with webhook + cron jobs

## Commands

| Command | Description |
|---------|-------------|
| `/whosplaying` | Today's events with DJ photos, bios, ticket links |
| `/schedule` | Weekly schedule (Mon-Sun) with video |
| `/start` | Welcome message |
| `/help` | Available commands |

## Project Structure

```
src/
├── index.ts                    # OdessaTodayGenerator - today's schedule
├── weekly-schedule-generator.ts # Weekly schedule (Mon-Sun)
├── scrapers/hipsy-scraper.ts   # Hipsy.nl API scraping
├── formatters/whosplaying-formatter.ts # Schedule formatting
├── telegram/bot.ts             # Bot commands & handlers
├── utils/
│   ├── dj-loader.ts           # DJ data from JSON
│   └── wix-dj-loader.ts       # DJ data from Wix CMS (photos, bios)
├── data/djs.json              # DJ database (SoundCloud/Mixcloud links)
└── types/                     # TypeScript interfaces

api/
├── bot.ts                     # Telegram webhook handler
├── scheduled-schedule.ts      # Cron: weekly post (Wed 11:00 UTC)
├── scheduled-whosplaying.ts   # Cron: who's playing (Tue 14:33 UTC, Sat 08:33 UTC)
└── test.ts                    # Health check
```

## Key Technologies

- **TypeScript** with strict mode
- **node-telegram-bot-api** for Telegram
- **axios** for HTTP requests
- **date-fns** + **date-fns-tz** for timezone handling
- **Vercel** serverless deployment + Crons

## Data Flow

1. **HipsyScraper** fetches events from Hipsy.nl API
2. **WixDJLoader** enriches with DJ photos/bios (falls back to djs.json)
3. **WhosPlayingFormatter** or **WeeklyScheduleGenerator** formats output
4. **OdessaBot** sends to Telegram with inline keyboards

## Environment Variables

Required:
- `TELEGRAM_BOT_TOKEN` - Bot API token
- `TELEGRAM_CHAT_ID` - Primary chat ID
- `TELEGRAM_GROUP_CHAT_ID` - Group IDs for scheduled posts (comma-separated)
- `HIPSY_API_KEY` - Hipsy.nl API key

Optional:
- `WIX_API_KEY`, `WIX_SITE_ID` - For enhanced DJ info
- `TIMEZONE` - Default: Europe/Amsterdam

## Development

```bash
npm run dev          # Start dev server
npm run build        # Compile TypeScript
npm run cli whosplaying  # Test today's schedule
npm run cli run      # Run interactive bot locally
npm test             # Run tests
```

## Event Types

- Ecstatic Dance (ED)
- Cacao Ecstatic Dance
- Live Music
- Queerstatic
- Ecstatic Journey (displayed as "Journey")
- Custom events show original title

## Key Features

- **B2B Events**: Multiple DJs separated by "&" with individual photos
- **Fuzzy DJ Matching**: Handles special characters (e.g., Ma'rifa variants)
- **Smart Time Display**: "tonight" for 4PM+, "today" for Sunday morning
- **Rate Limiting**: 60s per user to prevent spam
- **Wix Caching**: 1-hour cache for DJ data

## Scheduled Posts (Cron Jobs)

| Schedule | Endpoint | Description |
|----------|----------|-------------|
| Wed 11:00 UTC (~12:00 Amsterdam) | `/api/scheduled-schedule` | Weekly schedule post |
| Tue 14:33 UTC (~15:33 Amsterdam) | `/api/scheduled-whosplaying` | Who's playing today |
| Sat 08:33 UTC (~09:33 Amsterdam) | `/api/scheduled-whosplaying` | Who's playing today |

## Recent Changes

- Added scheduled "who's playing" posts (Tue 3:33 PM, Sat 9:33 AM Amsterdam)
- Improved fuzzy matching for DJ names with special characters
- B2B event handling with proper DJ link display
- Custom event support (non-standard event titles)

## Detailed Documentation

See `context/` folder for comprehensive docs:
- `context/CLAUDE.md` - Implementation guidelines
- `context/README.md` - Full project documentation
- `context/PRPs/` - Feature requirement docs
