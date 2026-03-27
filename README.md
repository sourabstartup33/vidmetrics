# VidMetrics

Competitor intelligence for YouTube — track any channel, surface viral trends, and make data-driven decisions.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template
cp .env.local.example .env.local

# 3. Fill in your API keys (see below)

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_YOUTUBE_API_KEY_1` | **Yes** | Primary YouTube Data API v3 key |
| `NEXT_PUBLIC_YOUTUBE_API_KEY_2` | No | Backup key (auto-rotates on quota) |
| `NEXT_PUBLIC_YOUTUBE_API_KEY_3` | No | Backup key |
| `NEXT_PUBLIC_YOUTUBE_API_KEY_4` | No | Backup key |
| `NEXT_PUBLIC_GEMINI_API_KEY` | No | Google Gemini API key (enables AI Strategic Summary on the Intelligence Brief tab) |

> **Note:** If no YouTube API keys are configured, the app falls back to built-in demo data (MrBeast channel).

## Key Flows

### Channel Analysis
1. User pastes a YouTube channel URL or `@handle` in the search bar
2. `parseYouTubeURL()` extracts the handle or channel ID
3. `analyzeChannel()` fetches channel info + latest videos via YouTube Data API
4. Results are cached in `localStorage` for 6 hours
5. Dashboard renders: Channel Header → Quick Stats → Performance Chart → Video Table

### Time Filters
- Clicking 7D / 28D / 3M / 1Y fetches videos for that timeframe via `fetchTableVideosForTab()`
- Results are cached per-tab in a `useRef` to avoid duplicate API calls within a session

### Intelligence Brief
- Deterministic sections (What's Working, Audience Signals, Content Gaps) are computed client-side from video data
- AI Strategic Summary calls the Gemini API for a 3-bullet competitor analysis

### API Key Rotation
- Up to 4 YouTube API keys are supported
- When a key hits quota (403), the system automatically rotates to the next key
- When all keys are exhausted, falls back to demo data

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **AI:** Google Gemini 2.5 Flash
- **Deployment:** Vercel

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
