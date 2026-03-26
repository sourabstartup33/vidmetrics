'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Video } from '@/types';
import { formatNumber } from '@/lib/utils';
import { ChartCard } from './ChartCard';

interface ViewsOverTimeProps {
  videos: Video[];
}

// ── Group videos by calendar month, sum views ────────────────
function buildMonthlyData(videos: Video[]) {
  const buckets: Record<string, { views: number; count: number; label: string; sortKey: string }> = {};

  videos.forEach((v) => {
    const d = new Date(v.publishedAt);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed
    const sortKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' }); // "Mar"
    const tooltipLabel = `${d.toLocaleString('default', { month: 'long' })} ${year}`; // "March 2025"

    if (!buckets[sortKey]) {
      buckets[sortKey] = { views: 0, count: 0, label, sortKey };
      (buckets[sortKey] as Record<string, unknown>)['tooltipLabel'] = tooltipLabel;
    }
    buckets[sortKey].views += v.views;
    buckets[sortKey].count += 1;
  });

  return Object.values(buckets)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map((b) => ({
      month: b.label,
      views: b.views,
      count: b.count,
      tooltipLabel: (b as Record<string, unknown>)['tooltipLabel'] as string,
    }));
}

function trendPill(data: { views: number }[]) {
  if (data.length < 2) return null;
  const mid = Math.ceil(data.length / 2);
  const first = data.slice(0, mid);
  const last = data.slice(mid);
  const avgFirst = first.reduce((s, d) => s + d.views, 0) / first.length;
  const avgLast = last.reduce((s, d) => s + d.views, 0) / last.length;
  const growing = avgLast > avgFirst;
  const Icon = growing ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        growing
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
          : 'bg-red-500/15 text-red-400 border border-red-500/20'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {growing ? 'Growing trend' : 'Declining trend'}
    </span>
  );
}

export default function ViewsOverTime({ videos }: ViewsOverTimeProps) {
  const chartData = buildMonthlyData(videos);
  const pill = trendPill(chartData);

  if (chartData.length < 3) {
    return (
      <ChartCard
        title="Views Over Time"
        subtitle="Monthly views across recent uploads"
        insight={null}
      >
        <div className="h-full flex items-center justify-center text-zinc-600 text-xs">
          Not enough upload history for monthly trend
        </div>
      </ChartCard>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number; payload: { tooltipLabel: string; count: number } }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    const { tooltipLabel, count } = payload[0].payload;
    const views = payload[0].value;
    return (
      <div
        style={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '8px 12px',
        }}
      >
        <p style={{ color: '#A1A1AA', fontSize: 11, marginBottom: 4 }}>{tooltipLabel}</p>
        <p style={{ color: '#E4E4E7', fontSize: 13, fontWeight: 600 }}>
          {formatNumber(views)} total views
        </p>
        <p style={{ color: '#71717A', fontSize: 11 }}>{count} video{count !== 1 ? 's' : ''}</p>
      </div>
    );
  };
  return (
    <ChartCard
      title="Views Over Time"
      subtitle="Monthly views across recent uploads"
      insight={pill}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#71717A' }}
            dy={8}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#71717A' }}
            tickFormatter={(v) => formatNumber(Number(v))}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#gViews)"
            dot={false}
            activeDot={{ r: 4, fill: '#6366F1' }}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
