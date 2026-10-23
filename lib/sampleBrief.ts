import { getDemoData } from '@/lib/youtube';
import { generateInsights } from '@/lib/insights';
import {
  computeBestDay,
  computeContentGaps,
  computeDayAverages,
  computeWinningFormat,
  hasNumberHook,
  topByViews,
} from '@/lib/brief';
import { calcChannelAvgViews, formatNumber } from '@/lib/utils';

// ── Sample brief for the landing page ────────────────────────
// Built from the same demo channel the dashboard falls back to, at a fixed
// date so the server render and the browser agree. Every figure on the
// landing page is computed here from the rows, never typed in.

export const SAMPLE_AS_OF = new Date('2026-10-19T12:00:00Z');

export interface SampleVideo {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  duration: string;
  engagementRate: number;
  trendingScore: number;
}

export interface SampleBrief {
  asOf: string;
  channel: { title: string; handle: string; subscribers: number; videoCount: number };
  uploadsRead: number;
  avgViews: number;
  topVideo: SampleVideo & { timesAverage: number };
  formats: { label: string; avg: number; count: number }[];
  days: { short: string; avg: number; count: number; counted: boolean; best: boolean }[];
  bestDay: { day: string; pct: number; count: number };
  titles: { title: string; views: number; hook: boolean }[];
  titleHookCount: number;
  gaps: { gap: string; detail: string; action: string }[];
  uploads: { id: string; title: string; views: number; publishedAt: string }[];
  cadenceDays: number;
}

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function buildSampleBrief(): SampleBrief {
  const { channel, videos } = getDemoData(SAMPLE_AS_OF);
  const byDate = [...videos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  const avgViews = calcChannelAvgViews(videos);
  const top = topByViews(videos, 1)[0];
  const best = computeBestDay(byDate);
  const formats = computeWinningFormat(videos) ?? [];
  const top10 = topByViews(videos, 10);
  const gaps = computeContentGaps(byDate, byDate);

  const cadence = generateInsights({
    channel,
    tableVideos: videos,
    recentVideos: byDate,
    extendedVideos: byDate,
    timeframe: 'Latest',
    fetchedAt: SAMPLE_AS_OF.toISOString(),
  }).find(i => i.id === 'cadence');
  const cadenceDays = Number(cadence?.detail.match(/([\d.]+) days/)?.[1] ?? 0);

  const pick = (v: (typeof videos)[number]): SampleVideo => ({
    id: v.id,
    title: v.title,
    views: v.views,
    likes: v.likes,
    comments: v.comments,
    publishedAt: v.publishedAt,
    duration: v.duration,
    engagementRate: v.engagementRate,
    trendingScore: v.trendingScore,
  });

  const brief: SampleBrief = {
    asOf: SAMPLE_AS_OF.toISOString(),
    channel: {
      title: channel.title,
      handle: channel.handle,
      subscribers: channel.subscribers,
      videoCount: channel.videoCount,
    },
    uploadsRead: videos.length,
    avgViews,
    topVideo: { ...pick(top), timesAverage: Math.round((top.views / avgViews) * 10) / 10 },
    formats: formats.map(f => ({ label: f.label, avg: f.avg, count: f.count })),
    days: computeDayAverages(byDate).map(d => ({
      short: SHORT[d.day],
      avg: d.avg,
      count: d.count,
      counted: d.counted,
      best: best ? d.day === best.index : false,
    })),
    bestDay: best ? { day: best.day, pct: best.pct, count: best.count } : { day: '', pct: 0, count: 0 },
    titles: top10.map(v => ({ title: v.title, views: v.views, hook: hasNumberHook(v.title) })),
    titleHookCount: top10.filter(v => hasNumberHook(v.title)).length,
    gaps,
    uploads: byDate.map(v => ({ id: v.id, title: v.title, views: v.views, publishedAt: v.publishedAt })),
    cadenceDays,
  };

  // The figures the page repeats must agree with each other
  console.assert(brief.days.filter(d => d.counted).every(d => d.count >= 2), 'sample brief: counted days need 2+ uploads');
  console.assert(brief.formats.reduce((s, f) => s + f.count, 0) === brief.uploadsRead, 'sample brief: formats must cover every upload');
  console.assert(formatNumber(brief.topVideo.views) === formatNumber(top.views), 'sample brief: top video mismatch');

  return brief;
}
