'use client';

import { useState, useEffect, useMemo } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Download } from 'lucide-react';
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
    <tr className="border-b border-white/5 animate-shimmer">
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

type SortColumn = 'views' | 'likes' | 'comments' | 'engagement' | 'trending' | 'published';

export default function VideoTable({ videos, loading = false, channelUrl }: VideoTableProps) {
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: 'asc' | 'desc' }>({
    key: 'published',
    direction: 'desc',
  });

  // Reset to page 1 whenever the dataset changes
  useEffect(() => { setPage(1); }, [videos]);

  const handleSort = (key: SortColumn) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortConfig.key) {
        case 'views':
          aVal = a.views; bVal = b.views; break;
        case 'likes':
          aVal = a.likes; bVal = b.likes; break;
        case 'comments':
          aVal = a.comments; bVal = b.comments; break;
        case 'engagement':
          aVal = a.engagementRate; bVal = b.engagementRate; break;
        case 'trending':
          aVal = a.trendingScore; bVal = b.trendingScore; break;
        case 'published':
        default:
          aVal = new Date(a.publishedAt).getTime();
          bVal = new Date(b.publishedAt).getTime();
          break;
      }

      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [videos, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedVideos.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, sortedVideos.length);
  const pageVideos = sortedVideos.slice(start, end);

  const exportToCSV = () => {
    if (videos.length === 0) return;
    
    // Create headers
    const headers = ['Title', 'URL', 'Published Date', 'Views', 'Likes', 'Comments', 'Engagement Rate (%)', 'Trending Score'];
    
    // Create rows
    const rows = sortedVideos.map(v => [
      `"${v.title.replace(/"/g, '""')}"`, // escape quotes in titles
      v.url,
      v.publishedAt.split('T')[0],
      v.views,
      v.likes,
      v.comments,
      v.engagementRate,
      v.trendingScore
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vidmetrics_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#111111] border-b border-white/10 text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              <th className="px-4 sm:px-6 py-4">#</th>
              <th className="px-4 sm:px-6 py-4">Thumbnail</th>
              <th className="px-4 sm:px-6 py-4">Title</th>
              
              <th 
                className="px-4 sm:px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                onClick={() => handleSort('views')}
              >
                <div className="flex items-center gap-1">Views {sortConfig.key === 'views' ? (sortConfig.direction === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />) : <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />}</div>
              </th>
              
              <th 
                className="px-4 sm:px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                onClick={() => handleSort('likes')}
              >
                <div className="flex items-center gap-1">Likes {sortConfig.key === 'likes' ? (sortConfig.direction === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />) : <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />}</div>
              </th>
              
              <th 
                className="px-4 sm:px-6 py-4 hidden sm:table-cell cursor-pointer hover:text-white transition-colors group"
                onClick={() => handleSort('comments')}
              >
                <div className="flex items-center gap-1">Comments {sortConfig.key === 'comments' ? (sortConfig.direction === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />) : <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />}</div>
              </th>
              
              <th 
                className="px-4 sm:px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                onClick={() => handleSort('engagement')}
              >
                <div className="flex items-center gap-1">Engagement {sortConfig.key === 'engagement' ? (sortConfig.direction === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />) : <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />}</div>
              </th>
              
              <th 
                className="px-4 sm:px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                onClick={() => handleSort('trending')}
              >
                <div className="flex items-center gap-1">Trending {sortConfig.key === 'trending' ? (sortConfig.direction === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />) : <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />}</div>
              </th>
              
              <th 
                className="px-4 sm:px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                onClick={() => handleSort('published')}
              >
                <div className="flex items-center gap-1">Published {sortConfig.key === 'published' ? (sortConfig.direction === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />) : <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />}</div>
              </th>
              
              <th className="px-4 sm:px-6 py-4">Watch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : pageVideos.map((video, index) => (
                  <tr key={video.id} className="hover:bg-white/5 transition-colors group border-b border-white/5">
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-zinc-500">{start + index + 1}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="w-16 h-10 sm:w-24 sm:h-14 bg-zinc-800 rounded-md overflow-hidden relative">
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
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-sm font-bold text-white line-clamp-2 max-w-xs">{video.title}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-white">{formatNumber(video.views)}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-zinc-400">{formatNumber(video.likes)}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-zinc-400 hidden sm:table-cell">{formatNumber(video.comments)}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <EngagementBadge rate={`${video.engagementRate}%`} />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <TrendingDot score={video.trendingScore} />
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-zinc-500 whitespace-nowrap">{formatDate(video.publishedAt)}</td>
                    <td className="px-4 sm:px-6 py-4">
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
      <div className="px-4 sm:px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between bg-[#0A0A0A] gap-4 flex-wrap">
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

        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={exportToCSV}
            disabled={videos.length === 0}
            className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          
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
    </div>
  );
}

