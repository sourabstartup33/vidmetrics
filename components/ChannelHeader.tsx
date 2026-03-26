import { BadgeCheck } from 'lucide-react';
import MetricCard from './MetricCard';
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
    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6 shadow-sm mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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
            <h1 className="text-2xl font-extrabold text-white">{channel.title}</h1>
            <BadgeCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-zinc-400 font-medium">{channel.handle}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
        <MetricCard title="Subscribers" value={formatNumber(channel.subscriberCount)} />
        <MetricCard title="Total Views" value={formatNumber(channel.viewCount)} />
        <MetricCard title="Videos" value={formatNumber(channel.videoCount)} />
        <MetricCard
          title="Est. Monthly Views"
          value={formatNumber(Math.round(channel.viewCount / monthsActive))}
        />
      </div>
    </div>
  );
}
