'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Video } from '@/types';
import { formatNumber } from '@/lib/utils';

// One bar per upload on a real time axis: a two-day gap and a three-week gap
// keep their true widths. The top upload carries the one data hue and its label.

type Metric = 'views' | 'engagement' | 'trending';

const METRICS: Record<Metric, { label: string; get: (v: Video) => number; fmt: (n: number) => string }> = {
  views: { label: 'Views', get: v => v.views, fmt: n => formatNumber(n) },
  engagement: { label: 'Engagement', get: v => v.engagementRate, fmt: n => `${n.toFixed(2)}%` },
  trending: { label: 'Trending score', get: v => v.trendingScore, fmt: n => `${Math.round(n)}` },
};

const DAY = 86_400_000;

// Round, even steps with the top tick above the maximum
export function niceScale(max: number) {
  if (max <= 0) return { top: 1, ticks: [0, 1] };
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) ?? 10 * mag;
  const top = Math.ceil((max * 1.04) / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= top + step / 2; t += step) ticks.push(Number(t.toFixed(6)));
  return { top, ticks };
}

function monthTicks(min: number, max: number) {
  const ticks: number[] = [];
  const d = new Date(min);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + 1);
  while (d.getTime() <= max) {
    ticks.push(d.getTime());
    d.setMonth(d.getMonth() + 1);
  }
  // 4 to 7 labels on one step
  const every = Math.ceil(ticks.length / 7) || 1;
  return ticks.filter((_, i) => i % every === 0);
}

interface Row {
  t: number;
  value: number;
  title: string;
  isTop: boolean;
}

function ChartTip({ active, payload, fmt }: { active?: boolean; payload?: { payload: Row }[]; fmt: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div className="app-tooltip">
      <p style={{ fontWeight: 600 }} className="num">{fmt(r.value)}</p>
      <p>{r.title}</p>
      <p className="app-meta">{new Date(r.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
    </div>
  );
}

export default function UploadsChart({ videos, rangeLabel }: { videos: Video[]; rangeLabel: string }) {
  const [metric, setMetric] = useState<Metric>('views');
  const m = METRICS[metric];

  const { rows, avg, scale, domain, ticks, top } = useMemo(() => {
    const rows: Row[] = [...videos]
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
      .map(v => ({ t: new Date(v.publishedAt).getTime(), value: m.get(v), title: v.title, isTop: false }));
    const best = rows.reduce<Row | null>((a, r) => (!a || r.value > a.value ? r : a), null);
    if (best) best.isTop = true;
    const avg = rows.length ? rows.reduce((s, r) => s + r.value, 0) / rows.length : 0;
    const min = rows.length ? rows[0].t : Date.now();
    const max = rows.length ? rows[rows.length - 1].t : Date.now();
    const pad = Math.max(2 * DAY, (max - min) * 0.03);
    return {
      rows,
      avg,
      scale: niceScale(best?.value ?? 0),
      domain: [min - pad, max + pad] as [number, number],
      ticks: monthTicks(min - pad, max + pad),
      top: best,
    };
  }, [videos, m]);

  const spanDays = (domain[1] - domain[0]) / DAY;
  // Bars stay readable for 20 uploads over months and for 5 over a week
  const barSize = Math.max(4, Math.min(18, Math.round(560 / Math.max(spanDays, rows.length * 2))));

  return (
    <section className="app-panel" aria-labelledby="uploads-chart-title">
      <div className="app-panel__head">
        <div>
          <h2 id="uploads-chart-title" className="app-panel__title">{m.label} per upload</h2>
          <p className="app-panel__sub">
            {rows.length} uploads, {rangeLabel.toLowerCase()} · dashed line is their average, {m.fmt(avg)}
          </p>
        </div>
        <div className="app-seg" role="group" aria-label="Metric">
          {(Object.keys(METRICS) as Metric[]).map(k => (
            <button key={k} type="button" aria-pressed={metric === k} onClick={() => setMetric(k)}>
              {METRICS[k].label}
            </button>
          ))}
        </div>
      </div>

      {top && (
        <p className="app-meta" style={{ marginBottom: 4 }}>
          <span className="app-dot" style={{ background: 'var(--app-data)' }} />
          Top upload: <span style={{ color: 'var(--app-text)', fontWeight: 500 }}>{top.title}</span>,{' '}
          <span className="num">{m.fmt(top.value)}</span>
        </p>
      )}

      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--app-grid)" />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={domain}
              ticks={ticks}
              tickFormatter={t => new Date(t).toLocaleDateString('en-US', { month: 'short' })}
              tick={{ fontSize: 12, fill: 'var(--app-muted)' }}
              tickLine={false}
              axisLine={{ stroke: '#bdbdbd' }}
              dy={4}
            />
            <YAxis
              domain={[0, scale.top]}
              ticks={scale.ticks}
              tickFormatter={n => m.fmt(Number(n))}
              tick={{ fontSize: 12, fill: 'var(--app-muted)' }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip content={<ChartTip fmt={m.fmt} />} cursor={{ fill: 'rgb(0 0 0 / 0.04)' }} />
            <ReferenceLine y={avg} stroke="var(--app-text)" strokeDasharray="4 3" strokeWidth={1} ifOverflow="extendDomain" />
            <Bar dataKey="value" barSize={barSize} radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {rows.map(r => (
                <Cell key={r.t} fill={r.isTop ? 'var(--app-data)' : '#bcbcbc'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
