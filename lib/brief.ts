import { Video } from '@/types';
import { parseDuration } from '@/lib/utils';

// ── Intelligence Brief calculations ──────────────────────────
// Pure functions shared by the dashboard's Intelligence Brief tab and the
// landing page's sample brief, so both always say the same thing.

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function avg(arr: number[]) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

// ── Views by weekday ─────────────────────────────────────────
// A day only counts as a posting day with 2+ uploads on it.
export interface DayAverage {
  day: number;      // 0 = Sunday
  avg: number;      // average views per upload on that day, 0 when not a posting day
  count: number;
  counted: boolean; // true when the day has enough uploads to compare
}

export function computeDayAverages(videos: Video[]): DayAverage[] {
  const b = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));
  videos.forEach(v => {
    const d = new Date(v.publishedAt).getDay();
    b[d].sum += v.views;
    b[d].count++;
  });
  return b.map((x, i) => ({
    day: i,
    avg: x.count >= 2 ? x.sum / x.count : 0,
    count: x.count,
    counted: x.count >= 2,
  }));
}

export function computeBestDay(videos: Video[]) {
  const valid = computeDayAverages(videos).filter(d => d.counted);
  if (!valid.length) return null;
  const best = valid.reduce((a, c) => (c.avg > a.avg ? c : a));
  const overall = avg(valid.map(d => d.avg));
  const pct = overall > 0 ? Math.round(((best.avg - overall) / overall) * 100) : 0;
  return { day: DAYS[best.day], short: DAYS_SHORT[best.day], index: best.day, pct, count: best.count, avg: best.avg };
}

// ── Winning format (by duration) ─────────────────────────────
export interface FormatRow {
  key: 'short' | 'medium' | 'long';
  label: string;
  avg: number;
  count: number;
}

export function computeWinningFormat(videos: Video[]): FormatRow[] | null {
  const b: Record<FormatRow['key'], { sum: number; count: number; label: string }> = {
    short: { sum: 0, count: 0, label: 'Under 5 min' },
    medium: { sum: 0, count: 0, label: '5 to 15 min' },
    long: { sum: 0, count: 0, label: 'Over 15 min' },
  };
  videos.forEach(v => {
    const s = parseDuration(v.duration);
    const key = s < 300 ? 'short' : s < 900 ? 'medium' : 'long';
    b[key].sum += v.views;
    b[key].count++;
  });
  const rows = (Object.keys(b) as FormatRow['key'][])
    .filter(key => b[key].count > 0)
    .map(key => ({ key, label: b[key].label, avg: b[key].sum / b[key].count, count: b[key].count }))
    .sort((a, c) => c.avg - a.avg);
  return rows.length ? rows : null;
}

// ── Title pattern ────────────────────────────────────────────
export function topByViews(videos: Video[], n: number) {
  return [...videos].sort((a, b) => b.views - a.views).slice(0, n);
}

export function hasNumberHook(title: string) {
  return /[$\d]/.test(title);
}

// ── Audience signals ─────────────────────────────────────────
export interface AudienceSignal {
  kind: 'engagement' | 'appetite' | 'viewer' | 'peak';
  title: string;
  value: string;
  desc: string;
}

export function computeAudienceSignals(recentVideos: Video[], extendedVideos: Video[]): AudienceSignal[] {
  // Engagement type: likes against comments
  const totalLikes = recentVideos.reduce((s, v) => s + v.likes, 0);
  const totalComments = recentVideos.reduce((s, v) => s + v.comments, 0);
  const ratio = totalComments > 0 ? round1(totalLikes / totalComments) : 0;
  const engType: AudienceSignal =
    ratio > 20
      ? { kind: 'engagement', title: 'Engagement type', value: 'Quiet fans', desc: `${ratio} likes for every comment. The audience watches and likes but rarely talks back.` }
      : ratio >= 10
        ? { kind: 'engagement', title: 'Engagement type', value: 'Actively engaged', desc: `${ratio} likes for every comment, a healthy mix of watching and discussing.` }
        : { kind: 'engagement', title: 'Engagement type', value: 'Vocal community', desc: `${ratio} likes for every comment. The audience argues in the comments.` };

  // Content appetite: length of their top 10
  const top10 = topByViews(recentVideos, 10);
  const avgMinutes = round1(avg(top10.map(v => parseDuration(v.duration))) / 60);
  const appetite: AudienceSignal =
    avgMinutes < 5
      ? { kind: 'appetite', title: 'Content appetite', value: 'Short form', desc: `Their top 10 videos average ${avgMinutes} min.` }
      : avgMinutes <= 15
        ? { kind: 'appetite', title: 'Content appetite', value: 'Mid-length', desc: `Their top 10 videos average ${avgMinutes} min.` }
        : avgMinutes <= 30
          ? { kind: 'appetite', title: 'Content appetite', value: 'Long form', desc: `Their top 10 videos average ${avgMinutes} min.` }
          : { kind: 'appetite', title: 'Content appetite', value: 'Deep dives', desc: `Their top 10 videos average ${avgMinutes} min.` };

  // Viewer type: search phrasing against personality hooks
  const SEO = ['how to', 'best', 'review', 'vs', 'tutorial', 'guide', 'top', 'tips'];
  const VIRAL = ['i ', 'we ', '$', '!', 'challenge', 'days', 'hours', 'last to'];
  let seo = 0;
  let viral = 0;
  top10.forEach(v => {
    const t = v.title.toLowerCase();
    if (SEO.some(k => t.includes(k))) seo++;
    if (VIRAL.some(k => t.includes(k))) viral++;
  });
  const viewer: AudienceSignal =
    viral > seo
      ? { kind: 'viewer', title: 'Viewer type', value: 'Follows the creator', desc: `${viral} of their top 10 titles lead with a personality hook, not a search term.` }
      : seo > viral
        ? { kind: 'viewer', title: 'Viewer type', value: 'Comes from search', desc: `${seo} of their top 10 titles are phrased the way people search.` }
        : { kind: 'viewer', title: 'Viewer type', value: 'Mixed discovery', desc: 'Their top titles split evenly between search phrasing and personality hooks.' };

  // Peak day
  const best = computeBestDay(extendedVideos);
  const peak: AudienceSignal = best
    ? { kind: 'peak', title: 'Peak day', value: `${best.day}s`, desc: `${best.pct}% above their other posting days, from ${best.count} ${best.day} uploads.` }
    : { kind: 'peak', title: 'Peak day', value: 'Not enough data', desc: 'Too few uploads per weekday to compare days.' };

  return [engType, appetite, viewer, peak];
}

// ── Content gaps and the action for each ─────────────────────
export interface ContentGap {
  gap: string;
  detail: string;
  action: string;
}

export function computeContentGaps(recentVideos: Video[], extendedVideos: Video[]): ContentGap[] {
  const gaps: ContentGap[] = [];

  // Upload frequency
  const sorted = [...extendedVideos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  if (sorted.length >= 2) {
    const spanDays =
      (new Date(sorted[sorted.length - 1].publishedAt).getTime() - new Date(sorted[0].publishedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    const avgDays = Math.round(spanDays / (sorted.length - 1));
    if (avgDays > 14) {
      gaps.push({
        gap: 'Long gaps between uploads',
        detail: `They upload every ${avgDays} days on average, so their audience waits.`,
        action: `Post every ${Math.max(1, Math.round(avgDays / 2))} days or faster to fill their quiet weeks.`,
      });
    } else if (avgDays >= 7) {
      gaps.push({
        gap: 'A weekly rhythm you can beat',
        detail: `They upload every ${avgDays} days, predictable and beatable.`,
        action: `Match or beat their ${avgDays}-day cadence.`,
      });
    } else {
      const cadence = avgDays <= 1 ? 'every day' : `every ${avgDays} days`;
      gaps.push({
        gap: 'They own frequency',
        detail: `They upload ${cadence}.`,
        action: 'Compete on depth: fewer, bigger videos.',
      });
    }
  }

  // Weakest posting day
  const valid = computeDayAverages(extendedVideos).filter(d => d.counted);
  if (valid.length >= 2) {
    const worst = valid.reduce((a, c) => (c.avg < a.avg ? c : a));
    const overall = avg(valid.map(d => d.avg));
    const below = overall > 0 ? Math.abs(Math.round(((worst.avg - overall) / overall) * 100)) : 0;
    gaps.push({
      gap: `Weak ${DAYS[worst.day]}s`,
      detail: `Their ${DAYS[worst.day]} uploads average ${below}% below their other posting days.`,
      action: `Publish on ${DAYS[worst.day]}, when they are weakest.`,
    });
  } else {
    gaps.push({
      gap: 'No weak day yet',
      detail: 'Too few uploads per weekday to find their weakest day.',
      action: 'Test two posting days and compare against their uploads.',
    });
  }

  // Length
  const top20 = topByViews(recentVideos, 20);
  const under10 = top20.filter(v => parseDuration(v.duration) < 600).length;
  const over10 = top20.filter(v => parseDuration(v.duration) >= 600).length;
  if (under10 < 3) {
    gaps.push({
      gap: 'Nothing short',
      detail: `${under10} of their top 20 videos run under 10 minutes.`,
      action: 'Test short videos to reach the casual viewers they miss.',
    });
  } else if (over10 < 3) {
    gaps.push({
      gap: 'Nothing long',
      detail: `${over10} of their top 20 videos run over 10 minutes.`,
      action: 'Test long-form videos to build a more loyal audience.',
    });
  } else {
    gaps.push({
      gap: 'No length gap',
      detail: 'They mix short and long videos.',
      action: 'Double down on the length that earns them the most engagement.',
    });
  }

  // Engagement
  const avgEng = round1(avg(recentVideos.map(v => v.engagementRate)));
  if (avgEng > 3.5) {
    gaps.push({
      gap: 'A loyal audience',
      detail: `${avgEng}% average engagement. Their fans are hard to win over.`,
      action: 'Go after viewers who have not subscribed yet, through search and recommendations.',
    });
  } else if (avgEng >= 2) {
    gaps.push({
      gap: 'Room on engagement',
      detail: `${avgEng}% average engagement leaves room to out-engage them.`,
      action: 'Ask for comments and reply to them, to beat their engagement.',
    });
  } else {
    gaps.push({
      gap: 'A passive audience',
      detail: `${avgEng}% average engagement. Viewers watch and leave.`,
      action: 'Make videos that invite a reply.',
    });
  }

  // Momentum
  const byDate = [...recentVideos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  if (byDate.length >= 4) {
    const half = Math.floor(byDate.length / 2);
    const oldAvg = avg(byDate.slice(0, half).map(v => v.views));
    const newAvg = avg(byDate.slice(byDate.length - half).map(v => v.views));
    const trend = oldAvg > 0 ? Math.round(((newAvg - oldAvg) / oldAvg) * 100) : 0;
    if (trend < -10) {
      gaps.push({
        gap: 'Slipping',
        detail: `Their newer uploads average ${Math.abs(trend)}% fewer views than the older half.`,
        action: 'Their audience is ready for something new. Move now.',
      });
    } else if (trend <= 10) {
      gaps.push({
        gap: 'Flat',
        detail: `Their newer uploads are within ${Math.abs(trend)}% of the older half.`,
        action: 'Try a new format or angle while they stand still.',
      });
    } else {
      gaps.push({
        gap: 'Gaining',
        detail: `Their newer uploads average ${trend}% more views than the older half.`,
        action: 'Act before their momentum compounds.',
      });
    }
  }

  return gaps;
}
