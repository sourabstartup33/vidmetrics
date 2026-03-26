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
import { Video } from '@/types';
import { formatNumber } from '@/lib/utils';
import { ChartCard, EmptyChart } from './AreaChart';

interface BestDayToPostProps {
  videos: Video[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BestDayToPost({ videos }: BestDayToPostProps) {
  // Group views by day of week (0=Sun → remap to Mon=0)
  const buckets: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({
    sum: 0,
    count: 0,
  }));

  videos.forEach((v) => {
    const jsDay = new Date(v.publishedAt).getDay(); // 0=Sun
    const monFirst = (jsDay + 6) % 7; // remap: Mon=0…Sun=6
    buckets[monFirst].sum += v.viewCount;
    buckets[monFirst].count += 1;
  });

  const chartData = DAYS.map((day, i) => ({
    day,
    avg: buckets[i].count > 0 ? Math.round(buckets[i].sum / buckets[i].count) : 0,
  }));

  const hasData = chartData.some((d) => d.avg > 0);

  if (!hasData) {
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

  const maxAvg = Math.max(...chartData.map((d) => d.avg));
  const totalAvg = chartData.filter((d) => d.avg > 0).reduce((s, d) => s + d.avg, 0) /
    chartData.filter((d) => d.avg > 0).length;
  const bestDay = chartData.find((d) => d.avg === maxAvg)!;
  const pctAbove = totalAvg > 0 ? Math.round(((maxAvg - totalAvg) / totalAvg) * 100) : 0;

  const insight = (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/15">
      🏆 {bestDay.day} gets {pctAbove}% more views than avg
    </span>
  );

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
          <Tooltip
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
            }}
            itemStyle={{ color: '#E4E4E7' }}
            formatter={(v) => [formatNumber(Number(v)), 'Avg Views']}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="avg" radius={[5, 5, 0, 0]} barSize={28}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.avg === maxAvg ? '#3B82F6' : '#27272A'}
                stroke={entry.avg === maxAvg ? '#60A5FA' : 'transparent'}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
