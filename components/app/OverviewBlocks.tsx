'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Channel, Video } from '@/types';
import { formatNumber, formatDate, calcChannelAvgViews } from '@/lib/utils';
import { computeBestDay, computeDayAverages, DAYS_SHORT, topByViews } from '@/lib/brief';
import { niceScale } from './UploadsChart';

// ── Thumbnail with an honest empty state ─────────────────────
export function VideoThumb({ video }: { video: Video }) {
  const [failed, setFailed] = useState(false);
  return video.thumbnailUrl && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={video.thumbnailUrl}
      alt=""
      className="app-thumb"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="app-thumb" aria-hidden="true" />
  );
}

// ── Figures: channel totals, then the range in view ──────────
export function KpiStrip({ channel, videos, rangeLabel }: { channel: Channel; videos: Video[]; rangeLabel: string }) {
  const n = videos.length;
  const avgViews = calcChannelAvgViews(videos);
  const avgEng = n ? videos.reduce((s, v) => s + v.engagementRate, 0) / n : 0;
  const cells = [
    { label: 'Subscribers', value: formatNumber(channel.subscribers), sub: 'Channel total' },
    { label: 'Total views', value: formatNumber(channel.totalViews), sub: `${channel.videoCount.toLocaleString('en-US')} videos` },
    { label: 'Uploads in view', value: String(n), sub: rangeLabel },
    { label: 'Average views', value: n ? formatNumber(avgViews) : '—', sub: 'Per upload in view' },
    { label: 'Average engagement', value: n ? `${avgEng.toFixed(2)}%` : '—', sub: 'Likes and comments over views' },
  ];
  return (
    <dl className="app-kpis">
      {cells.map(c => (
        <div key={c.label} className="app-kpi">
          <dt className="app-kpi__label">{c.label}</dt>
          <dd className="app-kpi__value">{c.value}</dd>
          <dd className="app-kpi__sub">{c.sub}</dd>
        </div>
      ))}
    </dl>
  );
}

export function KpiStripSkeleton() {
  return (
    <div className="app-kpis" aria-busy="true">
      {['Subscribers', 'Total views', 'Uploads in view', 'Average views', 'Average engagement'].map(l => (
        <div key={l} className="app-kpi">
          <p className="app-kpi__label">{l}</p>
          <p className="app-kpi__value"><span className="app-skel" style={{ width: 72, height: 24 }} /></p>
          <p className="app-kpi__sub"><span className="app-skel" style={{ width: 96, height: 12 }} /></p>
        </div>
      ))}
    </div>
  );
}

// ── Top uploads by views ─────────────────────────────────────
export function TopUploads({ videos }: { videos: Video[] }) {
  const top = topByViews(videos, 5);
  const avg = calcChannelAvgViews(videos);
  return (
    <section className="app-panel" aria-labelledby="top-uploads-title">
      <div className="app-panel__head" style={{ marginBottom: 4 }}>
        <div>
          <h2 id="top-uploads-title" className="app-panel__title">Top uploads</h2>
          <p className="app-panel__sub">By views, against their {formatNumber(avg)} average</p>
        </div>
        <a href="#uploads" className="app-link" style={{ fontSize: 13 }}>
          All {videos.length}
        </a>
      </div>
      {top.length === 0 ? (
        <p className="app-empty">No uploads in this range.</p>
      ) : (
        <ol className="app-list">
          {top.map(v => (
            <li key={v.id}>
              <a href={v.url} target="_blank" rel="noopener noreferrer" className="app-media-row">
                <VideoThumb video={v} />
                <span style={{ minWidth: 0 }}>
                  <span className="app-clip" style={{ display: 'block', fontWeight: 500 }}>{v.title}</span>
                  <span className="app-meta">{formatDate(v.publishedAt)}</span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  <span className="num" style={{ display: 'block', fontWeight: 600 }}>{formatNumber(v.views)}</span>
                  <span className="app-meta num">{avg ? `${(v.views / avg).toFixed(1)}× avg` : '—'}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ── Views by upload day ──────────────────────────────────────
export function ViewsByDay({ videos }: { videos: Video[] }) {
  const days = computeDayAverages(videos);
  const best = computeBestDay(videos);
  const data = days.map(d => ({
    day: DAYS_SHORT[d.day],
    avg: d.counted ? d.avg : 0,
    count: d.count,
    counted: d.counted,
    best: best ? d.day === best.index : false,
  }));
  const { top, ticks } = niceScale(Math.max(...data.map(d => d.avg), 0));

  return (
    <section className="app-panel" aria-labelledby="by-day-title">
      <div className="app-panel__head">
        <div>
          <h2 id="by-day-title" className="app-panel__title">Average views by upload day</h2>
          <p className="app-panel__sub">
            {best
              ? `${best.day}s lead, ${best.pct}% above their other posting days (${best.count} uploads)`
              : 'Too few uploads per weekday to compare days'}
          </p>
        </div>
      </div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--app-grid)" />
            <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#bdbdbd' }} tick={{ fontSize: 12, fill: 'var(--app-muted)' }} dy={4} />
            <YAxis
              domain={[0, top]}
              ticks={ticks}
              tickFormatter={n => formatNumber(Number(n))}
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fontSize: 12, fill: 'var(--app-muted)' }}
            />
            <Tooltip
              cursor={{ fill: 'rgb(0 0 0 / 0.04)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as (typeof data)[number];
                return (
                  <div className="app-tooltip">
                    <p style={{ fontWeight: 600 }}>{d.day}</p>
                    <p className="num">
                      {d.counted ? `${formatNumber(Math.round(d.avg))} average` : 'Not compared'} · {d.count} upload{d.count === 1 ? '' : 's'}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="avg" barSize={28} radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map(d => (
                <Cell key={d.day} fill={d.best ? 'var(--app-data)' : '#bcbcbc'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.some(d => !d.counted && d.count > 0) && (
        <p className="app-meta" style={{ marginTop: 8 }}>Days with one upload are left out of the comparison.</p>
      )}
    </section>
  );
}

// ── Engagement ranking: one figure per row ───────────────────
export function EngagementRanking({ videos }: { videos: Video[] }) {
  const n = videos.length;
  const avg = n ? videos.reduce((s, v) => s + v.engagementRate, 0) / n : 0;
  const top = [...videos].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 5);
  return (
    <section className="app-panel" aria-labelledby="engagement-title">
      <div className="app-panel__head">
        <div>
          <h2 id="engagement-title" className="app-panel__title">Most engaging uploads</h2>
          <p className="app-panel__sub">Likes and comments over views, against their {avg.toFixed(2)}% average</p>
        </div>
      </div>
      {top.length === 0 ? (
        <p className="app-empty">No uploads in this range.</p>
      ) : (
        <ol className="app-list">
          {top.map(v => {
            const diff = v.engagementRate - avg;
            return (
              <li key={v.id} style={{ padding: '11px 0' }}>
                <div className="app-title" style={{ alignItems: 'baseline', flexWrap: 'nowrap' }}>
                  <span className="app-clip" style={{ fontWeight: 500 }}>{v.title}</span>
                  <span className="num" style={{ flex: 'none', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600 }}>{v.engagementRate.toFixed(2)}%</span>
                    <span className="app-meta"> {diff >= 0 ? '+' : '−'}{Math.abs(diff).toFixed(2)} pts</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
