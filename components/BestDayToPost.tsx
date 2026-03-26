'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Trophy, AlertTriangle } from 'lucide-react';
import { Video } from '@/types';
import { formatNumber } from '@/lib/utils';
import { ChartCard, EmptyChart } from './ChartCard';

interface BestDayToPostProps {
  videos: Video[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// A day is "valid" if it has ≥2 uploads; otherwise it's "insufficient"
const MIN_UPLOADS_FOR_VALID_DAY = 2;

export default function BestDayToPost({ videos }: BestDayToPostProps) {
  // Group views by day of week (0=Sun → remap to Mon=0)
  const buckets: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({
    sum: 0,
    count: 0,
  }));

  videos.forEach((v) => {
    const jsDay = new Date(v.publishedAt).getDay(); // 0=Sun
    const monFirst = (jsDay + 6) % 7; // remap: Mon=0…Sun=6
    buckets[monFirst].sum += v.views;
    buckets[monFirst].count += 1;
  });

  const hasAnyData = buckets.some((b) => b.count > 0);
  if (!hasAnyData) {
    return (
      <ChartCard
        title="Best Day to Post"
        subtitle="When does this competitor get maximum reach?"
        insight={null}
      >
        <EmptyChart />
      </ChartCard>
    );
  }

  // Build chart data with validity flag
  const chartData = DAYS.map((day, i) => ({
    day,
    dayFull: DAYS_FULL[i],
    avg: buckets[i].count > 0 ? Math.round(buckets[i].sum / buckets[i].count) : 0,
    count: buckets[i].count,
    noData: buckets[i].count === 0,                                     // zero uploads
    insufficient: buckets[i].count > 0 && buckets[i].count < MIN_UPLOADS_FOR_VALID_DAY, // 1 upload
    valid: buckets[i].count >= MIN_UPLOADS_FOR_VALID_DAY,               // 2+ uploads
  }));

  // Valid days only for max/avg calculation
  const validDays = chartData.filter((d) => d.valid);

  // Need at least 1 valid day to show the chart meaningfully
  if (validDays.length === 0) {
    return (
      <ChartCard
        title="Best Day to Post"
        subtitle="When does this competitor get maximum reach?"
        insight={null}
      >
        <EmptyChart />
      </ChartCard>
    );
  }

  const maxAvg = Math.max(...validDays.map((d) => d.avg));
  const totalAvg = validDays.reduce((s, d) => s + d.avg, 0) / validDays.length;
  const bestDay = validDays.find((d) => d.avg === maxAvg)!;
  const pctAbove = totalAvg > 0 ? Math.round(((maxAvg - totalAvg) / totalAvg) * 100) : 0;

  // Insufficient days = days with exactly 1 upload
  const insufficientDaysCount = chartData.filter((d) => d.insufficient).length;
  // Only warn if MORE THAN 2 days are insufficient
  const showWarning = insufficientDaysCount > 2;

  const insight = showWarning ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-white/5">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
      Some days need more upload history
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/15">
      <Trophy className="w-3.5 h-3.5" />
      {bestDay.day} gets {pctAbove}% more views than avg
    </span>
  );

  // Custom tooltip with context-aware messages
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: typeof chartData[0] }[];
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;

    if (d.noData) {
      return (
        <div style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px' }}>
          <p style={{ color: '#A1A1AA', fontSize: 11 }}>{d.dayFull}</p>
          <p style={{ color: '#71717A', fontSize: 12 }}>No uploads</p>
        </div>
      );
    }

    if (d.insufficient) {
      return (
        <div style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px' }}>
          <p style={{ color: '#A1A1AA', fontSize: 11 }}>{d.dayFull}</p>
          <p style={{ color: '#F59E0B', fontSize: 12 }}>Only 1 upload on {d.dayFull}s — not enough data</p>
        </div>
      );
    }

    return (
      <div style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px' }}>
        <p style={{ color: '#A1A1AA', fontSize: 11, marginBottom: 4 }}>{d.dayFull}</p>
        <p style={{ color: '#E4E4E7', fontSize: 13, fontWeight: 600 }}>
          Avg {formatNumber(d.avg)} views
        </p>
        <p style={{ color: '#71717A', fontSize: 11 }}>{d.count} upload{d.count !== 1 ? 's' : ''}</p>
      </div>
    );
  };

  return (
    <ChartCard
      title="Best Day to Post"
      subtitle="When does this competitor get maximum reach?"
      insight={insight}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          barCategoryGap="25%"
        >
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#71717A' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#71717A' }}
            tickFormatter={(v) => formatNumber(Number(v))}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="avg" radius={[5, 5, 0, 0]} barSize={28} minPointSize={4}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.noData        ? '#27272A'  // dark grey — no uploads
                  : entry.insufficient ? '#3F3F46'  // muted grey — 1 upload, insufficient
                  : entry.avg === maxAvg ? '#3B82F6' // blue — best valid day
                  : '#52525B'                        // normal valid day
                }
                fillOpacity={entry.noData ? 0.35 : entry.insufficient ? 0.5 : 0.9}
                stroke={entry.avg === maxAvg && entry.valid ? '#60A5FA' : 'transparent'}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
