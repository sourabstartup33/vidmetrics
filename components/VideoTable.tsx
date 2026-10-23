'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Download, ExternalLink } from 'lucide-react';
import { Video } from '@/types';
import { formatNumber, formatDate, parseDuration } from '@/lib/utils';
import { VideoThumb } from '@/components/app/OverviewBlocks';

interface VideoTableProps {
  videos: Video[];
  loading?: boolean;
  channelUrl?: string;
}

type SortColumn = 'views' | 'likes' | 'comments' | 'engagement' | 'trending' | 'published';

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'views', label: 'Views' },
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'trending', label: 'Trending' },
  { key: 'published', label: 'Published' },
];

// The trending band the product uses: over 70 high, 40 to 70 middle, under 40 low
function trendingColour(score: number) {
  return score > 70 ? 'var(--app-positive)' : score >= 40 ? '#b7791f' : 'var(--app-negative)';
}

function clock(iso: string) {
  const s = parseDuration(iso);
  if (!s) return '';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

function value(v: Video, key: SortColumn) {
  switch (key) {
    case 'views': return v.views;
    case 'likes': return v.likes;
    case 'comments': return v.comments;
    case 'engagement': return v.engagementRate;
    case 'trending': return v.trendingScore;
    default: return new Date(v.publishedAt).getTime();
  }
}

export default function VideoTable({ videos, loading = false, channelUrl }: VideoTableProps) {
  const [sort, setSort] = useState<{ key: SortColumn; dir: 'asc' | 'desc' }>({ key: 'published', dir: 'desc' });

  const sorted = useMemo(
    () => [...videos].sort((a, b) => (sort.dir === 'asc' ? value(a, sort.key) - value(b, sort.key) : value(b, sort.key) - value(a, sort.key))),
    [videos, sort],
  );

  const toggle = (key: SortColumn) =>
    setSort(cur => ({ key, dir: cur.key === key && cur.dir === 'desc' ? 'asc' : 'desc' }));

  const exportToCSV = () => {
    if (!videos.length) return;
    const headers = ['Title', 'URL', 'Published Date', 'Views', 'Likes', 'Comments', 'Engagement Rate (%)', 'Trending Score'];
    const rows = sorted.map(v => [
      `"${v.title.replace(/"/g, '""')}"`,
      v.url,
      v.publishedAt.split('T')[0],
      v.views,
      v.likes,
      v.comments,
      v.engagementRate,
      v.trendingScore,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `vidmetrics_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="app-panel" id="uploads" aria-labelledby="uploads-title" style={{ scrollMarginTop: 64 }}>
      <div className="app-panel__head">
        <div>
          <h2 id="uploads-title" className="app-panel__title">Latest uploads</h2>
          <p className="app-panel__sub">{videos.length} videos, newest first unless you sort</p>
        </div>
        <div className="app-title__actions">
          {channelUrl && (
            <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="app-button app-button--text">
              Open on YouTube
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
          <button type="button" className="app-button" onClick={exportToCSV} disabled={!videos.length}>
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="app-table-wrap">
        <table className="app-table" style={{ minWidth: 760 }}>
          <thead>
            <tr>
              <th scope="col" style={{ width: '40%' }}>Video</th>
              {COLUMNS.map(c => (
                <th
                  key={c.key}
                  scope="col"
                  className="num"
                  aria-sort={sort.key === c.key ? (sort.dir === 'desc' ? 'descending' : 'ascending') : undefined}
                >
                  <button type="button" onClick={() => toggle(c.key)}>
                    {c.label}
                    {sort.key === c.key &&
                      (sort.dir === 'desc' ? <ArrowDown className="w-3 h-3" aria-hidden="true" /> : <ArrowUp className="w-3 h-3" aria-hidden="true" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span className="app-thumb" />
                        <span className="app-skel" style={{ width: 220, height: 14 }} />
                      </div>
                    </td>
                    {COLUMNS.map(c => (
                      <td key={c.key} className="num"><span className="app-skel" style={{ width: 44, height: 14 }} /></td>
                    ))}
                  </tr>
                ))
              : sorted.map(v => (
                  <tr key={v.id}>
                    <td>
                      <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                        <VideoThumb video={v} />
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontWeight: 500 }} className="app-clip">{v.title}</span>
                          <span className="app-meta num">{clock(v.duration)}</span>
                        </span>
                      </a>
                    </td>
                    <td className="num" style={{ fontWeight: 600 }}>{formatNumber(v.views)}</td>
                    <td className="num">{formatNumber(v.likes)}</td>
                    <td className="num">{formatNumber(v.comments)}</td>
                    <td className="num">{v.engagementRate.toFixed(2)}%</td>
                    <td className="num">
                      <span className="app-dot" style={{ background: trendingColour(v.trendingScore) }} aria-hidden="true" />
                      {v.trendingScore}
                    </td>
                    <td className="num" style={{ whiteSpace: 'nowrap', color: 'var(--app-muted)' }}>{formatDate(v.publishedAt)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {/* Phone: two-line rows. Identity and views on line 1, every other field on line 2 */}
      {!loading && (
        <ol className="app-list app-phone-list">
          {sorted.map(v => (
            <li key={v.id}>
              <a href={v.url} target="_blank" rel="noopener noreferrer" className="app-media-row">
                <VideoThumb video={v} />
                <span style={{ minWidth: 0 }}>
                  <span className="app-clip" style={{ display: 'block', fontWeight: 500 }}>{v.title}</span>
                  <span className="app-meta num" style={{ display: 'block' }}>
                    {formatNumber(v.likes)} likes · {formatNumber(v.comments)} comments · {v.engagementRate.toFixed(2)}%
                  </span>
                  <span className="app-meta num" style={{ display: 'block' }}>
                    <span className="app-dot" style={{ background: trendingColour(v.trendingScore) }} aria-hidden="true" />
                    Trending {v.trendingScore} · {formatDate(v.publishedAt)}
                  </span>
                </span>
                <span className="num" style={{ fontWeight: 600, alignSelf: 'start' }}>{formatNumber(v.views)}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
      {!loading && videos.length === 0 && <p className="app-empty" style={{ marginTop: 8 }}>No uploads in this range.</p>}
    </section>
  );
}
