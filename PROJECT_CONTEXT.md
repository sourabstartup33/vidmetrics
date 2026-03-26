# VidMetrics — PROJECT_CONTEXT.md

## What This Product Is
VidMetrics is a YouTube competitor analytics SaaS tool for enterprise 
content teams and media companies. Users paste a competitor's YouTube 
channel URL and instantly see which videos are performing best — with 
metrics, trending scores, charts, and export functionality.

## Why It Exists
Built as a demo-ready MVP for a client presentation. Must feel like 
a real funded SaaS product, not a prototype.

## Current State
- Design shell built in Vite + React (AI Studio output)
- All UI components, pages, animations complete
- Stack needs migrating to Next.js 15 App Router
- No real API integration yet — all mock data

## Target Stack
- Framework: Next.js 15 App Router
- Styling: Tailwind CSS v4
- Language: TypeScript
- Animation: Framer Motion (motion package)
- Icons: lucide-react
- Charts: recharts
- HTTP: native fetch (no axios)
- Deploy: Vercel

## Pages
- / → Landing page (marketing, hero, features, pricing)
- /login → Pre-filled demo credentials, routes to /dashboard
- /signup → Pre-filled demo fields, routes to /dashboard  
- /dashboard → Main analytics dashboard

## Auth Strategy
FAKE auth only. No real backend auth.
- Login: pre-filled email/password → navigate to /dashboard
- Signup: pre-filled fields → navigate to /dashboard
- No sessions, no JWT, no database

## YouTube API
- Provider: YouTube Data API v3
- Key stored in: .env.local as NEXT_PUBLIC_YOUTUBE_API_KEY
- Quota: 10,000 units/day (be efficient with calls)
- Key calls needed:
  1. channels?part=snippet,statistics&forHandle={handle}
  2. search?part=snippet&channelId={id}&order=viewCount&type=video
  3. videos?part=statistics,snippet&id={videoIds}

## Channel Input Flow
1. User pastes URL on landing page OR dashboard search
2. Parse URL to extract handle or channel ID
  - Handle formats: @MrBeast, youtube.com/@MrBeast
  - ID format: youtube.com/channel/UCxxxxxx
3. Fetch channel data → show in dashboard
4. Fetch top 20 videos → show in table
5. Show loading states throughout

## URL Parsing Logic
Support all these YouTube URL formats:
- https://youtube.com/@handle
- https://www.youtube.com/@handle
- https://youtube.com/channel/UCxxxxxx
- https://youtube.com/c/customname
- @handle (just the handle directly)
- Plain channel name

## Core Metrics Per Video
- Title
- Thumbnail URL
- View count (formatted: 89.2M, 1.2K)
- Like count
- Comment count
- Published date (relative: "2 weeks ago")
- Engagement Rate = ((likes + comments) / views) * 100
- Trending Score = custom algorithm:
  * Base: engagement rate normalized 0-100
  * Boost: if published within 30 days → +20 points
  * Boost: if views > channel average → +15 points
  * Cap at 100
  * Color: green >70, amber 40-70, red <40

## Features To Build
1. Channel URL input (landing + dashboard)
2. Real YouTube API fetch with loading states
3. Video table with real data
4. Sort by: Views, Engagement Rate, Trending Score, Date
5. Filter by: All Time, This Month, This Week
6. CSV export of current table data
7. Charts with real data (area chart + bar chart)
8. Error states (invalid URL, channel not found, quota exceeded)

## Component Conventions
- PascalCase for all components
- All interactive components need 'use client' directive
- API calls in /lib/youtube.ts service file
- Types in /types/index.ts
- Utility functions in /lib/utils.ts

## File Structure Target
/app
  layout.tsx
  page.tsx
  /login/page.tsx
  /signup/page.tsx
  /dashboard/page.tsx
/components
  (all existing UI components)
/lib
  youtube.ts      ← YouTube API service
  utils.ts        ← formatNumber, formatDate, calcEngagement, 
                     calcTrendingScore, parseYouTubeURL
/types
  index.ts        ← Channel, Video, ApiResponse interfaces

## Environment Variables
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key_here

## Error Handling
- Invalid URL → "Please enter a valid YouTube channel URL"
- Channel not found → "Channel not found. Check the URL and try again."
- API quota exceeded → "Daily limit reached. Try again tomorrow."
- Network error → "Connection error. Please try again."

## Demo Fallback
If API key is missing or quota exceeded, fall back to MrBeast 
mock data silently so demo never breaks.

## Commit Convention
feat: → new feature
fix: → bug fix
refactor: → code restructure
style: → UI changes only

## Current Priority Order
1. Next.js 15 migration (preserve all design)
2. /lib/youtube.ts + /types/index.ts
3. URL parsing + channel fetch
4. Video table with real data
5. Sorting + filtering
6. CSV export
7. Charts with real data
8. Error + loading states
9. Polish + deploy
```

---

**How to use this in Antigravity:**

Create this file as `PROJECT_CONTEXT.md` in the project root, then start your Antigravity session with:
```
Read PROJECT_CONTEXT.md fully before doing anything. 
Then begin Priority 1: migrate from Vite + React to Next.js 15 
App Router. Preserve all existing design and components exactly. 
Follow all conventions in the context file.