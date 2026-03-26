import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import TrendingBadge from './TrendingBadge';
import EngagementBadge from './EngagementBadge';
import { Video } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';

interface VideoTableProps {
  videos: Video[];
}

export default function VideoTable({ videos }: VideoTableProps) {
  return (
    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 shadow-sm overflow-hidden">
      {/* overflow-x-auto enables horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Thumbnail</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Views</th>
              <th className="px-6 py-4">Likes</th>
              <th className="px-6 py-4">Comments</th>
              <th className="px-6 py-4">Engagement Rate</th>
              <th className="px-6 py-4">Trending Score</th>
              <th className="px-6 py-4">Published</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {videos.map((video, index) => (
              <tr key={video.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-zinc-500">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="w-24 h-14 bg-zinc-800 rounded-md overflow-hidden relative">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-white line-clamp-2 max-w-xs">{video.title}</p>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-white">{formatNumber(video.viewCount)}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">{formatNumber(video.likeCount)}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">{formatNumber(video.commentCount)}</td>
                <td className="px-6 py-4">
                  <EngagementBadge rate={`${video.engagementRate}%`} />
                </td>
                <td className="px-6 py-4">
                  <TrendingBadge score={video.trendingScore} />
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500 whitespace-nowrap">{formatDate(video.publishedAt)}</td>
                <td className="px-6 py-4">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-500 hover:text-white transition-colors rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 inline-block"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/5">
        <p className="text-sm text-zinc-400">
          Showing <span className="font-medium text-white">{videos.length}</span> video{videos.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
