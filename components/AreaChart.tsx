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
import { Video } from '@/types';
import { formatNumber } from '@/lib/utils';

interface ViewsOverTimeProps {
  videos: Video[];
}

function trendPill(data: { views: number }[]) {
  if (data.length < 3) return null;
  const first = data.slice(0, Math.ceil(data.length / 2));
  const last = data.slice(Math.ceil(data.length / 2));
  const avgFirst = first.reduce((s, d) => s + d.views, 0) / first.length;
  const avgLast = last.reduce((s, d) => s + d.views, 0) / last.length;
  const growing = avgLast > avgFirst;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        growing
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
          : 'bg-red-500/15 text-red-400 border border-red-500/20'
      }`}
    >
      {growing ? '📈 Growing' : '📉 Declining'}
    </span>
  );
}

export default function ViewsOverTime({ videos }: ViewsOverTimeProps) {
  const chartData = [...videos]
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
    .slice(-20)
    .map((v) => {
      const d = new Date(v.publishedAt);
      return {
        date: `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`,
        views: v.viewCount,
      };
    });

  const pill = trendPill(chartData);

  if (chartData.length < 2) {
    return (
      <ChartCard title="Views Over Time" subtitle="Is this competitor growing or declining?" insight={null}>
        <EmptyChart />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Views Over Time"
      subtitle="Is this competitor growing or declining?"
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
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#71717A' }}
            dy={8}
            interval="preserveStartEnd"
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
            labelStyle={{ color: '#A1A1AA', fontSize: 11 }}
            itemStyle={{ color: '#E4E4E7' }}
            formatter={(v) => [formatNumber(Number(v)), 'Views']}
          />
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

// ── Shared card shell ─────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  insight,
  children,
}: {
  title: string;
  subtitle: string;
  insight: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="h-52 w-full">{children}</div>
      <div className="flex items-center justify-between pt-1 border-t border-white/5 min-h-[28px]">
        <span className="text-xs text-zinc-600">Based on last 20 uploads</span>
        {insight}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center text-zinc-600 text-xs">
      Not enough data to render this chart
    </div>
  );
}

export { ChartCard, EmptyChart };
