import { Channel, Video, DashboardData, ChannelAnalysis, Timeframe } from '@/types';
import {
  calcEngagement,
  calcTrendingScore,
  getDayOfWeek,
  getWeekNumber,
  parseYouTubeURL,
} from '@/lib/utils';

const API_BASE = 'https://www.googleapis.com/youtube/v3';
const isDev = process.env.NODE_ENV === 'development';

// ── Multi-key rotation ────────────────────────────────────────
const API_KEYS = [
  process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_1,
  process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_2,
  process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_3,
  process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_4,
  // Legacy single-key fallback — included so old setups still work
  process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
].filter(
  // Reject undefined, empty strings, and placeholder values
  (k): k is string =>
    typeof k === 'string' && k.length > 20 && !k.startsWith('your_'),
);

// Deduplicate in case the same key appears more than once
const UNIQUE_API_KEYS = [...new Set(API_KEYS)];



let currentKeyIndex = 0;

function getCurrentKey(): string {
  return UNIQUE_API_KEYS[currentKeyIndex];
}

function rotateKey(): boolean {
  if (currentKeyIndex < UNIQUE_API_KEYS.length - 1) {
    currentKeyIndex++;
    if (isDev) {
      console.log(
        `[YouTube API] Quota exceeded on key ${currentKeyIndex}. Rotating to key ${currentKeyIndex + 1} of ${UNIQUE_API_KEYS.length}...`,
      );
    }
    return true;
  }
  return false;
}

function logQuota(label: string, units: number) {
  if (isDev) {
    console.log(`[YouTube API] ${label}: ~${units} units`);
  }
}

// ── Core request wrapper with rotation ───────────────────────
// Every API call goes through here. Returns parsed JSON data on success.
// Throws 'QUOTA_EXHAUSTED' when all keys are used up.
// Throws the API error message for all other failure modes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function youtubeRequest(url: string): Promise<any> {
  if (UNIQUE_API_KEYS.length === 0) {
    throw new Error('NO_API_KEY');
  }

  for (let attempt = 0; attempt < UNIQUE_API_KEYS.length; attempt++) {
    const key = getCurrentKey();
    const fullUrl = `${url}&key=${key}`;

    const response = await fetch(fullUrl);

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('INVALID_RESPONSE');
    }

    // Quota exceeded — try the next key
    if (
      data.error?.code === 403 &&
      data.error?.errors?.[0]?.reason === 'quotaExceeded'
    ) {
      const rotated = rotateKey();
      if (!rotated) {
        throw new Error('QUOTA_EXHAUSTED');
      }
      continue;
    }

    // Any other API-level error
    if (data.error) {
      throw new Error(data.error.message ?? 'API_ERROR');
    }

    return data;
  }

  throw new Error('QUOTA_EXHAUSTED');
}

// ── 6-hour localStorage cache ─────────────────────────────────
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in ms

interface CacheEntry {
  data: DashboardData;
  timestamp: number;
}

function getCachedData(handle: string): DashboardData | null {
  // localStorage is browser-only
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(`vidmetrics_v3_${handle.toLowerCase()}`);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    if (age > CACHE_DURATION) {
      localStorage.removeItem(`vidmetrics_v3_${handle.toLowerCase()}`);
      return null;
    }

    console.log(
      `[Cache] Serving ${handle} from cache (${Math.round(age / 60000)}min old)`,
    );
    return entry.data;
  } catch {
    return null;
  }
}

function setCachedData(handle: string, data: DashboardData): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(
      `vidmetrics_v3_${handle.toLowerCase()}`,
      JSON.stringify(entry),
    );
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

// ── Fetch channel by @handle ────────────────────────────────
export async function fetchChannelByHandle(handle: string): Promise<Channel> {
  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const data = await youtubeRequest(
    `${API_BASE}/channels?part=snippet,statistics&forHandle=${encodeURIComponent(cleanHandle)}`,
  );
  logQuota('channels (by handle)', 1);
  if (!data.items || data.items.length === 0) throw new Error('CHANNEL_NOT_FOUND');
  return mapChannel(data.items[0], cleanHandle);
}

// ── Fetch channel by ID ─────────────────────────────────────
export async function fetchChannelById(id: string): Promise<Channel> {
  const data = await youtubeRequest(
    `${API_BASE}/channels?part=snippet,statistics&id=${encodeURIComponent(id)}`,
  );
  logQuota('channels (by ID)', 1);
  if (!data.items || data.items.length === 0) throw new Error('CHANNEL_NOT_FOUND');
  return mapChannel(data.items[0]);
}

// ── Fetch video IDs with timeframe support ──────────────────
export async function fetchTopVideos(
  channelId: string,
  timeframe: Timeframe = 'Latest',
  maxResults: number = 20,
): Promise<string[]> {
  let order = 'viewCount';
  let publishedAfterParam = '';

  if (timeframe === 'Latest') {
    order = 'date';
  } else if (timeframe === 'thisMonth' || timeframe === '28D') {
    order = 'date';
    const d = new Date();
    d.setDate(d.getDate() - (timeframe === 'thisMonth' ? 30 : 28));
    publishedAfterParam = `&publishedAfter=${d.toISOString()}`;
  } else if (timeframe === 'thisWeek' || timeframe === '7D') {
    order = 'date';
    const d = new Date();
    d.setDate(d.getDate() - 7);
    publishedAfterParam = `&publishedAfter=${d.toISOString()}`;
  } else if (timeframe === '3M') {
    order = 'date';
    const d = new Date();
    d.setDate(d.getDate() - 90);
    publishedAfterParam = `&publishedAfter=${d.toISOString()}`;
  } else if (timeframe === '1Y') {
    order = 'date';
    const d = new Date();
    d.setDate(d.getDate() - 365);
    publishedAfterParam = `&publishedAfter=${d.toISOString()}`;
  }

  const data = await youtubeRequest(
    `${API_BASE}/search?part=snippet&channelId=${encodeURIComponent(channelId)}&order=${order}&type=video&maxResults=${maxResults}${publishedAfterParam}`,
  );
  logQuota(`search (${timeframe}, max=${maxResults})`, 100);

  if (!data.items) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.items.map((item: any) => item.id.videoId).filter(Boolean);
}

// ── Fetch recent uploads (chronological) ────────────────────
export async function fetchRecentUploads(
  channelId: string,
  count: number = 20,
): Promise<string[]> {
  const data = await youtubeRequest(
    `${API_BASE}/search?part=snippet&channelId=${encodeURIComponent(channelId)}&order=date&type=video&maxResults=${count}`,
  );
  logQuota(`search (recent uploads, count=${count})`, 100);

  if (!data.items) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.items.map((item: any) => item.id.videoId).filter(Boolean);
}

// ── Fetch video statistics + contentDetails ─────────────────
export async function fetchVideoStats(videoIds: string[]): Promise<Video[]> {
  if (videoIds.length === 0) return [];

  const ids = videoIds.slice(0, 50).join(',');
  const data = await youtubeRequest(
    `${API_BASE}/videos?part=snippet,statistics,contentDetails&id=${ids}`,
  );
  logQuota(`videos (${videoIds.length} IDs)`, 1);

  if (!data.items) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allViews = data.items.map((item: any) =>
    parseInt(item.statistics?.viewCount || '0', 10),
  );
  const avgViews =
    allViews.length > 0
      ? allViews.reduce((a: number, b: number) => a + b, 0) / allViews.length
      : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.items.map((item: any) => {
    const views = parseInt(item.statistics?.viewCount || '0', 10);
    const likes = parseInt(item.statistics?.likeCount || '0', 10);
    const comments = parseInt(item.statistics?.commentCount || '0', 10);
    const engagement = calcEngagement(likes, comments, views);
    const publishedAt = item.snippet.publishedAt;
    const duration = item.contentDetails?.duration || '';
    const partialVideo = { views, engagementRate: engagement, publishedAt } as Video;
    const trending = calcTrendingScore(partialVideo, avgViews);

    const thumb =
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.default?.url ||
      '';

    return {
      id: item.id,
      title: item.snippet.title,
      thumbnail: thumb,
      views,
      likes,
      comments,
      publishedAt,
      duration,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      engagementRate: engagement,
      trendingScore: trending,
      dayOfWeek: getDayOfWeek(publishedAt),
      weekNumber: getWeekNumber(publishedAt),
      // Backward-compat aliases
      thumbnailUrl: thumb,
      viewCount: views,
      likeCount: likes,
      commentCount: comments,
    } satisfies Video;
  });
}

// ── Helper: build DashboardData from demo fallback ───────────
function buildDemoResult(timeframe: Timeframe): DashboardData {
  const demo = getDemoData();
  const sorted = [...demo.videos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  return {
    channel: demo.channel,
    tableVideos: demo.videos,
    recentVideos: sorted,
    extendedVideos: sorted,
    timeframe,
    fetchedAt: new Date().toISOString(),
  };
}

// ── Orchestrator: full dashboard data ───────────────────────
export async function analyzeChannel(
  url: string,
  timeframe: Timeframe = 'Latest',
  opts?: { skipCharts?: boolean },
): Promise<DashboardData> {
  const parsed = parseYouTubeURL(url);

  if (!parsed.handle && !parsed.channelId) {
    throw new Error('INVALID_URL');
  }

  // Use the handle as the cache key (normalized, prefer handle over channelId)
  const cacheKey = parsed.handle ?? parsed.channelId ?? url;

  // ── Check cache first ─────────────────────────────────────
  const cached = getCachedData(cacheKey);
  if (cached) {
    // Return cached but with the requested timeframe reflected
    return { ...cached, timeframe };
  }

  try {
    // 1. Fetch channel
    const channel = parsed.channelId
      ? await fetchChannelById(parsed.channelId)
      : await fetchChannelByHandle(parsed.handle!);

    // 2. Fetch table video IDs for current timeframe
    const tableVideoIds = await fetchTopVideos(channel.id, timeframe);
    const tableVideos = await fetchVideoStats(tableVideoIds);

    if (timeframe === 'Latest') {
      // Latest: newest first
      tableVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (timeframe !== 'allTime') {
      tableVideos.sort((a, b) => b.views - a.views);
    }

    // 3 & 4. Fetch chart data (only on initial load, not on tab switch)
    let recentVideos: Video[] = [];
    let extendedVideos: Video[] = [];

    if (!opts?.skipCharts) {
      const recentIds = await fetchRecentUploads(channel.id, 20);
      recentVideos = await fetchVideoStats(recentIds);
      recentVideos.sort(
        (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );

      const extendedIds = await fetchRecentUploads(channel.id, 50);
      extendedVideos = await fetchVideoStats(extendedIds);
      extendedVideos.sort(
        (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );
    }

    logQuota(
      'Total for this call',
      opts?.skipCharts ? 102 : 304,
    );

    const result: DashboardData = {
      channel,
      tableVideos,
      recentVideos,
      extendedVideos,
      timeframe,
      fetchedAt: new Date().toISOString(),
    };

    // ── Store in cache ──────────────────────────────────────
    setCachedData(cacheKey, result);

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'NETWORK_ERROR';

    // Silent demo fallback: no key, quota on all keys, or key missing
    if (
      message === 'NO_API_KEY' ||
      message === 'QUOTA_EXCEEDED' ||
      message === 'QUOTA_EXHAUSTED'
    ) {
      if (isDev) {
        console.log('[YouTube API] All keys exhausted or unavailable. Loading demo data.');
      }
      return buildDemoResult(timeframe);
    }

    throw err;
  }
}

// ── Fetch table videos only (for tab switching) ─────────────
export async function fetchTableVideosForTab(
  channelId: string,
  timeframe: Timeframe,
): Promise<Video[]> {
  // Use more results for longer timeframes so the chart actually shows a
  // different/wider date range (prevents the "same graph" visual bug)
  let maxResults = 20;
  if (timeframe === '3M') maxResults = 30;
  if (timeframe === '1Y') maxResults = 50;

  const videoIds = await fetchTopVideos(channelId, timeframe, maxResults);
  const videos = await fetchVideoStats(videoIds);

  if (timeframe === 'Latest') {
    videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } else if (timeframe !== 'allTime') {
    videos.sort((a, b) => b.views - a.views);
  }

  logQuota(`Tab switch (${timeframe}, max=${maxResults})`, 101);
  return videos;
}

// ── Error message mapper ────────────────────────────────────
export function getErrorMessage(error: string): string {
  switch (error) {
    case 'INVALID_URL':
      return 'Please enter a valid YouTube channel URL';
    case 'CHANNEL_NOT_FOUND':
      return 'Channel not found. Check the URL and try again.';
    case 'QUOTA_EXCEEDED':
    case 'QUOTA_EXHAUSTED':
      return 'Daily limit reached. Try again tomorrow.';
    case 'NETWORK_ERROR':
      return 'Connection error. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// ── Map raw API item → Channel ──────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChannel(item: any, handle?: string): Channel {
  const subscriberCount = parseInt(item.statistics?.subscriberCount || '0', 10);
  const totalViews = parseInt(item.statistics?.viewCount || '0', 10);
  const videoCount = parseInt(item.statistics?.videoCount || '0', 10);
  const createdAt = item.snippet?.publishedAt || '';
  const avatar =
    item.snippet?.thumbnails?.high?.url ||
    item.snippet?.thumbnails?.medium?.url ||
    item.snippet?.thumbnails?.default?.url ||
    '';

  const monthsActive = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000),
    ),
  );
  const estimatedMonthlyViews = Math.round(totalViews / monthsActive);

  return {
    id: item.id,
    title: item.snippet?.title || '',
    handle: handle || item.snippet?.customUrl || `@${item.snippet?.title}`,
    avatar,
    subscribers: subscriberCount,
    totalViews,
    videoCount,
    createdAt,
    estimatedMonthlyViews,
    verified: false,
    // Backward-compat aliases
    description: item.snippet?.description || '',
    thumbnailUrl: avatar,
    subscriberCount,
    viewCount: totalViews,
    publishedAt: createdAt,
  };
}

// ── Demo fallback data (MrBeast) ────────────────────────────
export function getDemoData(): ChannelAnalysis {
  const now = new Date();
  const daysAgo = (d: number) =>
    new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  const channel: Channel = {
    id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    title: 'MrBeast',
    handle: '@MrBeast',
    avatar:
      'https://yt3.googleusercontent.com/ytc/AIdro_kX4G7Y9-L1y17K5B6mI8z2y6z0Xz3E_1w_y7M=s176-c-k-c0x00ffffff-no-rj',
    subscribers: 342_000_000,
    totalViews: 45_200_000_000,
    videoCount: 847,
    createdAt: '2012-02-20T00:00:00Z',
    estimatedMonthlyViews: Math.round(45_200_000_000 / 157),
    verified: true,
    // Backward-compat
    description: 'SUBSCRIBE FOR A COOKIE!',
    thumbnailUrl:
      'https://yt3.googleusercontent.com/ytc/AIdro_kX4G7Y9-L1y17K5B6mI8z2y6z0Xz3E_1w_y7M=s176-c-k-c0x00ffffff-no-rj',
    subscriberCount: 342_000_000,
    viewCount: 45_200_000_000,
    publishedAt: '2012-02-20T00:00:00Z',
  };

  const avgViews = 62_640_000;

  const videosRaw = [
    { id: 'v1',  title: 'I Spent 7 Days Buried Alive',                      views: 89_200_000, likes: 3_100_000, comments: 142_000, daysAgo: 14,  thumb: 'https://picsum.photos/seed/1/320/180' },
    { id: 'v2',  title: '$1 vs $1,000,000 Hotel Room',                       views: 76_400_000, likes: 2_800_000, comments: 128_000, daysAgo: 35,  thumb: 'https://picsum.photos/seed/2/320/180' },
    { id: 'v3',  title: 'Last To Leave Circle Wins $500,000',                views: 71_200_000, likes: 2_600_000, comments: 119_000, daysAgo: 65,  thumb: 'https://picsum.photos/seed/3/320/180' },
    { id: 'v4',  title: "I Built Willy Wonka's Chocolate Factory",           views: 68_500_000, likes: 2_400_000, comments: 108_000, daysAgo: 95,  thumb: 'https://picsum.photos/seed/4/320/180' },
    { id: 'v5',  title: 'Surviving 24 Hours Straight In The Ocean',          views: 61_300_000, likes: 2_100_000, comments: 97_000,  daysAgo: 125, thumb: 'https://picsum.photos/seed/5/320/180' },
    { id: 'v6',  title: 'Would You Swim With Sharks For $100,000?',          views: 54_700_000, likes: 1_900_000, comments: 88_000,  daysAgo: 155, thumb: 'https://picsum.photos/seed/6/320/180' },
    { id: 'v7',  title: 'I Gave My 40,000,000th Subscriber 40 Cars',         views: 48_200_000, likes: 1_700_000, comments: 79_000,  daysAgo: 185, thumb: 'https://picsum.photos/seed/7/320/180' },
    { id: 'v8',  title: "Going Through The World's Largest Obstacle Course", views: 41_600_000, likes: 1_500_000, comments: 71_000,  daysAgo: 215, thumb: 'https://picsum.photos/seed/8/320/180' },
    { id: 'v9',  title: 'Ages 1 - 100 Decide Who Wins $250,000',             views: 38_900_000, likes: 1_400_000, comments: 65_000,  daysAgo: 10,  thumb: 'https://picsum.photos/seed/9/320/180' },
    { id: 'v10', title: 'I Survived 50 Hours In Antarctica',                 views: 35_100_000, likes: 1_300_000, comments: 61_000,  daysAgo: 45,  thumb: 'https://picsum.photos/seed/10/320/180' },
    { id: 'v11', title: '$1 vs $250,000 Vacation!',                          views: 32_700_000, likes: 1_200_000, comments: 57_000,  daysAgo: 75,  thumb: 'https://picsum.photos/seed/11/320/180' },
    { id: 'v12', title: 'I Spent 50 Hours In Solitary Confinement',          views: 29_400_000, likes: 1_100_000, comments: 52_000,  daysAgo: 105, thumb: 'https://picsum.photos/seed/12/320/180' },
    { id: 'v13', title: "Lamborghini vs World's Largest Shredder",           views: 26_800_000, likes: 980_000,  comments: 48_000,  daysAgo: 135, thumb: 'https://picsum.photos/seed/13/320/180' },
    { id: 'v14', title: "I Ate The World's Largest Slice Of Pizza",          views: 24_500_000, likes: 890_000,  comments: 44_000,  daysAgo: 165, thumb: 'https://picsum.photos/seed/14/320/180' },
    { id: 'v15', title: 'I Bought Everything In 5 Stores',                   views: 22_100_000, likes: 810_000,  comments: 40_000,  daysAgo: 195, thumb: 'https://picsum.photos/seed/15/320/180' },
    { id: 'v16', title: 'Extreme $100,000 Game of Tag',                      views: 19_800_000, likes: 730_000,  comments: 36_000,  daysAgo: 7,   thumb: 'https://picsum.photos/seed/16/320/180' },
    { id: 'v17', title: 'I Built 100 Houses And Gave Them Away',             views: 17_500_000, likes: 650_000,  comments: 32_000,  daysAgo: 50,  thumb: 'https://picsum.photos/seed/17/320/180' },
    { id: 'v18', title: "Anything You Can Carry, I'll Pay For",              views: 15_200_000, likes: 570_000,  comments: 28_000,  daysAgo: 80,  thumb: 'https://picsum.photos/seed/18/320/180' },
    { id: 'v19', title: 'I Opened A Free Car Dealership',                    views: 13_600_000, likes: 500_000,  comments: 25_000,  daysAgo: 110, thumb: 'https://picsum.photos/seed/19/320/180' },
    { id: 'v20', title: "World's Most Dangerous Escape Room!",               views: 12_100_000, likes: 440_000,  comments: 22_000,  daysAgo: 140, thumb: 'https://picsum.photos/seed/20/320/180' },
  ];

  const videos: Video[] = videosRaw.map((v) => {
    const engagement = calcEngagement(v.likes, v.comments, v.views);
    const publishedAt = daysAgo(v.daysAgo);
    const partialVideo = { views: v.views, engagementRate: engagement, publishedAt } as Video;
    const trending = calcTrendingScore(partialVideo, avgViews);
    return {
      id: v.id,
      title: v.title,
      thumbnail: v.thumb,
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      publishedAt,
      duration: 'PT10M0S',
      url: `https://www.youtube.com/watch?v=${v.id}`,
      engagementRate: engagement,
      trendingScore: trending,
      dayOfWeek: getDayOfWeek(publishedAt),
      weekNumber: getWeekNumber(publishedAt),
      // Backward-compat
      thumbnailUrl: v.thumb,
      viewCount: v.views,
      likeCount: v.likes,
      commentCount: v.comments,
    };
  });

  return { channel, videos };
}
