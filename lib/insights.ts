import { Video, DashboardData, Insight } from '@/types';

// ── Helpers ──────────────────────────────────────────────────

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function pctDiff(a: number, b: number): number {
  if (b === 0) return 0;
  return Math.round(((a - b) / b) * 100);
}

// ── Insight 1 — Posting Cadence ──────────────────────────────
function insightPostingCadence(extendedVideos: Video[]): Insight {
  const sorted = [...extendedVideos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );

  let cadenceDays = 7; // default fallback

  if (sorted.length >= 2) {
    const spanMs =
      new Date(sorted[sorted.length - 1].publishedAt).getTime() -
      new Date(sorted[0].publishedAt).getTime();
    const spanDays = spanMs / (1000 * 60 * 60 * 24);
    cadenceDays = round1(spanDays / Math.max(sorted.length - 1, 1));
  }

  if (cadenceDays < 4) {
    return {
      id: 'cadence',
      icon: 'Calendar',
      category: 'posting',
      headline: 'Posts very frequently',
      detail: `Uploads every ${cadenceDays} days on average — high content velocity creates consistent audience touchpoints.`,
      signal: 'neutral',
    };
  }
  if (cadenceDays <= 10) {
    return {
      id: 'cadence',
      icon: 'Calendar',
      category: 'posting',
      headline: 'Consistent weekly cadence',
      detail: `Uploads every ${cadenceDays} days on average — predictable schedule builds subscriber habits.`,
      signal: 'positive',
    };
  }
  return {
    id: 'cadence',
    icon: 'Calendar',
    category: 'posting',
    headline: 'Infrequent upload schedule',
    detail: `Only uploads every ${cadenceDays} days — slower cadence may limit algorithm reach.`,
    signal: 'warning',
  };
}

// ── Insight 2 — Best Posting Day ─────────────────────────────
function insightBestDay(extendedVideos: Video[]): Insight {
  const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const buckets: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({
    sum: 0,
    count: 0,
  }));

  extendedVideos.forEach((v) => {
    const day = new Date(v.publishedAt).getDay(); // 0=Sun
    buckets[day].sum += v.views;
    buckets[day].count += 1;
  });

  // Only consider days with ≥ 2 uploads
  const validDays = buckets
    .map((b, i) => ({ day: i, avg: b.count >= 2 ? b.sum / b.count : 0, count: b.count }))
    .filter((d) => d.count >= 2);

  if (validDays.length === 0) {
    return {
      id: 'best-day',
      icon: 'TrendingUp',
      category: 'posting',
      headline: 'No clear posting day pattern',
      detail: 'Upload schedule is too irregular to identify a best-performing day.',
      signal: 'neutral',
    };
  }

  const allAvg = avg(validDays.map((d) => d.avg));
  const best = validDays.reduce((a, b) => (b.avg > a.avg ? b : a));
  const pct = pctDiff(best.avg, allAvg);
  const dayName = DAYS_FULL[best.day];
  const dayShort = DAYS_SHORT[best.day];

  return {
    id: 'best-day',
    icon: 'TrendingUp',
    category: 'posting',
    headline: `${dayShort} drives peak performance`,
    detail: `${dayName} uploads average ${pct}% more views than their weekly average — a clear sweet spot in their strategy.`,
    signal: 'positive',
  };
}

// ── Insight 3 — Recent Momentum ──────────────────────────────
function insightMomentum(recentVideos: Video[]): Insight {
  const sorted = [...recentVideos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  const mid = Math.ceil(sorted.length / 2);
  const older = sorted.slice(0, mid);
  const newer = sorted.slice(mid);

  const avgOlder = avg(older.map((v) => v.views));
  const avgNewer = avg(newer.map((v) => v.views));
  const pct = Math.abs(pctDiff(avgNewer, avgOlder));

  if (avgNewer > avgOlder * 1.1) {
    return {
      id: 'momentum',
      icon: 'BarChart2',
      category: 'growth',
      headline: 'Views momentum is accelerating',
      detail: `Recent uploads average ${pct}% more views than earlier ones — their content strategy is gaining traction.`,
      signal: 'positive',
    };
  }
  if (avgNewer < avgOlder * 0.9) {
    return {
      id: 'momentum',
      icon: 'BarChart2',
      category: 'growth',
      headline: 'Recent views are declining',
      detail: `Recent uploads averaging ${pct}% fewer views than earlier content — possible audience fatigue or algorithm shift.`,
      signal: 'warning',
    };
  }
  return {
    id: 'momentum',
    icon: 'BarChart2',
    category: 'growth',
    headline: 'View counts are holding steady',
    detail: `Recent uploads performing within ${pct}% of earlier content — consistent but not growing.`,
    signal: 'neutral',
  };
}

// ── Insight 4 — Content Consistency ──────────────────────────
function insightConsistency(recentVideos: Video[]): Insight {
  const total = recentVideos.length;
  const hot = recentVideos.filter((v) => v.trendingScore > 70).length;
  const hotPct = total > 0 ? Math.round((hot / total) * 100) : 0;

  if (hotPct >= 60) {
    return {
      id: 'consistency',
      icon: 'Target',
      category: 'content',
      headline: 'Exceptionally consistent content quality',
      detail: `${hotPct}% of their recent uploads score as high performers — very reliable content engine.`,
      signal: 'positive',
    };
  }
  if (hotPct >= 30) {
    return {
      id: 'consistency',
      icon: 'Target',
      category: 'content',
      headline: 'Mixed content performance',
      detail: `Only ${hotPct}% of uploads hit high performance — some content lands, some doesn't.`,
      signal: 'neutral',
    };
  }
  return {
    id: 'consistency',
    icon: 'Target',
    category: 'content',
    headline: 'High variance in content performance',
    detail: `Only ${hotPct}% of recent uploads are high performers — their content strategy lacks consistency.`,
    signal: 'warning',
  };
}

// ── Insight 5 — Engagement Strength ──────────────────────────
function insightEngagement(recentVideos: Video[]): Insight {
  const avgRate = round1(avg(recentVideos.map((v) => v.engagementRate)));

  if (avgRate > 3.5) {
    return {
      id: 'engagement',
      icon: 'Users',
      category: 'engagement',
      headline: 'Exceptional audience engagement',
      detail: `${avgRate}% average engagement rate — significantly above the 3.5% YouTube benchmark for this content type.`,
      signal: 'positive',
    };
  }
  if (avgRate >= 2) {
    return {
      id: 'engagement',
      icon: 'Users',
      category: 'engagement',
      headline: 'Strong audience engagement',
      detail: `${avgRate}% average engagement rate — above the typical 2% benchmark, audience is actively responding.`,
      signal: 'positive',
    };
  }
  if (avgRate >= 1) {
    return {
      id: 'engagement',
      icon: 'Users',
      category: 'engagement',
      headline: 'Average audience engagement',
      detail: `${avgRate}% engagement rate — on par with platform average, room to improve audience interaction.`,
      signal: 'neutral',
    };
  }
  return {
    id: 'engagement',
    icon: 'Users',
    category: 'engagement',
    headline: 'Low audience engagement',
    detail: `Only ${avgRate}% engagement rate — audience is watching but not actively interacting with content.`,
    signal: 'warning',
  };
}

// ── Insight 6 — Title Pattern ─────────────────────────────────
function insightTitlePattern(tableVideos: Video[]): Insight {
  const top10 = [...tableVideos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  if (top10.length === 0) {
    return {
      id: 'title-pattern',
      icon: 'Type',
      category: 'content',
      headline: 'No dominant title pattern detected',
      detail: 'Top performing titles vary widely in structure — content quality appears to matter more than title format.',
      signal: 'neutral',
    };
  }

  // Pattern A: numbers / dollar amounts
  const withNumbers = top10.filter((v) => /[$\d]/.test(v.title)).length;
  if (withNumbers >= 6) {
    return {
      id: 'title-pattern',
      icon: 'Type',
      category: 'content',
      headline: 'Numbers dominate top-performing titles',
      detail: `${withNumbers} of their top 10 videos use numbers or dollar amounts in the title — a clear formula that works.`,
      signal: 'positive',
    };
  }

  // Pattern B: title length
  const avgWords = round1(avg(top10.map((v) => v.title.split(/\s+/).length)));
  if (avgWords < 5) {
    return {
      id: 'title-pattern',
      icon: 'Type',
      category: 'content',
      headline: 'Short punchy titles drive top views',
      detail: `Top 10 videos average just ${avgWords} words per title — brevity appears to be part of their formula.`,
      signal: 'positive',
    };
  }
  if (avgWords > 9) {
    return {
      id: 'title-pattern',
      icon: 'Type',
      category: 'content',
      headline: 'Detailed descriptive titles perform best',
      detail: `Top 10 videos average ${avgWords} words per title — their audience responds to specific, descriptive hooks.`,
      signal: 'neutral',
    };
  }

  // Pattern C: question titles
  const questions = top10.filter((v) => v.title.trim().endsWith('?')).length;
  if (questions >= 4) {
    return {
      id: 'title-pattern',
      icon: 'Type',
      category: 'content',
      headline: 'Question-format titles consistently perform',
      detail: `${questions} of their top 10 videos use question hooks — curiosity gap is a core part of their title strategy.`,
      signal: 'positive',
    };
  }

  // Default
  return {
    id: 'title-pattern',
    icon: 'Type',
    category: 'content',
    headline: 'No dominant title pattern detected',
    detail: 'Top performing titles vary widely in structure — content quality appears to matter more than title format.',
    signal: 'neutral',
  };
}

// ── Main export ──────────────────────────────────────────────
export function generateInsights(data: DashboardData): Insight[] {
  const { recentVideos, extendedVideos, tableVideos } = data;

  return [
    insightPostingCadence(extendedVideos),
    insightBestDay(extendedVideos),
    insightMomentum(recentVideos),
    insightConsistency(recentVideos),
    insightEngagement(recentVideos),
    insightTitlePattern(tableVideos),
  ];
}
