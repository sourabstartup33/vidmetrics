import { Video } from '@/types';
import { formatNumber } from '@/lib/utils';

interface QuickStatsProps {
  videos: Video[];
  loading: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  sublabel: string;
}

function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div
      className="bg-[#0A0A0A] rounded-xl p-5 border border-white/[0.08]"
      style={{ borderTop: '2px solid rgba(99,102,241,0.4)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-zinc-600 mt-1">{sublabel}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#0A0A0A] rounded-xl p-5 border border-white/[0.08] animate-pulse"
      style={{ borderTop: '2px solid rgba(99,102,241,0.15)' }}
    >
      <div className="h-2.5 w-24 bg-zinc-800 rounded mb-3" />
      <div className="h-7 w-20 bg-zinc-800 rounded mb-2" />
      <div className="h-2 w-32 bg-zinc-800/60 rounded" />
    </div>
  );
}

export default function QuickStats({ videos, loading }: QuickStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const count = videos.length;

  // Card 1: Avg views per video
  const avgViews = count > 0
    ? Math.round(videos.reduce((sum, v) => sum + v.views, 0) / count)
    : 0;

  // Card 2: Avg engagement rate
  const avgEngagement = count > 0
    ? videos.reduce((sum, v) => sum + v.engagementRate, 0) / count
    : 0;

  // Card 3: Videos published - count is already correct
  // Card 4: Hot content (trendingScore > 70)
  const hotCount = videos.filter((v) => v.trendingScore > 70).length;
  const hotPct = count > 0 ? Math.round((hotCount / count) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Avg Views / Video"
        value={count > 0 ? formatNumber(avgViews) : '—'}
        sublabel={`Based on ${count} video${count !== 1 ? 's' : ''}`}
      />
      <StatCard
        label="Avg Engagement Rate"
        value={count > 0 ? `${avgEngagement.toFixed(2)}%` : '—'}
        sublabel="Likes + comments / views"
      />
      <StatCard
        label="Videos Published"
        value={count > 0 ? String(count) : '—'}
        sublabel="Latest 20 uploads"
      />
      <StatCard
        label="Hot Content"
        value={count > 0 ? `${hotPct}%` : '—'}
        sublabel={`${hotCount} of ${count} videos`}
      />
    </div>
  );
}
