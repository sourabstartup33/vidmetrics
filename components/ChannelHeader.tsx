import { Verified } from 'lucide-react'; // use Verified instead of BadgeCheck to match standard styling, and we inline MetricCard here
import { Channel } from '@/types';
import { formatNumber } from '@/lib/utils';

interface ChannelHeaderProps {
  channel: Channel;
}

export default function ChannelHeader({ channel }: ChannelHeaderProps) {
  const monthsActive = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(channel.publishedAt).getTime()) /
        (30 * 24 * 60 * 60 * 1000),
    ),
  );

  return (
    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 border-t-indigo-500/40 p-4 sm:p-6 shadow-sm mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
      {/* Subtle background glow behind avatar */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 p-1 shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={channel.thumbnailUrl}
              alt={channel.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{channel.title}</h1>
            <Verified className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
          </div>
          <p className="text-zinc-400 font-medium">{channel.handle}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:flex lg:flex-row gap-4 w-full lg:w-auto relative z-10">
        <ChannelMetric title="Subscribers" value={formatNumber(channel.subscriberCount)} />
        <ChannelMetric title="Total Views" value={formatNumber(channel.viewCount)} />
        <ChannelMetric title="Videos" value={formatNumber(channel.videoCount)} />
        <ChannelMetric
          title="Est. Monthly Views"
          value={formatNumber(Math.round(channel.viewCount / monthsActive))}
        />
      </div>
    </div>
  );
}

function ChannelMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#111111] rounded-lg border border-white/5 border-l-[3px] border-l-indigo-500/50 p-3 sm:p-4">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">{title}</div>
      <div className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight">{value}</div>
    </div>
  );
}
