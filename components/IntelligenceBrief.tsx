'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Minus,
  Target,
  Activity,
  Heart,
  Eye,
  List,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Video, Insight } from '@/types';
import { formatNumber, parseDuration } from '@/lib/utils';
import { generateAISummary } from '@/lib/gemini';

interface IntelligenceBriefProps {
  recentVideos: Video[];     // last ~20 uploads, chronological
  extendedVideos: Video[];   // last ~50 uploads, chronological
  insights: Insight[];
  loading: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────

function avg(arr: number[]) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

// ── Signal badge ──────────────────────────────────────────────────

function SignalDot({ signal }: { signal: Insight['signal'] }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
      signal === 'positive' ? 'text-emerald-400' :
      signal === 'warning'  ? 'text-amber-400'   :
      'text-zinc-500'
    }`}>
      {signal === 'positive' ? <TrendingUp className="w-3 h-3" /> :
       signal === 'warning'  ? <AlertTriangle className="w-3 h-3" /> :
                               <Minus className="w-3 h-3" />}
      {signal === 'positive' ? 'Strong' : signal === 'warning' ? 'Watch' : 'Neutral'}
    </span>
  );
}

// ── Clean single-layer card ───────────────────────────────────────

function BriefCard({
  icon,
  title,
  signal,
  children,
  className = '',
}: {
  icon: React.ReactNode;
  title: string;
  signal?: Insight['signal'];
  children: React.ReactNode;
  className?: string;
}) {
  const topColor =
    signal === 'positive' ? 'rgba(52,211,153,0.45)' :
    signal === 'warning'  ? 'rgba(251,191,36,0.45)'  :
    'rgba(255,255,255,0.08)';

  return (
    <div
      className={`bg-[#0D0D0D] rounded-xl border border-white/[0.07] p-5 flex flex-col gap-4 ${className}`}
      style={{ borderTop: `2px solid ${topColor}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/[0.06] text-zinc-400 shrink-0">{icon}</div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{title}</p>
        </div>
        {signal && <SignalDot signal={signal} />}
      </div>
      <div className="flex flex-col gap-3 flex-1">{children}</div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────

function BriefSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] h-40" style={{ borderTop: '2px solid rgba(99,102,241,0.3)' }} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => <div key={i} className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] h-48" />)}
      </div>
      <div className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] h-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map(i => <div key={i} className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] h-64" />)}
      </div>
    </div>
  );
}

// ── What's Working helpers ────────────────────────────────────────

function computeBestDay(videos: Video[]) {
  const DAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const b: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));
  videos.forEach(v => { const d = new Date(v.publishedAt).getDay(); b[d].sum += v.views; b[d].count++; });
  const valid = b.map((x, i) => ({ i, avg: x.count >= 2 ? x.sum / x.count : 0, count: x.count })).filter(d => d.count >= 2);
  if (!valid.length) return null;
  const best   = valid.reduce((a, c) => c.avg > a.avg ? c : a);
  const overall = avg(valid.map(d => d.avg));
  const pct    = overall > 0 ? Math.round(((best.avg - overall) / overall) * 100) : 0;
  return { day: DAYS[best.i], short: SHORT[best.i], pct, count: best.count };
}

function computeWinningFormat(videos: Video[]) {
  const b: Record<string, { sum: number; count: number; label: string }> = {
    short:  { sum: 0, count: 0, label: 'Short  < 5 min' },
    medium: { sum: 0, count: 0, label: 'Medium 5–15 min' },
    long:   { sum: 0, count: 0, label: 'Long   > 15 min' },
  };
  videos.forEach(v => {
    const s   = parseDuration(v.duration);
    const key = s < 300 ? 'short' : s < 900 ? 'medium' : 'long';
    b[key].sum += v.views; b[key].count++;
  });
  const rows = Object.entries(b)
    .filter(([, x]) => x.count > 0)
    .map(([key, x]) => ({ key, label: x.label, avg: x.sum / x.count, count: x.count }))
    .sort((a, c) => c.avg - a.avg);
  return rows.length ? rows : null;
}

// ════════════════════════════════════════════════════════════════
// AUDIENCE SIGNALS — all computed from real data
// ════════════════════════════════════════════════════════════════

interface AudienceSignal {
  icon: React.ReactNode;
  title: string;
  value: string;
  desc: string;
}

function computeAudienceSignals(recentVideos: Video[], extendedVideos: Video[]): AudienceSignal[] {
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // ── SIGNAL 1: Engagement Type ────────────────────────────────
  const totalLikes    = recentVideos.reduce((s, v) => s + v.likes, 0);
  const totalComments = recentVideos.reduce((s, v) => s + v.comments, 0);
  const likeCommentRatio = totalComments > 0 ? round1(totalLikes / totalComments) : 0;

  let engType: AudienceSignal;
  if (likeCommentRatio > 20) {
    engType = {
      icon: <Heart className="w-5 h-5" />,
      title: 'Engagement Type',
      value: 'Passive Appreciators',
      desc: `${likeCommentRatio}:1 like-to-comment ratio — audience watches and likes but rarely discusses`,
    };
  } else if (likeCommentRatio >= 10) {
    engType = {
      icon: <Heart className="w-5 h-5" />,
      title: 'Engagement Type',
      value: 'Actively Engaged',
      desc: `${likeCommentRatio}:1 like-to-comment ratio — healthy mix of passive and active engagement`,
    };
  } else {
    engType = {
      icon: <Heart className="w-5 h-5" />,
      title: 'Engagement Type',
      value: 'Highly Vocal Community',
      desc: `${likeCommentRatio}:1 like-to-comment ratio — audience actively discusses content`,
    };
  }

  // ── SIGNAL 2: Content Appetite ───────────────────────────────
  const top10ByViews = [...recentVideos].sort((a, b) => b.views - a.views).slice(0, 10);
  const avgSeconds   = avg(top10ByViews.map(v => parseDuration(v.duration)));
  const avgMinutes   = round1(avgSeconds / 60);

  let appetite: AudienceSignal;
  if (avgMinutes < 5) {
    appetite = {
      icon: <List className="w-5 h-5" />,
      title: 'Content Appetite',
      value: 'Short-form Focused',
      desc: `Top videos average ${avgMinutes} min — audience prefers quick content`,
    };
  } else if (avgMinutes <= 15) {
    appetite = {
      icon: <List className="w-5 h-5" />,
      title: 'Content Appetite',
      value: 'Mid-length Content',
      desc: `Top videos average ${avgMinutes} min — audience commits to focused content`,
    };
  } else if (avgMinutes <= 30) {
    appetite = {
      icon: <List className="w-5 h-5" />,
      title: 'Content Appetite',
      value: 'Long-form Committed',
      desc: `Top videos average ${avgMinutes} min — audience invests in deep content`,
    };
  } else {
    appetite = {
      icon: <List className="w-5 h-5" />,
      title: 'Content Appetite',
      value: 'Deep-dive Audience',
      desc: `Top videos average ${avgMinutes} min — highly invested audience`,
    };
  }

  // ── SIGNAL 3: Viewer Type ────────────────────────────────────
  const SEO_KEYWORDS    = ['how to', 'best', 'review', 'vs', 'tutorial', 'guide', 'top', 'tips'];
  const VIRAL_KEYWORDS  = ['i ', 'we ', '$', '!', 'challenge', 'days', 'hours', 'last to'];

  let seoCount   = 0;
  let viralCount = 0;
  top10ByViews.forEach(v => {
    const t = v.title.toLowerCase();
    if (SEO_KEYWORDS.some(k => t.includes(k)))   seoCount++;
    if (VIRAL_KEYWORDS.some(k => t.includes(k))) viralCount++;
  });

  let viewerType: AudienceSignal;
  if (viralCount > seoCount) {
    viewerType = {
      icon: <Eye className="w-5 h-5" />,
      title: 'Viewer Type',
      value: 'Subscriber-driven',
      desc: `${viralCount} of top 10 titles use viral/personality hooks — audience follows the creator not the topic`,
    };
  } else if (seoCount > viralCount) {
    viewerType = {
      icon: <Eye className="w-5 h-5" />,
      title: 'Viewer Type',
      value: 'Search-driven',
      desc: `${seoCount} of top 10 titles use SEO patterns — audience discovers through search`,
    };
  } else {
    viewerType = {
      icon: <Eye className="w-5 h-5" />,
      title: 'Viewer Type',
      value: 'Mixed Discovery',
      desc: `Balanced mix of search and subscriber-driven content`,
    };
  }

  // ── SIGNAL 4: Peak Activity ───────────────────────────────────
  const b: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));
  extendedVideos.forEach(v => {
    const d = new Date(v.publishedAt).getDay();
    b[d].sum += v.views;
    b[d].count++;
  });
  const validDays = b.map((x, i) => ({ i, avg: x.count >= 2 ? x.sum / x.count : 0, count: x.count })).filter(d => d.count >= 2);

  let peakActivity: AudienceSignal;
  if (validDays.length > 0) {
    const best        = validDays.reduce((a, c) => c.avg > a.avg ? c : a);
    const overallAvg  = avg(validDays.map(d => d.avg));
    const pct         = overallAvg > 0 ? Math.round(((best.avg - overallAvg) / overallAvg) * 100) : 0;
    peakActivity = {
      icon: <Activity className="w-5 h-5" />,
      title: 'Peak Activity',
      value: `${DAYS[best.i]}s`,
      desc: `${pct}% above average — based on ${best.count} uploads on ${DAYS[best.i]}s`,
    };
  } else {
    peakActivity = {
      icon: <Activity className="w-5 h-5" />,
      title: 'Peak Activity',
      value: 'Insufficient data',
      desc: 'Not enough uploads per day to determine peak activity',
    };
  }

  return [engType, appetite, viewerType, peakActivity];
}

// ════════════════════════════════════════════════════════════════
// CONTENT GAPS — all computed from real data
// ════════════════════════════════════════════════════════════════

interface ContentGap {
  gap: string;
  detail: string;
  action: string;
}

function computeContentGaps(recentVideos: Video[], extendedVideos: Video[]): ContentGap[] {
  const gaps: ContentGap[] = [];

  // ── GAP 1: Upload Frequency ──────────────────────────────────
  const sorted = [...extendedVideos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  if (sorted.length >= 2) {
    const firstMs  = new Date(sorted[0].publishedAt).getTime();
    const lastMs   = new Date(sorted[sorted.length - 1].publishedAt).getTime();
    const spanDays = (lastMs - firstMs) / (1000 * 60 * 60 * 24);
    const avgDays  = Math.round(spanDays / (sorted.length - 1));

    if (avgDays > 14) {
      gaps.push({
        gap: 'Infrequent upload schedule',
        detail: `Uploads every ${avgDays} days on average — audience gaps create competitor opportunities`,
        action: `Post every ${Math.max(1, Math.round(avgDays / 2))} days or faster to fill their audience gap`,
      });
    } else if (avgDays >= 7) {
      gaps.push({
        gap: 'Weekly upload cadence',
        detail: `Uploads every ${avgDays} days — predictable but beatable with higher frequency`,
        action: `Match or exceed their ${avgDays} day cadence to stay competitive`,
      });
    } else {
      gaps.push({
        gap: 'High frequency posting',
        detail: `Uploads every ${avgDays} days — aggressive content velocity`,
        action: 'Compete on quality over quantity — they own frequency, you own depth',
      });
    }
  }

  // ── GAP 2: Worst Performing Day ──────────────────────────────
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dayBuckets: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));
  extendedVideos.forEach(v => {
    const d = new Date(v.publishedAt).getDay();
    dayBuckets[d].sum += v.views;
    dayBuckets[d].count++;
  });
  const validDayData = dayBuckets.map((x, i) => ({ i, avg: x.count >= 2 ? x.sum / x.count : 0, count: x.count })).filter(d => d.count >= 2);

  if (validDayData.length >= 2) {
    const worst      = validDayData.reduce((a, c) => c.avg < a.avg ? c : a);
    const overallAvg = avg(validDayData.map(d => d.avg));
    const pctBelow   = overallAvg > 0 ? Math.abs(Math.round(((worst.avg - overallAvg) / overallAvg) * 100)) : 0;
    gaps.push({
      gap: `Weak ${DAYS[worst.i]} performance`,
      detail: `${DAYS[worst.i]} uploads average ${pctBelow}% below their weekly average`,
      action: `Post on ${DAYS[worst.i]} to reach their audience when they underperform`,
    });
  } else {
    gaps.push({
      gap: 'Inconsistent day performance',
      detail: 'Not enough data to identify weakest posting day',
      action: 'Test different posting days and track performance vs their uploads',
    });
  }

  // ── GAP 3: Content Length Gap ────────────────────────────────
  const top20ByViews = [...recentVideos].sort((a, b) => b.views - a.views).slice(0, 20);
  const under10 = top20ByViews.filter(v => parseDuration(v.duration) < 600).length;
  const over10  = top20ByViews.filter(v => parseDuration(v.duration) >= 600).length;

  if (under10 < 3) {
    gaps.push({
      gap: 'Short-form content underutilized',
      detail: `Only ${under10} of top 20 videos are under 10 minutes`,
      action: 'Test short-form content to capture casual viewers they are missing',
    });
  } else if (over10 < 3) {
    gaps.push({
      gap: 'Long-form depth missing',
      detail: `Only ${over10} of top 20 videos exceed 10 minutes`,
      action: 'Test long-form content to build deeper audience loyalty',
    });
  } else {
    gaps.push({
      gap: 'No dominant format gap',
      detail: 'Mix of short and long content — gap is in consistency not format',
      action: 'Double down on whichever format gets highest engagement for them',
    });
  }

  // ── GAP 4: Engagement Rate Gap ───────────────────────────────
  const avgEngagement = round1(avg(recentVideos.map(v => v.engagementRate)));
  if (avgEngagement > 3.5) {
    gaps.push({
      gap: 'High engagement barrier to compete',
      detail: `${avgEngagement}% avg engagement — their audience is deeply loyal`,
      action: 'Target their non-subscriber audience through search and recommendations',
    });
  } else if (avgEngagement >= 2) {
    gaps.push({
      gap: 'Moderate engagement ceiling',
      detail: `${avgEngagement}% avg engagement — room to outperform on interaction`,
      action: 'Add CTAs and community features to drive higher engagement than theirs',
    });
  } else {
    gaps.push({
      gap: 'Low audience engagement',
      detail: `Only ${avgEngagement}% engagement — audience is passive`,
      action: 'Create more interactive content to build loyalty they are failing to capture',
    });
  }

  // ── GAP 5: Recent Performance Trend ─────────────────────────
  const byDate = [...recentVideos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  if (byDate.length >= 4) {
    const half    = Math.floor(byDate.length / 2);
    const oldHalf = byDate.slice(0, half);
    const newHalf = byDate.slice(byDate.length - half);
    const oldAvg  = avg(oldHalf.map(v => v.views));
    const newAvg  = avg(newHalf.map(v => v.views));
    const trend   = oldAvg > 0 ? Math.round(((newAvg - oldAvg) / oldAvg) * 100) : 0;

    if (trend < -10) {
      gaps.push({
        gap: 'Declining recent performance',
        detail: `Recent uploads averaging ${Math.abs(trend)}% fewer views than earlier content`,
        action: 'Their audience is ready for something new — this is your window to capture attention',
      });
    } else if (trend <= 10) {
      gaps.push({
        gap: 'Stagnant view growth',
        detail: `Recent uploads performing within ${Math.abs(trend)}% of older content — plateau`,
        action: 'Introduce a fresh format or topic angle while their growth stalls',
      });
    } else {
      gaps.push({
        gap: 'Accelerating competitor momentum',
        detail: `Recent uploads averaging ${trend}% more views — they are growing`,
        action: 'Act now before their momentum becomes harder to compete with',
      });
    }
  }

  return gaps;
}

// ════════════════════════════════════════════════════════════════
// Main export
// ════════════════════════════════════════════════════════════════

export default function IntelligenceBrief({ recentVideos, extendedVideos, insights, loading }: IntelligenceBriefProps) {
  const [aiText,    setAiText]    = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError,   setAiError]   = useState(false);
  const [aiTime,    setAiTime]    = useState<string>('');

  // Use recentVideos as "videos" for AI summary (backward compat)
  const fetchAI = useCallback(() => {
    if (!recentVideos.length || !insights.length) return;
    setAiLoading(true);
    setAiError(false);

    generateAISummary(recentVideos, insights)
      .then(text => {
        setAiText(text);
        setAiTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      })
      .catch(() => setAiError(true))
      .finally(() => setAiLoading(false));
  }, [recentVideos, insights]);

  useEffect(() => {
    fetchAI();
  }, [fetchAI]);

  if (loading || !recentVideos.length) return <BriefSkeleton />;

  // Pre-compute What's Working ─────────────────────────────────
  const bestDay = computeBestDay(extendedVideos.length ? extendedVideos : recentVideos);
  const format  = computeWinningFormat(recentVideos);
  const byId       = Object.fromEntries(insights.map(i => [i.id, i]));
  const titlePat   = byId['title-pattern'];

  // Audience Signals (fully data-driven) ───────────────────────
  const audienceSignals = computeAudienceSignals(recentVideos, extendedVideos.length ? extendedVideos : recentVideos);

  // Content Gaps (fully data-driven) ───────────────────────────
  const contentGaps = computeContentGaps(recentVideos, extendedVideos.length ? extendedVideos : recentVideos);

  const rawPoints = aiText ? aiText.split('\n').filter(p => p.trim().length > 0) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ══ SECTION 1: AI Strategic Summary ═════════════════════ */}
      <div
        className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] p-6 relative"
        style={{ borderTop: '2px solid rgba(99,102,241,0.45)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI Strategic Summary</p>
              {!aiLoading && (
                <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  Generated by AI • {aiTime}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={fetchAI}
            disabled={aiLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {aiLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800 mt-1.5 shrink-0" /><div className="h-4 bg-zinc-800 rounded w-full" /></div>
              <div className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800 mt-1.5 shrink-0" /><div className="h-4 bg-zinc-800 rounded w-[85%]" /></div>
              <div className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800 mt-1.5 shrink-0" /><div className="h-4 bg-zinc-800 rounded w-[90%]" /></div>
            </div>
          ) : aiError ? (
            <p className="text-sm text-zinc-400 italic">Unable to generate summary. Please check your data or API key.</p>
          ) : (
            rawPoints.map((p, idx) => {
              const cleanP = p.replace(/^[-•]\s*/, '').replace(/^\*\s+/, '');
              const strongMatch = cleanP.match(/^\*\*(.*?)\*\*(.*)/);

              if (strongMatch) {
                return (
                  <div key={idx} className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                    <div className="w-1 h-3.5 rounded-full bg-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <span className="text-white font-bold">{strongMatch[1]}</span>
                      {strongMatch[2]}
                    </p>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                  <div className="w-1 h-3.5 rounded-full bg-indigo-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-zinc-300 leading-relaxed">{cleanP}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══ SECTION 2: What's working ═══════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">What&apos;s Working</h3>
          <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full ml-2">Derived from top 10 videos by views</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Winning Format */}
          <BriefCard icon={<Clock className="w-4 h-4" />} title="Winning Format" signal={format ? 'positive' : 'neutral'}>
            {format ? (
              <>
                {format.map((r, i) => (
                  <div key={r.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs ${i === 0 ? 'text-white font-semibold' : 'text-zinc-400'}`}>{r.label}</span>
                      <span className={`text-xs tabular-nums font-semibold ${i === 0 ? 'text-white' : 'text-zinc-500'}`}>
                        {formatNumber(Math.round(r.avg))} avg
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${i === 0 ? 'bg-indigo-500' : 'bg-zinc-600'}`}
                        style={{ width: `${Math.min(100, (r.avg / format[0].avg) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-zinc-500 mt-2">Not enough duration data</p>
            )}
          </BriefCard>

          {/* Winning Hook */}
          <BriefCard icon={<Target className="w-4 h-4" />} title="Winning Hook" signal={titlePat?.signal ?? 'neutral'}>
            {titlePat ? (
              <>
                <p className="text-sm font-bold text-white leading-snug">{titlePat.headline}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{titlePat.detail}</p>
              </>
            ) : (
              <p className="text-sm text-zinc-500 mt-2">Pattern not clearly established</p>
            )}
          </BriefCard>

          {/* Best Time to Post */}
          <BriefCard icon={<Calendar className="w-4 h-4" />} title="Best Time to Post" signal={bestDay ? 'positive' : 'neutral'}>
            {bestDay ? (
              <>
                <div className="flex items-end gap-3 mb-1">
                  <p className="text-4xl font-black text-white tracking-tight">{bestDay.short}</p>
                  <p className={`text-sm font-bold mb-1 ${bestDay.pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {bestDay.pct >= 0 ? '+' : ''}{bestDay.pct}% views
                  </p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {bestDay.day} uploads average {Math.abs(bestDay.pct)}% {bestDay.pct >= 0 ? 'more' : 'fewer'} views.
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-500 mt-2">Not enough recurring day data</p>
            )}
          </BriefCard>
        </div>
      </div>

      {/* ══ SECTION 3: Audience Signals ═════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Audience Signals</h3>
          <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full ml-2">Calculated from real video data</span>
        </div>

        <div className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] p-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.05]">
          {audienceSignals.map((signal, idx) => (
            <div key={idx} className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="text-indigo-400/80">{signal.icon}</div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{signal.title}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white mb-1">{signal.value}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{signal.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 4: Content Gaps & Actions ════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Content Gaps &amp; Action List</h3>
          <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full ml-2">Calculated from upload history</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Content Gaps */}
          <BriefCard icon={<AlertCircle className="w-4 h-4" />} title="Identified Content Gaps" signal="warning">
            <div className="space-y-3 pt-1">
              {contentGaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                  <div className="w-5 h-5 rounded bg-amber-500/10 text-amber-500/80 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold leading-snug mb-0.5">{gap.gap}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{gap.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </BriefCard>

          {/* Action List */}
          <BriefCard icon={<CheckCircle2 className="w-4 h-4" />} title="Prioritized Actions" signal="positive">
            <div className="space-y-3 pt-1">
              {contentGaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                  <div className="w-5 h-5 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm text-white leading-relaxed">{gap.action}</p>
                </div>
              ))}
            </div>
          </BriefCard>
        </div>
      </div>

    </div>
  );
}
