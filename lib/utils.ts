// ── Format large numbers: 89200000 → "89.2M" ───────────────
export function formatNumber(num: number): string {
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
  if (views === 0) return 0;
  return Number((((likes + comments) / views) * 100).toFixed(2));
}

// ── Trending score: 0-100 ───────────────────────────────────
// Base:  engagement rate normalized 0-100 (capped at 10% → 100)
// Boost: published within 30 days → +20
// Boost: views > channel average  → +15
// Cap at 100
export function calcTrendingScore(
  engagementRate: number,
  publishedAt: string,
  views: number,
  channelAvgViews: number,
): number {
  // Normalize engagement: 0% → 0, 10%+ → 100
  const base = Math.min((engagementRate / 10) * 100, 100);

  let score = base;

  // Recency boost
  const daysSincePublish = Math.floor(
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSincePublish <= 30) score += 20;

  // Above-average boost
  if (channelAvgViews > 0 && views > channelAvgViews) score += 15;

  return Math.min(Math.round(score), 100);
}

// ── Parse YouTube URL → { handle?, channelId? } ────────────
export interface ParsedURL {
  handle?: string;
  channelId?: string;
}

export function parseYouTubeURL(input: string): ParsedURL {
  const trimmed = input.trim();

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
