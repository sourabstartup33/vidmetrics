# VidMetrics — YouTube Competitor Intelligence

Paste any YouTube channel URL. Instantly surface what's winning, why it's working, and what you should do about it.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vidmetrics--gold.vercel.app-6366F1?style=for-the-badge)](https://vidmetrics-gold.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-sourabstartup33%2Fvidmetrics-181717?style=for-the-badge&logo=github)](https://github.com/sourabstartup33/vidmetrics)

---

## What It Does

VidMetrics is a YouTube competitor analytics tool built for enterprise content teams. It transforms raw YouTube data into strategic intelligence — not just metrics, but actionable recommendations a content strategist can act on Monday morning.

### Overview Tab

Backward looking. What has this channel done?

- Performance chart with metric toggles (Views, Engagement Rate, Trending Score)
- Shared time filter (7D, 28D, 3M, 1Y) controlling all sections simultaneously
- Quick stats row (Avg Views, Avg Engagement, Videos Published, Hot Content %)
- Full video table with sorting, pagination, and one-click CSV export

### Intelligence Brief Tab

Forward looking. What does this mean for YOU?

- AI Strategic Summary powered by Gemini 2.5 Flash — 3 paragraph competitor analysis with specific numbers
- What's Working — winning format, hook pattern, best posting day
- Audience Signals — inferred behavioral patterns from public performance data
- Content Gaps and Action List — 5 data-driven gaps with 5 prioritized strategic actions

---

## Live Demo

Open [https://vidmetrics-gold.vercel.app](https://vidmetrics-gold.vercel.app)

Demo credentials are pre-filled on the login page. Just hit Sign In.

```
Email:    demo@vidmetrics.io
Password: VidMetrics@2026
```

Try these channels to see the Intelligence Brief in action:

- `@MrBeast` — high volume, challenge format, viral hooks
- `@mkbhd` — tech reviews, consistent cadence, strong engagement
- `@veritasium` — science, long-form, search-driven audience

---

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/sourabstartup33/vidmetrics
cd vidmetrics

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Open .env.local and fill in your API keys

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_YOUTUBE_API_KEY_1` | Yes | Primary YouTube Data API v3 key |
| `NEXT_PUBLIC_YOUTUBE_API_KEY_2` | No | Fallback key, auto-rotates on quota exceeded |
| `NEXT_PUBLIC_YOUTUBE_API_KEY_3` | No | Fallback key |
| `NEXT_PUBLIC_YOUTUBE_API_KEY_4` | No | Fallback key |
| `NEXT_PUBLIC_YOUTUBE_API_KEY_5` | No | Fallback key |
| `NEXT_PUBLIC_GEMINI_API_KEY` | No | Google Gemini API key, enables AI Strategic Brief |

**Getting your keys:**

- YouTube API: [Google Cloud Console](https://console.cloud.google.com) → Enable YouTube Data API v3 → Credentials → Create API Key
- Gemini API: [Google AI Studio](https://aistudio.google.com) → Get API Key (free tier available)

> If no YouTube API keys are configured, the app silently falls back to built-in demo data so presentations never break.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Data Source | YouTube Data API v3 |
| AI Layer | Google Gemini 2.5 Flash |
| Deployment | Vercel |

---

## Project Structure

```
/app
  layout.tsx                  Root layout with metadata
  page.tsx                    Landing page
  /login/page.tsx             Login page (demo credentials pre-filled)
  /signup/page.tsx            Signup page
  /dashboard/page.tsx         Main analytics dashboard
/components                   All UI components (PascalCase)
/lib
  youtube.ts                  YouTube API service layer and key rotation
  utils.ts                    formatNumber, calcEngagement,
                              calcTrendingScore, parseYouTubeURL
  insights.ts                 6 data-driven insights engine
  gemini.ts                   Gemini API integration
/types
  index.ts                    TypeScript interfaces (Channel, Video, DashboardData)
```

---

## Architecture Decisions

### Three Separate Video Datasets

The dashboard maintains three independent state variables:

- `tableVideos` — changes per time filter tab, drives the video table
- `recentVideos` — last 20 chronological uploads, drives all charts
- `extendedVideos` — last 50 chronological uploads, drives the insights engine

Keeping these separate prevents the common mistake of filtering all-time top videos by date (which always returns empty for recent timeframes).

### Tab-Aware API Calls

Each time filter (7D, 28D, 3M, 1Y) triggers a fresh YouTube API call with `publishedAfter` — not client-side filtering of the same dataset. Results are cached per-tab via `useRef` to avoid redundant calls within a session.

### API Key Rotation

Up to 5 YouTube API keys rotate automatically when a key returns a 403 quota exceeded error. Responses are also cached in `localStorage` for 6 hours, reducing quota consumption on repeat visits.

### Race Condition Prevention

Fast tab switching uses a `requestId` pattern — each new request increments a counter and stale responses are discarded if a newer request has already resolved.

---

## Metric Formulas

**Engagement Rate:**

```
((likes + comments) / views) x 100
Rounded to 2 decimal places
```

**Trending Score (0 to 100):**

```
Base score: engagement rate normalized to 0-65 range
Recency boost: +20 if published within last 30 days
Reach boost:   +15 if views exceed channel average
Capped at 100, floored at 0
```

Color coding: Green above 70 (Hot), Amber 40-70 (Warm), Red below 40 (Cold)

---

## How It Was Built

Built in under 4 days as part of a product challenge. The entire workflow was AI-native from day one.

### The Workflow

**Step 1 — Design Shell (Google AI Studio + Gemini 3.1 Pro)**

Used Google AI Studio to generate the initial UI from detailed prompts and reference screenshots of Linear and Tubular Labs. This produced the full component structure, Tailwind styling system, and animation foundations in a single generation pass.

**Step 2 — Stack Migration and Logic (Cursor + Antigravity)**

Imported the AI Studio output into Cursor for initial review and structural planning. The bulk of the logic layer was built using Antigravity as the primary agentic IDE. Google AI Studio contributed ~10% (design shell), Cursor ~30% (component refinements and targeted edits), and Antigravity ~60% (core architecture, API layer, and intelligence engine):

- Migrated from Vite + React to Next.js 15 App Router
- Built the YouTube API service layer with key rotation and caching
- Implemented data architecture with three independent datasets
- Wired up all sorting, filtering, CSV export, and chart logic
- Integrated Gemini API for the AI Strategic Brief

Used strategic model selection throughout:

- Claude Opus for complex architectural decisions (data layer, API design)
- Claude Sonnet for standard logic, API wiring, and bug fixes
- Gemini 3.1 Pro for UI components, design sessions, and layout work
- Gemini 3.1 Flash for quick targeted fixes and text changes

**Step 3 — Intelligence Layer**

Built the insights engine in `/lib/insights.ts` to generate 6 data-driven observations from real channel data. Then built the full Intelligence Brief tab with Gemini-powered strategic summaries, audience signal inference, and content gap detection — all derived from actual video data, zero hardcoded strings.

### Build Philosophy

Followed a strict construction order: data architecture first, layout structure second, intelligence layer third, design polish last. Never built UI on broken data. Never touched design during data sessions. This prevented the cascade of rework that kills fast builds.

---

## V2 Roadmap

- Multi-channel watchlist to track and compare competitors side by side
- Historical growth charts (requires own database for daily snapshots — YouTube API only provides current totals)
- Thumbnail pattern analysis using computer vision
- Comment sentiment analysis using NLP on public comment data
- Shareable report links with unique URL per analysis
- Weekly email digest for automated competitor monitoring
- Real authentication with NextAuth and PostgreSQL
- Niche trend detection across multiple channels simultaneously

---

## Known Limitations

- YouTube Data API v3 provides current totals only — no historical subscriber or view growth data available via public API
- CTR, watch time, and audience demographics are only accessible to channel owners via YouTube Studio
- API quota is 10,000 units per day per GCP project, supporting approximately 32 full fresh analyses per day on the free tier
- AI Strategic Brief requires a Gemini API key and shows a retry error state if the key is missing or rate limited

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint and TypeScript checks |

---

## About

Built by **Saurabdeep Singh** as part of a 4-day product challenge.

- GitHub: [github.com/sourabstartup33](https://github.com/sourabstartup33)
- Live product: [vidmetrics-gold.vercel.app](https://vidmetrics-gold.vercel.app)
