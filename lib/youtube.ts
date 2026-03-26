import { Channel, Video, ChannelAnalysis } from '@/types';
import { calcEngagement, calcTrendingScore, parseYouTubeURL } from '@/lib/utils';

const API_BASE = 'https://www.googleapis.com/youtube/v3';

function getApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_YOUTUBE_API_KEY && 
         process.env.NEXT_PUBLIC_YOUTUBE_API_KEY !== 'your_key_here'
    ? process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    : undefined;
}

// ── Fetch channel by @handle ────────────────────────────────
export async function fetchChannelByHandle(handle: string): Promise<Channel> {
  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');

  // Remove leading @ if present for the API call
  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;

  const res = await fetch(
    `${API_BASE}/channels?part=snippet,statistics&forHandle=${encodeURIComponent(cleanHandle)}&key=${key}`,
  );

  if (res.status === 403) throw new Error('QUOTA_EXCEEDED');
  if (!res.ok) throw new Error('NETWORK_ERROR');

  const data = await res.json();
  if (!data.items || data.items.length === 0) throw new Error('CHANNEL_NOT_FOUND');

  return mapChannel(data.items[0], cleanHandle);
}

// ── Fetch channel by ID ─────────────────────────────────────
export async function fetchChannelById(id: string): Promise<Channel> {
  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');

  const res = await fetch(
    `${API_BASE}/channels?part=snippet,statistics&id=${encodeURIComponent(id)}&key=${key}`,
  );

  if (res.status === 403) throw new Error('QUOTA_EXCEEDED');
  if (!res.ok) throw new Error('NETWORK_ERROR');

  const data = await res.json();
  if (!data.items || data.items.length === 0) throw new Error('CHANNEL_NOT_FOUND');

  return mapChannel(data.items[0]);
}

// ── Fetch top videos by view count ──────────────────────────
export async function fetchTopVideos(
  channelId: string,
  maxResults: number = 20,
): Promise<string[]> {
  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');

  const res = await fetch(
    `${API_BASE}/search?part=snippet&channelId=${encodeURIComponent(channelId)}&order=viewCount&type=video&maxResults=${maxResults}&key=${key}`,
  );

  if (res.status === 403) throw new Error('QUOTA_EXCEEDED');
  if (!res.ok) throw new Error('NETWORK_ERROR');

  const data = await res.json();
  if (!data.items) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.items.map((item: any) => item.id.videoId).filter(Boolean);
}

// ── Fetch video statistics ──────────────────────────────────
export async function fetchVideoStats(
  videoIds: string[],
): Promise<Video[]> {
  if (videoIds.length === 0) return [];

  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');

  // YouTube API accepts max 50 IDs per call
  const ids = videoIds.slice(0, 50).join(',');

  const res = await fetch(
    `${API_BASE}/videos?part=snippet,statistics&id=${ids}&key=${key}`,
  );

  if (res.status === 403) throw new Error('QUOTA_EXCEEDED');
  if (!res.ok) throw new Error('NETWORK_ERROR');

  const data = await res.json();
  if (!data.items) return [];

  // Calculate channel average views for trending score
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
    const trending = calcTrendingScore(
      engagement,
      item.snippet.publishedAt,
      views,
      avgViews,
    );

    return {
      id: item.id,
      title: item.snippet.title,
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        '',
      publishedAt: item.snippet.publishedAt,
      viewCount: views,
      likeCount: likes,
      commentCount: comments,
      engagementRate: engagement,
      trendingScore: trending,
    } satisfies Video;
  });
}

// ── Orchestrator: analyzeChannel(url) ───────────────────────
export async function analyzeChannel(
  url: string,
): Promise<ChannelAnalysis> {
  const parsed = parseYouTubeURL(url);

  if (!parsed.handle && !parsed.channelId) {
    throw new Error('INVALID_URL');
  }

  try {
    // 1. Fetch channel
    const channel = parsed.channelId
      ? await fetchChannelById(parsed.channelId)
      : await fetchChannelByHandle(parsed.handle!);

    // 2. Fetch top video IDs
    const videoIds = await fetchTopVideos(channel.id, 20);

    // 3. Fetch video details + stats
    const videos = await fetchVideoStats(videoIds);

    return { channel, videos };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'NETWORK_ERROR';

    // Fallback to demo data if API key missing or quota exceeded
    if (message === 'NO_API_KEY' || message === 'QUOTA_EXCEEDED') {
      return getDemoData();
    }

    throw err;
  }
}

// ── Error message mapper ────────────────────────────────────
export function getErrorMessage(error: string): string {
  switch (error) {
    case 'INVALID_URL':
      return 'Please enter a valid YouTube channel URL';
    case 'CHANNEL_NOT_FOUND':
      return 'Channel not found. Check the URL and try again.';
    case 'QUOTA_EXCEEDED':
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
  return {
    id: item.id,
    handle: handle || item.snippet?.customUrl || `@${item.snippet?.title}`,
    title: item.snippet?.title || '',
    description: item.snippet?.description || '',
    thumbnailUrl:
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      '',
    subscriberCount: parseInt(item.statistics?.subscriberCount || '0', 10),
    viewCount: parseInt(item.statistics?.viewCount || '0', 10),
    videoCount: parseInt(item.statistics?.videoCount || '0', 10),
    publishedAt: item.snippet?.publishedAt || '',
  };
}

// ── Demo fallback data (MrBeast) ────────────────────────────
export function getDemoData(): ChannelAnalysis {
  const now = new Date();
  const daysAgo = (d: number) =>
    new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  const channel: Channel = {
    id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    handle: '@MrBeast',
    title: 'MrBeast',
    description: 'SUBSCRIBE FOR A COOKIE!',
    thumbnailUrl:
      'https://yt3.googleusercontent.com/ytc/AIdro_kX4G7Y9-L1y17K5B6mI8z2y6z0Xz3E_1w_y7M=s176-c-k-c0x00ffffff-no-rj',
    subscriberCount: 342_000_000,
    viewCount: 45_200_000_000,
    videoCount: 847,
    publishedAt: '2012-02-20T00:00:00Z',
  };

  const avgViews = 62_640_000;

  const videosRaw = [
    { id: 'v1', title: 'I Spent 7 Days Buried Alive', views: 89_200_000, likes: 3_100_000, comments: 142_000, daysAgo: 14, thumb: 'https://picsum.photos/seed/1/320/180' },
    { id: 'v2', title: '$1 vs $1,000,000 Hotel Room', views: 76_400_000, likes: 2_800_000, comments: 128_000, daysAgo: 35, thumb: 'https://picsum.photos/seed/2/320/180' },
    { id: 'v3', title: 'Last To Leave Circle Wins $500,000', views: 71_200_000, likes: 2_600_000, comments: 119_000, daysAgo: 65, thumb: 'https://picsum.photos/seed/3/320/180' },
    { id: 'v4', title: "I Built Willy Wonka's Chocolate Factory", views: 68_500_000, likes: 2_400_000, comments: 108_000, daysAgo: 95, thumb: 'https://picsum.photos/seed/4/320/180' },
    { id: 'v5', title: 'Surviving 24 Hours Straight In The Ocean', views: 61_300_000, likes: 2_100_000, comments: 97_000, daysAgo: 125, thumb: 'https://picsum.photos/seed/5/320/180' },
    { id: 'v6', title: 'Would You Swim With Sharks For $100,000?', views: 54_700_000, likes: 1_900_000, comments: 88_000, daysAgo: 155, thumb: 'https://picsum.photos/seed/6/320/180' },
    { id: 'v7', title: 'I Gave My 40,000,000th Subscriber 40 Cars', views: 48_200_000, likes: 1_700_000, comments: 79_000, daysAgo: 185, thumb: 'https://picsum.photos/seed/7/320/180' },
    { id: 'v8', title: "Going Through The World's Largest Obstacle Course", views: 41_600_000, likes: 1_500_000, comments: 71_000, daysAgo: 215, thumb: 'https://picsum.photos/seed/8/320/180' },
    { id: 'v9', title: 'Ages 1 - 100 Decide Who Wins $250,000', views: 38_900_000, likes: 1_400_000, comments: 65_000, daysAgo: 10, thumb: 'https://picsum.photos/seed/9/320/180' },
    { id: 'v10', title: 'I Survived 50 Hours In Antarctica', views: 35_100_000, likes: 1_300_000, comments: 61_000, daysAgo: 45, thumb: 'https://picsum.photos/seed/10/320/180' },
    { id: 'v11', title: '$1 vs $250,000 Vacation!', views: 32_700_000, likes: 1_200_000, comments: 57_000, daysAgo: 75, thumb: 'https://picsum.photos/seed/11/320/180' },
    { id: 'v12', title: 'I Spent 50 Hours In Solitary Confinement', views: 29_400_000, likes: 1_100_000, comments: 52_000, daysAgo: 105, thumb: 'https://picsum.photos/seed/12/320/180' },
    { id: 'v13', title: 'Lamborghini vs World\'s Largest Shredder', views: 26_800_000, likes: 980_000, comments: 48_000, daysAgo: 135, thumb: 'https://picsum.photos/seed/13/320/180' },
    { id: 'v14', title: "I Ate The World's Largest Slice Of Pizza", views: 24_500_000, likes: 890_000, comments: 44_000, daysAgo: 165, thumb: 'https://picsum.photos/seed/14/320/180' },
    { id: 'v15', title: 'I Bought Everything In 5 Stores', views: 22_100_000, likes: 810_000, comments: 40_000, daysAgo: 195, thumb: 'https://picsum.photos/seed/15/320/180' },
    { id: 'v16', title: 'Extreme $100,000 Game of Tag', views: 19_800_000, likes: 730_000, comments: 36_000, daysAgo: 7, thumb: 'https://picsum.photos/seed/16/320/180' },
    { id: 'v17', title: 'I Built 100 Houses And Gave Them Away', views: 17_500_000, likes: 650_000, comments: 32_000, daysAgo: 50, thumb: 'https://picsum.photos/seed/17/320/180' },
    { id: 'v18', title: 'Anything You Can Carry, I\'ll Pay For', views: 15_200_000, likes: 570_000, comments: 28_000, daysAgo: 80, thumb: 'https://picsum.photos/seed/18/320/180' },
    { id: 'v19', title: 'I Opened A Free Car Dealership', views: 13_600_000, likes: 500_000, comments: 25_000, daysAgo: 110, thumb: 'https://picsum.photos/seed/19/320/180' },
    { id: 'v20', title: 'World\'s Most Dangerous Escape Room!', views: 12_100_000, likes: 440_000, comments: 22_000, daysAgo: 140, thumb: 'https://picsum.photos/seed/20/320/180' },
  ];

  const videos: Video[] = videosRaw.map((v) => {
    const engagement = calcEngagement(v.likes, v.comments, v.views);
    const publishedAt = daysAgo(v.daysAgo);
    const trending = calcTrendingScore(engagement, publishedAt, v.views, avgViews);
    return {
      id: v.id,
      title: v.title,
      thumbnailUrl: v.thumb,
      publishedAt,
      viewCount: v.views,
      likeCount: v.likes,
      commentCount: v.comments,
      engagementRate: engagement,
      trendingScore: trending,
    };
  });

  return { channel, videos };
}
