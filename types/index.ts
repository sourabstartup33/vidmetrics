// ── Channel ──────────────────────────────────────────────────
export interface Channel {
  id: string;
  handle: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  publishedAt: string;
}

// ── Video ────────────────────────────────────────────────────
export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;   // ((likes + comments) / views) * 100
  trendingScore: number;    // 0-100
}

// ── API helpers ──────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface ChannelAnalysis {
  channel: Channel;
  videos: Video[];
}
