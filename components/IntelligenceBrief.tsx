'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  TrendingDown,
  Minus,
  Zap,
  Clock,
  Users,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
} from 'lucide-react';
import { Video, Insight } from '@/types';
import { formatNumber, parseDuration } from '@/lib/utils';
import { generateAISummary } from '@/lib/gemini';

interface IntelligenceBriefProps {
  videos: Video[];
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
}: {
  icon: React.ReactNode;
  title: string;
  signal?: Insight['signal'];
  children: React.ReactNode;
}) {
  const topColor =
    signal === 'positive' ? 'rgba(52,211,153,0.45)' :
    signal === 'warning'  ? 'rgba(251,191,36,0.45)'  :
    'rgba(255,255,255,0.08)';

  return (
    <div
      className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] p-5 flex flex-col gap-4"
      style={{ borderTop: `2px solid ${topColor}` }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/[0.06] text-zinc-400 shrink-0">{icon}</div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{title}</p>
        </div>
        {signal && <SignalDot signal={signal} />}
      </div>
      {/* Card body */}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────

function BriefSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] h-28" style={{ borderTop: '2px solid rgba(99,102,241,0.3)' }} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => <div key={i} className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] h-44" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2].map(i => <div key={i} className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] h-56" />)}
      </div>
    </div>
  );
}

// ── Analysis helpers ──────────────────────────────────────────────

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

function computeCadence(videos: Video[]) {
  const sorted = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  if (sorted.length < 2) return null;
  const span = new Date(sorted[sorted.length - 1].publishedAt).getTime() - new Date(sorted[0].publishedAt).getTime();
  return round1((span / (1000 * 60 * 60 * 24)) / (sorted.length - 1));
}

function computeEngagement(videos: Video[]) {
  return {
    avgEng:      round1(avg(videos.map(v => v.engagementRate))),
    likeRatio:   round1(avg(videos.map(v => v.views > 0 ? (v.likes   / v.views) * 100 : 0))),
    commentRatio: round1(avg(videos.map(v => v.views > 0 ? (v.comments / v.views) * 100 : 0))),
    top: [...videos].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 3),
  };
}

// ════════════════════════════════════════════════════════════════
// Main export
// ════════════════════════════════════════════════════════════════

export default function IntelligenceBrief({ videos, insights, loading }: IntelligenceBriefProps) {
  const [aiText,    setAiText]    = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError,   setAiError]   = useState(false);

  useEffect(() => {
    if (!videos.length || !insights.length) return;
    setAiLoading(true);
    setAiError(false);
    setAiText(null);
    generateAISummary(videos, insights)
      .then(setAiText)
      .catch(() => setAiError(true))
      .finally(() => setAiLoading(false));
  }, [videos, insights]);

  if (loading || !videos.length) return <BriefSkeleton />;

  // Pre-compute everything ──────────────────────────────────────
  const byId       = Object.fromEntries(insights.map(i => [i.id, i]));
  const momentum   = byId['momentum'];
  const consistency = byId['consistency'];
  const engagement = byId['engagement'];
  const titlePat   = byId['title-pattern'];
  const bestDayIns = byId['best-day'];

  const bestDay = computeBestDay(videos);
  const format  = computeWinningFormat(videos);
  const cadence = computeCadence(videos);
  const eng     = computeEngagement(videos);

  // Action list ────────────────────────────────────────────────
  const actions: string[] = [];
  if (bestDay)                       actions.push(`Post on ${bestDay.day}s — they average ${bestDay.pct > 0 ? '+' : ''}${bestDay.pct}% views vs other days`);
  if (format?.[0])                   actions.push(`Lean into ${format[0].label.toLowerCase()} — best avg views (${formatNumber(Math.round(format[0].avg))})`);
  if (byId['cadence']?.signal === 'warning') actions.push('Upload more consistently — irregular schedule limits algorithm reach');
  if (engagement?.signal === 'warning')       actions.push('Boost engagement: add clear CTAs for likes and comments');
  if (titlePat?.signal === 'positive')        actions.push(titlePat.headline);
  if (momentum?.signal === 'warning')         actions.push('View momentum declining — try a new format or topic angle');
  if (!actions.length)               actions.push('Performance is strong — maintain current strategy');

  // AI fallback text ───────────────────────────────────────────
  const fallbackText = momentum?.detail ?? consistency?.detail ?? engagement?.detail ??
    'Review the analysis panels below for actionable insights on this channel.';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">

      {/* ══ AI Strategic Summary ══════════════════════════════ */}
      <div
        className="bg-[#0D0D0D] rounded-xl border border-white/[0.07] p-6"
        style={{ borderTop: '2px solid rgba(99,102,241,0.45)' }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-300">AI Strategic Summary</p>
          {aiLoading && (
            <span className="ml-auto flex items-center gap-1.5 text-[10px] text-indigo-400 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Generating with Gemini…
            </span>
          )}
        </div>

        {/* Shimmer while loading */}
        {aiLoading && (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-3.5 bg-zinc-800 rounded w-full" />
            <div className="h-3.5 bg-zinc-800 rounded w-[85%]" />
            <div className="h-3.5 bg-zinc-800 rounded w-[65%]" />
          </div>
        )}

        {/* AI result */}
        {!aiLoading && aiText && (
          <p className="text-sm text-white leading-relaxed">{aiText}</p>
        )}

        {/* Fallback */}
        {!aiLoading && aiError && (
          <p className="text-sm text-zinc-300 leading-relaxed">{fallbackText}</p>
        )}
      </div>

      {/* ══ Row 2: What's working ████████████████████████████ */}
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
                  {i === 0 && <p className="text-[10px] text-zinc-500 mt-1">{r.count} video{r.count !== 1 ? 's' : ''} in this format</p>}
                </div>
              ))}
              <p className="text-[10px] text-zinc-500 border-t border-white/5 pt-2 mt-1">Avg views per video by length</p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Not enough duration data</p>
          )}
        </BriefCard>

        {/* Title Formula */}
        <BriefCard icon={<BookOpen className="w-4 h-4" />} title="Title Formula" signal={titlePat?.signal ?? 'neutral'}>
          {titlePat ? (
            <>
              <p className="text-sm font-bold text-white leading-snug">{titlePat.headline}</p>
              <p className="text-xs text-zinc-300 leading-relaxed">{titlePat.detail}</p>
              <div className="border-t border-white/5 pt-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Recent titles</p>
                {videos.slice(0, 3).map(v => (
                  <p key={v.id} className="text-[11px] text-zinc-400 line-clamp-1 pl-2 border-l-2 border-zinc-600">{v.title}</p>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Not enough data to detect a pattern</p>
          )}
        </BriefCard>

        {/* Best Day to Post */}
        <BriefCard icon={<Calendar className="w-4 h-4" />} title="Best Day to Post" signal={bestDay ? 'positive' : 'neutral'}>
          {bestDay ? (
            <>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-black text-white tracking-tight">{bestDay.short}</p>
                <p className={`text-sm font-bold mb-1 ${bestDay.pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {bestDay.pct >= 0 ? '+' : ''}{bestDay.pct}% views
                </p>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {bestDay.day} uploads average {Math.abs(bestDay.pct)}% {bestDay.pct >= 0 ? 'more' : 'fewer'} views
                than other days — based on {bestDay.count} upload{bestDay.count !== 1 ? 's' : ''}.
              </p>
              {bestDayIns?.detail && (
                <p className="text-[10px] text-zinc-500 leading-relaxed border-t border-white/5 pt-2 italic">
                  {bestDayIns.detail}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500">Not enough recurring day data (need ≥ 2 uploads per day)</p>
          )}
        </BriefCard>

      </div>

      {/* ══ Row 3: Audience + Actions ████████████████████████ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Audience Signals */}
        <BriefCard icon={<Users className="w-4 h-4" />} title="Audience Signals" signal={engagement?.signal ?? 'neutral'}>
          {/* 3 stat pills */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Engagement', value: `${eng.avgEng}%` },
              { label: 'Like rate',  value: `${eng.likeRatio}%` },
              { label: 'Comment rate', value: `${eng.commentRatio}%` },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center justify-center bg-black/30 rounded-lg py-3 border border-white/[0.05]">
                <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
                <p className="text-[10px] text-zinc-400 mt-1 text-center leading-3">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Top 3 by engagement */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Highest Engagement</p>
            {eng.top.map(v => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0 gap-3">
                <p className="text-xs text-zinc-300 line-clamp-1 flex-1">{v.title}</p>
                <span className="text-xs font-bold text-emerald-400 tabular-nums shrink-0">{v.engagementRate.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </BriefCard>

        {/* Action List */}
        <BriefCard icon={<Lightbulb className="w-4 h-4" />} title="Action List" signal="positive">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 -mt-1">
            Based on latest {videos.length} uploads
          </p>
          <div className="space-y-2.5">
            {actions.slice(0, 5).map((action, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-white leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
          {cadence !== null && (
            <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05] mt-1">
              <Info className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <p className="text-[11px] text-zinc-400">
                Upload cadence: every ~{cadence} days
              </p>
            </div>
          )}
        </BriefCard>

      </div>
    </div>
  );
}
