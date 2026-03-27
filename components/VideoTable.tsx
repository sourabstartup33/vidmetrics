'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import EngagementBadge from './EngagementBadge';
import { Video } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';

const PAGE_SIZE = 10;

interface VideoTableProps {
  videos: Video[];
  loading?: boolean;
  channelUrl?: string;
}

function TrendingDot({ score }: { score: number }) {
  const color =
    score > 70 ? 'bg-emerald-400 text-emerald-400' :
    score >= 40 ? 'bg-amber-400 text-amber-400' :
    'bg-red-400 text-red-400';
  const dot =
    score > 70 ? 'bg-emerald-400' :
    score >= 40 ? 'bg-amber-400' :
    'bg-red-400';
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className={`text-sm font-semibold tabular-nums ${color.split(' ')[1]}`}>{score}</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5 animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-5 bg-zinc-800 rounded" /></td>
      <td className="px-6 py-4"><div className="w-24 h-14 bg-zinc-800 rounded-md" /></td>
      <td className="px-6 py-4">
        <div className="h-4 w-48 bg-zinc-800 rounded mb-1.5" />
        <div className="h-3 w-24 bg-zinc-800/60 rounded" />
      </td>
      <td className="px-6 py-4"><div className="h-4 w-14 bg-zinc-800 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-10 bg-zinc-800 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-10 bg-zinc-800 rounded" /></td>
      <td className="px-6 py-4"><div className="h-6 w-14 bg-zinc-800 rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-4 w-10 bg-zinc-800 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-800 rounded" /></td>
      <td className="px-6 py-4"><div className="h-6 w-6 bg-zinc-800 rounded" /></td>
    </tr>
  );
}

export default function VideoTable({ videos, loading = false, channelUrl }: VideoTableProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the dataset changes
  useEffect(() => { setPage(1); }, [videos]);

  const totalPages = Math.max(1, Math.ceil(videos.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, videos.length);
  const pageVideos = videos.slice(start, end);

  return (
    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#111111] border-b border-white/10 text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Thumbnail</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Views</th>
              <th className="px-6 py-4">Likes</th>
              <th className="px-6 py-4">Comments</th>
              <th className="px-6 py-4">Engagement</th>
              <th className="px-6 py-4">Trending</th>
              <th className="px-6 py-4">Published</th>
              <th className="px-6 py-4">Watch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : pageVideos.map((video, index) => (
                  <tr key={video.id} className="hover:bg-white/5 transition-colors group border-b border-white/5">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-500">{start + index + 1}</td>
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
                    <td className="px-6 py-4 text-sm font-medium text-white">{formatNumber(video.views)}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{formatNumber(video.likes)}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{formatNumber(video.comments)}</td>
                    <td className="px-6 py-4">
                      <EngagementBadge rate={`${video.engagementRate}%`} />
                    </td>
                    <td className="px-6 py-4">
                      <TrendingDot score={video.trendingScore} />
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 whitespace-nowrap">{formatDate(video.publishedAt)}</td>
                    <td className="px-6 py-4">
                      <a
                        href={video.url}
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

      {/* Footer: count + pagination */}
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-[#0A0A0A] gap-4 flex-wrap">
        <p className="text-sm text-zinc-500">
          Showing{' '}
          <span className="font-semibold text-white">{videos.length > 0 ? start + 1 : 0}–{end}</span>
          {' '}of{' '}
          <span className="font-semibold text-white">{videos.length}</span> video{videos.length !== 1 ? 's' : ''}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-zinc-400 tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {channelUrl && (
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            See All on YouTube
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

