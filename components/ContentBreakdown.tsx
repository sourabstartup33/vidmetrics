'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Video } from '@/types';
import { ChartCard, EmptyChart } from './ChartCard';

interface ContentBreakdownProps {
  videos: Video[];
}

export default function ContentBreakdown({ videos }: ContentBreakdownProps) {
  if (videos.length === 0) {
    return (
      <ChartCard
        title="Content Performance Breakdown"
        subtitle="How consistent is their content quality?"
        insight={null}
      >
        <EmptyChart />
      </ChartCard>
    );
  }

  const hot  = videos.filter((v) => v.trendingScore > 70).length;
  const warm = videos.filter((v) => v.trendingScore >= 40 && v.trendingScore <= 70).length;
  const cold = videos.filter((v) => v.trendingScore < 40).length;
  const total = videos.length;

  const chartData = [
    { name: 'Hot',  value: hot,  color: '#22C55E' },
    { name: 'Warm', value: warm, color: '#F59E0B' },
    { name: 'Cold', value: cold, color: '#6B7280' },
  ].filter((d) => d.value > 0);

  const hotPct = total > 0 ? Math.round(((hot + warm) / total) * 100) : 0;
  const insight = (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
      {hotPct}% of content is high‑performing
    </span>
  );

  return (
    <ChartCard
      title="Content Performance Breakdown"
      subtitle="How consistent is their content quality?"
      insight={insight}
    >
      <div className="h-full flex flex-col items-center justify-center gap-3">
        {/* Donut */}
        <div className="relative w-full" style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={64}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                }}
                itemStyle={{ color: '#E4E4E7' }}
                formatter={(v, name) => [v, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-white leading-none">{total}</span>
            <span className="text-[10px] text-zinc-500 mt-1">videos</span>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Pill dotColor="bg-emerald-400" label="Hot"  count={hot}  color="text-emerald-400" />
          <Pill dotColor="bg-amber-400"   label="Warm" count={warm} color="text-amber-400" />
          <Pill dotColor="bg-zinc-400"    label="Cold" count={cold} color="text-zinc-400" />
        </div>
      </div>
    </ChartCard>
  );
}

function Pill({ dotColor, label, count, color }: { dotColor: string; label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className={`text-xs font-bold leading-none ${color}`}>{count}</span>
      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest leading-none">{label}</span>
    </div>
  );
}
