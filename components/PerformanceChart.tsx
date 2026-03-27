'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Video } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';
import { BarChart2 } from 'lucide-react';

interface PerformanceChartProps {
  videos: Video[];
  loading: boolean;
}

type MetricType = 'views' | 'engagement' | 'trending';

const METRIC_CONFIG: Record<MetricType, { label: string; accessor: (v: Video) => number; format: (n: number) => string }> = {
  views: {
    label: 'Views',
    accessor: (v) => v.views,
    format: formatNumber,
  },
  engagement: {
    label: 'Engagement Rate',
    accessor: (v) => v.engagementRate,
    format: (n) => `${n.toFixed(2)}%`,
  },
  trending: {
    label: 'Trending Score',
    accessor: (v) => v.trendingScore,
    format: (n) => `${Math.round(n)}`,
  },
};

// Format ISO date as "MMM D"
function formatXTick(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: { payload: { title: string; publishedAt: string; metricValue: number } }[];
  metric: MetricType;
}) {
  if (!active || !payload?.length) return null;
  const { title, publishedAt, metricValue } = payload[0].payload;
  const truncatedTitle = title.length > 50 ? title.slice(0, 50) + '…' : title;
  
  return (
    <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-3 sm:p-4 shadow-2xl max-w-[240px] sm:max-w-[300px]">
      <div className="flex items-center gap-2 mb-1.5 justify-between">
        <p className="text-white text-base font-bold tracking-tight">
          {METRIC_CONFIG[metric].format(metricValue)}
        </p>
        <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded-sm">
          {METRIC_CONFIG[metric].label}
        </span>
      </div>
      <p className="text-zinc-300 text-sm mb-2 leading-snug">{truncatedTitle}</p>
      <p className="text-zinc-500 text-xs font-medium">{formatDate(publishedAt)}</p>
    </div>
  );
}

export default function PerformanceChart({ videos, loading }: PerformanceChartProps) {
  const [metric, setMetric] = useState<MetricType>('views');

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6 h-[340px] animate-shimmer">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-5 w-40 bg-zinc-800 rounded mb-2" />
            <div className="h-3 w-56 bg-zinc-800/60 rounded" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-7 w-20 bg-zinc-800 rounded-full" />)}
          </div>
        </div>
        <div className="h-52 bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="bg-[#0A0A0A] rounded-xl border border-white/10">
        <EmptyState
          icon={<BarChart2 className="w-8 h-8 opacity-60" />}
          title="No data to chart"
          message="No videos found in this time period"
        />
      </div>
    );
  }

  // Build per-video chart data, sorted chronologically
  const chartData = [...videos]
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
    .map((v) => ({
      date: formatXTick(v.publishedAt),
      publishedAt: v.publishedAt,
      title: v.title,
      metricValue: METRIC_CONFIG[metric].accessor(v),
    }));

  return (
    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-4 sm:p-6">
      {/* Header row — always stays in a single row, wraps gracefully */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-white">Performance Trends</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Latest 20 uploads · per-video data</p>
        </div>
        {/* Metric toggle */}
        <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-full px-1.5 py-1.5">
          {(Object.keys(METRIC_CONFIG) as MetricType[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                metric === m
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {METRIC_CONFIG[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="gPerf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#71717A' }}
              dy={8}
              interval={'preserveStartEnd'}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#71717A' }}
              tickFormatter={(v) => METRIC_CONFIG[metric].format(Number(v))}
              width={60}
            />
            <Tooltip content={<CustomTooltip metric={metric} />} />
            <Area
              type="monotone"
              dataKey="metricValue"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#gPerf)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366F1' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footnote */}
      <p className="mt-3 text-[11px] text-zinc-600">
        Based on video publish data — not channel-level analytics
      </p>
    </div>
  );
}
