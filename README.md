# Odessa Telegram Bot

Telegram bot for Odessa — an ecstatic dance boat in Amsterdam. Scrapes event data from Hipsy.no, provides weekly schedules, DJ profiles, membership info, and practical details to the Odessa Telegram group.

## 🚀 Live & Deployed

- **Webhook**: https://odessa-telegram-bot.vercel.app/api/bot
- **Repo**: github.com/kokosthief/odessa-telegram-bot
- **Auto-deploy**: Vercel on push to `main`

## 📱 Commands

| Command | What it does |
|---------|-------------|
| `/whosplaying` | Who's facilitating today (photo + SoundCloud link + ticket button) |
| `/schedule` | This week's full schedule Mon–Sun (video + ticket button) |
| `/next` | Next upcoming event with countdown |
| `/dj [name]` | DJ profile lookup (photo, bio, SoundCloud/Instagram links). No name = list all DJs |
| `/discover` | Random DJ discovery |
| `/membership` | MemberShip info — €135 per 4 weeks, what's included, subscribe button → mijn.odessa.amsterdam |
| `/location` | Map pin + Google Maps link |
| `/types` | Event types explained (ED, Cacao, Queerstatic, Journey) |
| `/lostproperty` | Lost & found info |
| `/commands` | Full command list |

### Removed commands
- `/start`, `/help`, `/countdown`, `/venue`, `/report` — removed Feb 2026 (redundant or inaccurate)

## 🏗️ Architecture

**Two command handler layers** (keep in sync!):

| File | Purpose |
|------|---------|
| `api/bot.ts` | **Vercel webhook handler** — this is what runs in production |
| `src/telegram/bot.ts` | **OdessaBot class** — used by CLI (`npm run cli run`) |

⚠️ When adding/removing commands, update **both files**. The webhook (`api/bot.ts`) is what Telegram actually calls.

### Other API routes

| Route | Purpose |
|-------|---------|
| `api/scheduled-schedule.ts` | Cron: posts weekly schedule (Wed 10:11 UTC) |
| `api/scheduled-whosplaying.ts` | Cron: posts today's DJ (Tue 14:33, Sat 08:33 UTC) |
| `api/test.ts` | Health check endpoint |

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Telegram**: node-telegram-bot-api
- **Event data**: Hipsy.no scraper (`src/scrapers/hipsy-scraper.ts`)
- **DJ data**: JSON database (`src/data/djs.json`) + Wix API fallback
- **Hosting**: Vercel (serverless functions)
- **Rate limiting**: 60s per user (in-memory, resets per Vercel instance)

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions (PRODUCTION)
│   ├── bot.ts              # Telegram webhook handler
│   ├── scheduled-*.ts      # Cron jobs
│   └── test.ts             # Health check
├── src/
│   ├── telegram/bot.ts     # OdessaBot class (CLI)
│   ├── scrapers/           # Hipsy.no scraper
│   ├── formatters/         # Schedule formatting
│   ├── utils/              # DJ loader, URL validator, group tracker
│   ├── types/              # TypeScript types
│   └── data/djs.json       # DJ database
├── assets/                 # Static assets (membership image etc.)
├── context/                # Documentation & PRPs
└── vercel.json             # Routes + cron config
```

## 🔧 Development

```bash
npm install           # Install deps
cp env.example .env   # Set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
npm run dev           # Dev server
npm run cli run       # Start interactive bot (polling mode)
npm run build         # Build TypeScript
npm run type-check    # Check types without building
```

## 📝 Key Details

- **Schedule fetches**: Uses `'all'` events filter (not `'upcoming'`) so `/schedule` shows full Mon–Sun even when called mid-week
- **B2B events**: Handles multiple DJs per event (detected from `djNames` array or separator parsing)
- **DJ links**: First checks Wix API (`wix-dj-loader.ts`), falls back to local JSON (`dj-loader.ts`)
- **Video caching**: `/schedule` sends a video with `file_id` for fast re-sends
- **Membership image**: Served from GitHub raw (`assets/membership.jpg`)

## 🔗 Related Projects

- **mijn.odessa.amsterdam** — Subscription platform (€135 per 4 weeks membership)
- **team.odessa.amsterdam** — Team scheduling app (Flask + Supabase)

---

Built for the Odessa boat 🚢
