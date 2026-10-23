'use client';

import { useMemo, useState } from 'react';
import { Video } from '@/types';
import { calcEngagement, calcTrendingScore, formatNumber } from '@/lib/utils';
import { Thumb } from './Fragments';

// The product's real scoring formula, operated by the reader.
const AGES = [
  { key: '3d', label: '3 days ago', days: 3 },
  { key: '3w', label: '3 weeks ago', days: 21 },
  { key: '3m', label: '3 months ago', days: 90 },
] as const;

const DAY = 24 * 60 * 60 * 1000;

export default function ScoreLab({ avgViews, asOf }: { avgViews: number; asOf: string }) {
  const [views, setViews] = useState(52_000_000);
  const [likes, setLikes] = useState(1_900_000);
  const [comments, setComments] = useState(88_000);
  const [age, setAge] = useState<(typeof AGES)[number]['key']>('3w');

  const now = new Date(asOf).getTime();
  const days = AGES.find(a => a.key === age)!.days;

  const result = useMemo(() => {
    const engagementRate = calcEngagement(likes, comments, views);
    const publishedAt = new Date(now - days * DAY).toISOString();
    const score = calcTrendingScore({ views, engagementRate, publishedAt } as Video, avgViews, now);
    const base = Math.min((engagementRate / 10) * 65, 65);
    return {
      engagementRate,
      publishedAt,
      score,
      parts: [
        { label: 'Engagement', value: base, max: 65 },
        { label: 'Fresh upload', value: days <= 30 ? 20 : 0, max: 20 },
        { label: 'Beats the average', value: views > avgViews ? 15 : 0, max: 15 },
      ],
    };
  }, [views, likes, comments, days, avgViews, now]);

  const downloadRow = () => {
    const headers = ['Title', 'Published Date', 'Views', 'Likes', 'Comments', 'Engagement Rate (%)', 'Trending Score'];
    const row = ['"Your next upload"', result.publishedAt.split('T')[0], views, likes, comments, result.engagementRate, result.score];
    const blob = new Blob([`${headers.join(',')}\n${row.join(',')}\n`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vidmetrics_score.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      className="lp-field lp-grid lp-score"
      id="score"
      aria-labelledby="score-title"
      data-chapter-bg="var(--pink)"
      data-chapter-ink="var(--ink)"
    >
      <h2 id="score-title" className="lp-head lp-score__title" data-reveal>Score a video</h2>

      <div className="lp-score__stage">
        <div data-ui className="ui-pad" style={{ width: 'min(400px, 100%)' }} aria-live="polite">
          <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', gap: 12, alignItems: 'center' }}>
            <Thumb title="Your next upload" index={1} small />
            <div>
              <p className="ui-title">Your next upload</p>
              <p className="ui-meta num">
                {formatNumber(views)} views · {AGES.find(a => a.key === age)!.label}
              </p>
            </div>
          </div>
          <div className="ui-rule" style={{ margin: '16px 0' }} />
          <div className="ui-row" style={{ alignItems: 'flex-end' }}>
            <div>
              <p className="ui-meta">Trending score</p>
              <p className="num ui-score" style={{ fontSize: 40, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {result.score}
                <span className="ui-meta" style={{ fontSize: 14 }}> /100</span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="ui-meta">Engagement</p>
              <p className="num" style={{ fontSize: 18, fontWeight: 600 }}>{result.engagementRate.toFixed(2)}%</p>
            </div>
          </div>
          <div className="ui-bar" style={{ marginTop: 14, height: 10 }}>
            <span className="is-lead" style={{ width: `${result.score}%`, transition: 'width 240ms var(--ease-out)' }} />
          </div>
          <div className="ui-row ui-meta num" style={{ marginTop: 6 }}>
            <span>0</span>
            <span>100</span>
          </div>
          <ul style={{ marginTop: 12 }}>
            {result.parts.map((p, i) => (
              <li key={p.label} className="ui-row" style={{ padding: '7px 0', borderTop: i ? '1px solid var(--app-rule)' : undefined }}>
                <span style={{ color: p.value ? 'var(--app-text)' : 'var(--app-muted)' }}>{p.label}</span>
                <span className="num">
                  <span style={{ fontWeight: 600 }}>{p.value ? `+${p.value.toFixed(p.max === 65 ? 1 : 0)}` : '0'}</span>
                  <span className="ui-meta"> of {p.max}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lp-score__copy">
        <div className="lp-score__block" data-reveal>
          <p className="lp-lead">Views are measured against the channel.</p>
          <p className="lp-body">
            Every video is compared with the average of the channel&rsquo;s latest uploads,{' '}
            {formatNumber(avgViews)} for the sample channel. Beat it and the score gains 15 points.
          </p>
          <label className="lp-control">
            <span className="lp-control__row">
              <span>Views</span>
              <span className="num">{formatNumber(views)}</span>
            </span>
            <input
              type="range"
              min={1_000_000}
              max={120_000_000}
              step={500_000}
              value={views}
              onChange={e => setViews(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="lp-score__block" data-reveal>
          <p className="lp-lead">Engagement is likes and comments over views.</p>
          <p className="lp-body">
            The rate turns into up to 65 points, and a video at 10% engagement earns all of them. VidMetrics
            counts 2% as typical and 3.5% as strong.
          </p>
          <label className="lp-control">
            <span className="lp-control__row">
              <span>Likes</span>
              <span className="num">{formatNumber(likes)}</span>
            </span>
            <input type="range" min={0} max={8_000_000} step={50_000} value={likes} onChange={e => setLikes(Number(e.target.value))} />
          </label>
          <label className="lp-control">
            <span className="lp-control__row">
              <span>Comments</span>
              <span className="num">{formatNumber(comments)}</span>
            </span>
            <input type="range" min={0} max={400_000} step={2_000} value={comments} onChange={e => setComments(Number(e.target.value))} />
          </label>
        </div>

        <div className="lp-score__block" data-reveal>
          <p className="lp-lead">New uploads get a head start.</p>
          <p className="lp-body">A video published in the last 30 days earns 20 points while it is fresh.</p>
          <div className="lp-control">
            <span id="age-label">Published</span>
            <div className="lp-segmented" role="group" aria-labelledby="age-label">
              {AGES.map(a => (
                <button key={a.key} type="button" aria-pressed={age === a.key} onClick={() => setAge(a.key)}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-score__block" data-reveal>
          <p className="lp-lead">Then it goes in the export.</p>
          <p className="lp-body">
            Every score lands in the video table and in the CSV, beside its views, likes, comments and engagement.
          </p>
          <div>
            <button type="button" className="lp-button lp-button--ghost" onClick={downloadRow}>
              Download this video as CSV
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
