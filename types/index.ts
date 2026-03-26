// ── Timeframe ────────────────────────────────────────────────
export type Timeframe = 'allTime' | 'thisMonth' | 'thisWeek';

// ── Video ────────────────────────────────────────────────────
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  views: number;             // raw number
  likes: number;             // raw number
  comments: number;          // raw number
  publishedAt: string;       // ISO date string
  duration: string;          // ISO 8601 duration e.g. PT15M33S
  url: string;               // full youtube.com/watch?v= URL
  // calculated fields
  engagementRate: number;    // percentage as number e.g. 3.6
  trendingScore: number;     // 0-100
  dayOfWeek: string;         // "Monday", "Tuesday" etc
  weekNumber: number;        // for grouping

  // ── Backward-compat aliases (used by existing components) ──
  thumbnailUrl: string;      // same as thumbnail
  viewCount: number;         // same as views
  likeCount: number;         // same as likes
  commentCount: number;      // same as comments
}

// ── Channel ──────────────────────────────────────────────────
export interface Channel {
  id: string;
  title: string;
  handle: string;
  avatar: string;
  subscribers: number;       // raw number
  totalViews: number;        // raw number
  videoCount: number;        // raw number
  createdAt: string;         // ISO date string
  estimatedMonthlyViews: number; // calculated
  verified: boolean;

  // ── Backward-compat aliases (used by existing components) ──
  description: string;
  thumbnailUrl: string;      // same as avatar
  subscriberCount: number;   // same as subscribers
  viewCount: number;         // same as totalViews
  publishedAt: string;       // same as createdAt
}

// ── Dashboard data ───────────────────────────────────────────
export interface DashboardData {
  channel: Channel;
  tableVideos: Video[];      // changes per filter tab
  recentVideos: Video[];     // last 20 chronological, fixed
  extendedVideos: Video[];   // last 50 chronological, fixed
  timeframe: Timeframe;
  fetchedAt: string;         // timestamp for cache invalidation
}

// ── Legacy ChannelAnalysis (kept for getDemoData compat) ─────
export interface ChannelAnalysis {
  channel: Channel;
  videos: Video[];
}

// ── API helpers ──────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}
