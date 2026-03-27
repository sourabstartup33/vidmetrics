import { Video } from '@/types';

// ── Format large numbers: 89200000 → "89.2M" ───────────────
export function formatNumber(num: number): string {
  if (num == null || isNaN(num)) return '0';
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

// ── Format ISO date → "2 weeks ago" ─────────────────────────
export function formatDate(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return years === 1 ? '1 year ago' : `${years} years ago`;
  if (months > 0) return months === 1 ? '1 month ago' : `${months} months ago`;
  if (weeks > 0) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  if (days > 0) return days === 1 ? '1 day ago' : `${days} days ago`;
  if (hours > 0) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  if (minutes > 0) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  return 'just now';
}

// ── Engagement rate: ((likes + comments) / views) * 100 ─────
export function calcEngagement(
  likes: number,
  comments: number,
  views: number,
): number {
  if (!views || views === 0) return 0;
  return Number((((likes + comments) / views) * 100).toFixed(2));
}

// ── Trending score: 0-100 ───────────────────────────────────
// Base:  engagement rate normalized to 0-65 range
// Boost: published within 30 days → +20
// Boost: views > channel average  → +15
// Cap at 100, floor at 0
export function calcTrendingScore(
  video: Video,
  channelAvgViews: number,
): number {
  // Normalize engagement: 0% → 0, 10%+ → 65
  const base = Math.min((video.engagementRate / 10) * 65, 65);

  let score = base;

  // Recency boost
  const daysSincePublish = Math.floor(
    (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSincePublish <= 30) score += 20;

  // Above-average boost
  if (channelAvgViews > 0 && video.views > channelAvgViews) score += 15;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

// ── Parse ISO 8601 duration → seconds ───────────────────────
// Converts PT15M33S → 933, PT1H2M3S → 3723, etc.
export function parseDuration(iso8601: string): number {
  if (!iso8601) return 0;
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// ── Get day of week from ISO date ───────────────────────────
export function getDayOfWeek(iso: string): string {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return DAYS[new Date(iso).getDay()];
}

// ── Get ISO week number ─────────────────────────────────────
export function getWeekNumber(iso: string): number {
  const date = new Date(iso);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ── Calculate channel average views ─────────────────────────
export function calcChannelAvgViews(videos: Video[]): number {
  if (videos.length === 0) return 0;
  return Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length);
}

// ── Parse YouTube URL → { handle?, channelId? } ────────────
export interface ParsedURL {
  handle?: string;
  channelId?: string;
}

export function parseYouTubeURL(input: string): ParsedURL {
  const trimmed = input.trim();

  // Guard against excessively long inputs
  if (trimmed.length === 0 || trimmed.length > 500) {
    return {};
  }

  // Direct @handle (no URL)
  if (/^@[\w.-]+$/.test(trimmed)) {
    return { handle: trimmed };
  }

  try {
    // Try parsing as URL
    const url = new URL(
      trimmed.startsWith('http') ? trimmed : `https://www.youtube.com/${trimmed}`,
    );

    const pathname = url.pathname;

    // /@handle
    const handleMatch = pathname.match(/^\/@([\w.-]+)/);
    if (handleMatch) return { handle: `@${handleMatch[1]}` };

    // /channel/UCxxxxxx
    const channelMatch = pathname.match(/^\/channel\/(UC[\w-]+)/);
    if (channelMatch) return { channelId: channelMatch[1] };

    // /c/customname
    const customMatch = pathname.match(/^\/c\/([\w.-]+)/);
    if (customMatch) return { handle: `@${customMatch[1]}` };

    // /user/username — legacy format
    const userMatch = pathname.match(/^\/user\/([\w.-]+)/);
    if (userMatch) return { handle: `@${userMatch[1]}` };
  } catch {
    // Not a valid URL — treat as plain channel name / handle
  }

  // Fallback: treat raw text as a handle
  if (trimmed.length > 0) {
    return { handle: trimmed.startsWith('@') ? trimmed : `@${trimmed}` };
  }

  return {};
}
