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
import { Trophy } from 'lucide-react';
import { Video } from '@/types';
import { ChartCard, EmptyChart } from './ChartCard';

interface TopEngagementBarProps {
  videos: Video[];
}

function barColor(isTop: boolean) {
  return isTop ? '#6366F1' : '#27272A'; // active indigo vs inactive dark grey
}

export default function TopEngagementBar({ videos }: TopEngagementBarProps) {
  const top5 = [...videos]
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5);

  if (top5.length === 0) {
    return (
      <ChartCard
        title="Top 5 Videos by Engagement"
        subtitle="What content drives the most audience action?"
        insight={null}
      >
        <EmptyChart />
      </ChartCard>
    );
  }

  const chartData = top5.map((v) => ({
    name: v.title.length > 22 ? `${v.title.slice(0, 20)}…` : v.title,
    fullTitle: v.title,
    rate: v.engagementRate,
    trendingScore: v.trendingScore,
  }));

  const best = top5[0];
  const insight = (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">
      <Trophy className="w-3.5 h-3.5" />
      Best: {best.engagementRate}% engagement
    </span>
  );

  return (
    <ChartCard
      title="Top 5 Videos by Engagement"
      subtitle="What content drives the most audience action?"
      insight={insight}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
          barCategoryGap="20%"
        >
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#71717A' }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#D4D4D8', fontWeight: 500 }}
            width={110}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
            }}
            labelFormatter={(_, payload) => {
              const d = payload?.[0]?.payload;
              return <span className="text-xs text-zinc-400">{d?.fullTitle ?? ''}</span>;
            }}
            formatter={(v) => [`${v}%`, 'Engagement Rate']}
            itemStyle={{ color: '#E4E4E7' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={barColor(i === 0)} fillOpacity={1} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
