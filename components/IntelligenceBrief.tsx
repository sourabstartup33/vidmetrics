'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Video, Insight } from '@/types';
import { formatNumber, parseDuration } from '@/lib/utils';
import { generateAISummary } from '@/lib/gemini';
import {
  computeAudienceSignals,
  computeBestDay,
  computeDayAverages,
  DAYS_SHORT,
  computeContentGaps,
  computeWinningFormat,
  hasNumberHook,
  topByViews,
} from '@/lib/brief';

interface IntelligenceBriefProps {
  recentVideos: Video[];     // last ~20 uploads, chronological
  extendedVideos: Video[];   // last ~50 uploads, chronological
  insights: Insight[];
  loading: boolean;
}

function aiErrorMessage(message: string) {
  if (message === 'GEMINI_KEY_MISSING') return 'The AI summary is off: no Gemini API key is set for this deployment.';
  return `The AI summary could not be generated (${message}).`;
}

// ── AI summary: three short points ───────────────────────────
function AiSummary({ recentVideos, insights }: { recentVideos: Video[]; insights: Insight[] }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [at, setAt] = useState('');

  const run = useCallback(() => {
    if (!recentVideos.length || !insights.length) return;
    setLoading(true);
    setError(null);
    generateAISummary(recentVideos, insights)
      .then(t => {
        setText(t);
        setAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      })
      .catch(e => setError(e instanceof Error ? e.message : 'UNKNOWN'))
      .finally(() => setLoading(false));
  }, [recentVideos, insights]);

  useEffect(() => {
    run();
  }, [run]);

  const points = (text ?? '')
    .split('\n')
    .map(p => p.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
    .map(p => {
      const m = p.match(/^\*\*(.*?)\*\*:?\s*(.*)/);
      return m ? { title: m[1].replace(/:$/, ''), body: m[2] } : { title: '', body: p };
    });

  return (
    <section className="app-panel" aria-labelledby="ai-title" aria-busy={loading}>
      <div className="app-panel__head">
        <div>
          <h2 id="ai-title" className="app-panel__title">Strategic summary</h2>
          <p className="app-panel__sub">
            Written by Gemini from the figures below{at && !error ? `, at ${at}` : ''}
          </p>
        </div>
        <button type="button" className="app-button app-button--text" onClick={run} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {error ? 'Retry' : 'Regenerate'}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i}>
              <span className="app-skel" style={{ width: 120, height: 14 }} />
              <span className="app-skel" style={{ display: 'block', width: '100%', height: 12, marginTop: 10 }} />
              <span className="app-skel" style={{ display: 'block', width: '80%', height: 12, marginTop: 6 }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="app-error" role="status">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{aiErrorMessage(error)} The figures below are computed without it.</span>
        </div>
      ) : (
        <div className="app-brief-points">
          {points.map((p, i) => (
            <div key={i}>
              {p.title && <p style={{ fontWeight: 600 }}>{p.title}</p>}
              <p style={{ color: 'var(--app-muted)', marginTop: 4, fontSize: 14, lineHeight: '21px' }}>{p.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Main export ──────────────────────────────────────────────
export default function IntelligenceBrief({ recentVideos, extendedVideos, insights, loading }: IntelligenceBriefProps) {
  if (loading || !recentVideos.length) {
    return (
      <div className="app-row" aria-busy="true">
        <div className="app-panel" style={{ height: 160 }} />
      </div>
    );
  }

  const patternVideos = extendedVideos.length ? extendedVideos : recentVideos;
  const formats = computeWinningFormat(recentVideos);
  const bestDay = computeBestDay(patternVideos);
  const signals = computeAudienceSignals(recentVideos, patternVideos);
  const gaps = computeContentGaps(recentVideos, patternVideos);
  const top10 = topByViews(recentVideos, 10);
  const hooks = top10.filter(v => hasNumberHook(v.title)).length;
  const titlePattern = insights.find(i => i.id === 'title-pattern');
  const maxFormat = formats ? Math.max(...formats.map(f => f.avg)) : 1;
  const topMinutes = top10.length
    ? Math.round(top10.reduce((s, v) => s + parseDuration(v.duration), 0) / top10.length / 60)
    : 0;
  const days = computeDayAverages(patternVideos);
  const maxDay = Math.max(...days.map(d => d.avg), 1);

  return (
    <div>
      <div className="app-row">
        <AiSummary recentVideos={recentVideos} insights={insights} />
      </div>

      <h2 className="app-section-title">What&rsquo;s working</h2>
      <p className="app-section-sub">From their latest {recentVideos.length} uploads, and {patternVideos.length} for posting days</p>

      <div className="app-row app-row--three">
        {/* Length */}
        <section className="app-panel" aria-labelledby="format-title">
          <h3 id="format-title" className="app-panel__title">Length that wins</h3>
          <p className="app-panel__sub">
            {formats ? `${formats[0].label} uploads average the most views` : 'No length data for these uploads'}
          </p>
          {topMinutes > 0 && (
            <>
              <p className="app-kpi__value" style={{ marginTop: 12 }}>
                {topMinutes}
                <span className="app-meta" style={{ fontSize: 14, fontWeight: 400 }}> min</span>
              </p>
              <p className="app-meta">average length of their 10 most viewed uploads</p>
            </>
          )}
          {formats ? (
            <ul style={{ marginTop: 14, display: 'grid', gap: 14 }}>
              {formats.map((f, i) => (
                <li key={f.key}>
                  <div className="app-title" style={{ alignItems: 'baseline', flexWrap: 'nowrap' }}>
                    <span style={{ fontWeight: i === 0 ? 600 : 400 }}>
                      {f.label} <span className="app-meta num">· {f.count} uploads</span>
                    </span>
                    <span className="num" style={{ fontWeight: 600 }}>{formatNumber(Math.round(f.avg))}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--app-active)', marginTop: 6 }}>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 999,
                        width: `${(f.avg / maxFormat) * 100}%`,
                        background: i === 0 ? 'var(--app-data)' : '#9a9a9a',
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="app-empty" style={{ marginTop: 14 }}>These uploads carry no duration.</p>
          )}
        </section>

        {/* Titles */}
        <section className="app-panel" aria-labelledby="titles-title">
          <h3 id="titles-title" className="app-panel__title">Title formula</h3>
          <p className="app-panel__sub">{titlePattern?.headline ?? 'No dominant title pattern'}</p>
          <p className="app-kpi__value" style={{ marginTop: 12 }}>
            {hooks}
            <span className="app-meta" style={{ fontSize: 14, fontWeight: 400 }}> of {top10.length}</span>
          </p>
          <p className="app-meta">of their most viewed titles carry a number or a dollar amount</p>
          <ul className="app-list" style={{ marginTop: 10 }}>
            {top10.slice(0, 3).map(v => (
              <li key={v.id} className="app-title" style={{ padding: '8px 0', flexWrap: 'nowrap', alignItems: 'baseline' }}>
                <span className="app-clip">{v.title}</span>
                <span className="num app-meta" style={{ flex: 'none' }}>{formatNumber(v.views)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Day */}
        <section className="app-panel" aria-labelledby="day-title">
          <h3 id="day-title" className="app-panel__title">Day to post</h3>
          <p className="app-panel__sub">From {patternVideos.length} uploads; a day needs two to count</p>
          {bestDay ? (
            <>
              <p className="app-kpi__value" style={{ marginTop: 12 }}>{bestDay.day}</p>
              <p className="app-meta">
                <span className="num" style={{ color: 'var(--app-positive)', fontWeight: 600 }}>+{bestDay.pct}%</span> views against their
                other posting days, from {bestDay.count} uploads
              </p>
              <div
                role="img"
                aria-label={`Average views by upload day. ${bestDay.day} is highest.`}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, alignItems: 'end', height: 88, marginTop: 16, borderBottom: '1px solid #bdbdbd' }}
              >
                {days.map(d => (
                  <span
                    key={d.day}
                    title={`${DAYS_SHORT[d.day]}: ${d.counted ? `${formatNumber(Math.round(d.avg))} average` : 'not compared'}, ${d.count} uploads`}
                    style={{
                      height: `${d.counted ? Math.max(4, (d.avg / maxDay) * 100) : 0}%`,
                      background: d.day === DAYS_SHORT.indexOf(bestDay.short) ? 'var(--app-data)' : '#bcbcbc',
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                ))}
              </div>
              <div className="app-meta" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginTop: 4 }}>
                {days.map(d => (
                  <span key={d.day}>{DAYS_SHORT[d.day]}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="app-empty" style={{ marginTop: 14 }}>Too few uploads per weekday to compare days.</p>
          )}
        </section>
      </div>

      <h2 className="app-section-title">Audience signals</h2>
      <p className="app-section-sub">Read from public likes, comments, lengths and titles</p>
      <dl className="app-signals">
        {signals.map(s => (
          <div key={s.kind} className="app-signal">
            <dt className="app-kpi__label">{s.title}</dt>
            <dd className="app-signal__value">{s.value}</dd>
            <dd className="app-meta" style={{ marginTop: 4, fontSize: 13, lineHeight: '19px' }}>{s.desc}</dd>
          </div>
        ))}
      </dl>

      <h2 className="app-section-title">Gaps and next moves</h2>
      <p className="app-section-sub">One move for each gap, from their upload history</p>
      <div className="app-moves">
        <div className="app-moves__row app-moves__head">
          <span>Where they&rsquo;re open</span>
          <span>What to do</span>
        </div>
        {gaps.map(g => (
          <div key={g.gap} className="app-moves__row">
            <div>
              <p style={{ fontWeight: 600 }}>{g.gap}</p>
              <p className="app-meta" style={{ fontSize: 13, lineHeight: '19px', marginTop: 2 }}>{g.detail}</p>
            </div>
            <p>{g.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
