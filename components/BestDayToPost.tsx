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
    buckets[monFirst].sum += v.views; // use new field name
    buckets[monFirst].count += 1;
  });

  // Check minimum: at least 7 distinct days with data
  const daysWithData = buckets.filter((b) => b.count > 0).length;

  if (daysWithData < 7) {
    // Show chart with grey "No data" bars for empty days, but flag if too sparse
    // If fewer than 3 days have data at all, show empty state
    if (daysWithData < 3) {
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
    // Otherwise fall through with partial data + grey bars
  }

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

  // Build chart data: days with no uploads get avg=0 and noData=true
  const chartData = DAYS.map((day, i) => ({
    day,
    avg: buckets[i].count > 0 ? Math.round(buckets[i].sum / buckets[i].count) : 0,
    noData: buckets[i].count === 0,
    count: buckets[i].count,
  }));

  const maxAvg = Math.max(...chartData.filter((d) => !d.noData).map((d) => d.avg));
  const activeDays = chartData.filter((d) => !d.noData);
  const totalAvg =
    activeDays.length > 0
      ? activeDays.reduce((s, d) => s + d.avg, 0) / activeDays.length
      : 0;
  const bestDay = chartData.find((d) => d.avg === maxAvg && !d.noData);
  const pctAbove = totalAvg > 0 && bestDay
    ? Math.round(((maxAvg - totalAvg) / totalAvg) * 100)
    : 0;

  const insight =
    daysWithData < 7 ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-white/5">
        ⚠️ Insufficient history for all days
      </span>
    ) : bestDay ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/15">
        🏆 {bestDay.day} gets {pctAbove}% more views than avg
      </span>
    ) : null;

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
            formatter={(v, _name, props) => {
              if (props.payload?.noData) return ['No data', ''];
              return [formatNumber(Number(v)), 'Avg Views'];
            }}
            labelFormatter={(label, payload) => {
              const d = payload?.[0]?.payload;
              if (d?.noData) return `${label} — No uploads`;
              return `${label} (${d?.count ?? 0} upload${d?.count !== 1 ? 's' : ''})`;
            }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="avg" radius={[5, 5, 0, 0]} barSize={28} minPointSize={4}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.noData
                    ? '#27272A'           // grey — no uploads on this day
                    : entry.avg === maxAvg
                    ? '#3B82F6'           // blue — best day
                    : '#3F3F46'           // muted — other days
                }
                stroke={
                  entry.noData
                    ? 'transparent'
                    : entry.avg === maxAvg
                    ? '#60A5FA'
                    : 'transparent'
                }
                strokeWidth={1}
                fillOpacity={entry.noData ? 0.4 : 0.9}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
