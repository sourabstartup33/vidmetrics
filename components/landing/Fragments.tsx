import { SampleBrief } from '@/lib/sampleBrief';
import { formatNumber, parseDuration } from '@/lib/utils';

// Fragments of the real interface, drawn from the sample brief.
// Each root carries data-ui: inside it the app's own conventions apply.

const THUMB_FIELDS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--orange)'];

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function clock(iso8601: string) {
  const s = parseDuration(iso8601);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

// A video's thumbnail, drawn: its title set the way the thumbnail shouts it.
export function Thumb({ title, duration, index = 0, small = false }: { title: string; duration?: string; index?: number; small?: boolean }) {
  return (
    <div className={`ui-thumb${small ? ' ui-thumb--sm' : ''}`} style={{ ['--thumb' as string]: THUMB_FIELDS[index % THUMB_FIELDS.length] }}>
      <span className="ui-thumb__words">{title}</span>
      {duration && <span className="ui-thumb__time">{clock(duration)}</span>}
    </div>
  );
}

export function TopVideoCard({ brief }: { brief: SampleBrief }) {
  const v = brief.topVideo;
  return (
    <div data-ui className="ui-pad">
      <Thumb title={v.title} duration={v.duration} index={1} />
      <p className="ui-title" style={{ marginTop: 12, fontSize: 15 }}>{v.title}</p>
      <p className="ui-meta num">
        {formatNumber(v.views)} views · {shortDate(v.publishedAt)}
      </p>
      <div className="ui-rule" style={{ margin: '12px 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <p className="ui-meta">Trending</p>
          <p className="num" style={{ fontSize: 18, fontWeight: 600 }}>
            {v.trendingScore}
            <span className="ui-meta"> /100</span>
          </p>
        </div>
        <div>
          <p className="ui-meta">Engagement</p>
          <p className="num" style={{ fontSize: 18, fontWeight: 600 }}>{v.engagementRate.toFixed(2)}%</p>
        </div>
        <div>
          <p className="ui-meta">Vs average</p>
          <p className="num" style={{ fontSize: 18, fontWeight: 600, color: 'var(--app-data)' }}>{v.timesAverage}×</p>
        </div>
      </div>
    </div>
  );
}

export function FormatCard({ brief }: { brief: SampleBrief }) {
  const max = Math.max(...brief.formats.map(f => f.avg));
  return (
    <div data-ui className="ui-pad">
      <div className="ui-row">
        <p className="ui-title">Average views by length</p>
        <p className="ui-meta num">{brief.uploadsRead} uploads</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        {brief.formats.map((f, i) => (
          <div key={f.label}>
            <div className="ui-row" style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: i === 0 ? 600 : 400 }}>
                {f.label} <span className="ui-meta num">· {f.count} uploads</span>
              </span>
              <span className="num" style={{ fontWeight: 600 }}>{formatNumber(Math.round(f.avg))}</span>
            </div>
            <div className="ui-bar">
              <span className={i === 0 ? 'is-lead' : ''} style={{ width: `${(f.avg / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DayCard({ brief }: { brief: SampleBrief }) {
  const max = Math.max(...brief.days.map(d => d.avg));
  // Ticks on round steps above the maximum
  const step = 20_000_000;
  const top = Math.ceil(max / step) * step;
  return (
    <div data-ui className="ui-pad">
      <div className="ui-row">
        <p className="ui-title">Average views by upload day</p>
        <p className="ui-meta num">{brief.uploadsRead} uploads</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 8, marginTop: 16 }}>
        <div className="ui-meta num" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 140, textAlign: 'right' }}>
          <span>{formatNumber(top)}</span>
          <span>{formatNumber(top / 2)}</span>
          <span>0</span>
        </div>
        <div style={{ position: 'relative', height: 140, borderBottom: '1px solid #bdbdbd' }}>
          <div style={{ position: 'absolute', inset: '0 0 auto 0', borderTop: '1px solid var(--app-grid)' }} />
          <div style={{ position: 'absolute', inset: '50% 0 auto 0', borderTop: '1px solid var(--app-grid)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, alignItems: 'end' }}>
            {brief.days.map(d => (
              <div
                key={d.short}
                title={`${d.short}: ${formatNumber(Math.round(d.avg))} average from ${d.count} uploads`}
                style={{
                  height: `${(d.avg / top) * 100}%`,
                  background: d.best ? 'var(--app-data)' : '#b9b9b9',
                  borderRadius: '3px 3px 0 0',
                }}
              />
            ))}
          </div>
        </div>
        <span />
        <div className="ui-meta" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
          {brief.days.map(d => (
            <span key={d.short} style={d.best ? { color: 'var(--app-text)', fontWeight: 600 } : undefined}>
              {d.short}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Marks the number or dollar amount in a title
function markHook(title: string) {
  const parts = title.split(/(\$?[\d,]+(?:\.\d+)?)/);
  return parts.map((p, i) =>
    /\d/.test(p) ? (
      <span key={i} style={{ background: 'var(--app-data-soft)', borderRadius: 3, padding: '0 2px' }}>{p}</span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function TitleCard({ brief }: { brief: SampleBrief }) {
  const rows = brief.titles.slice(0, 6);
  return (
    <div data-ui className="ui-pad">
      <div className="ui-row">
        <p className="ui-title">Top titles by views</p>
        <p className="ui-meta num">{brief.titleHookCount} of 10 use a number</p>
      </div>
      <ol style={{ marginTop: 10 }}>
        {rows.map((t, i) => (
          <li
            key={t.title}
            className="ui-row"
            style={{ padding: '9px 0', borderTop: i ? '1px solid var(--app-rule)' : undefined, alignItems: 'center' }}
          >
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{markHook(t.title)}</span>
            <span className="num ui-meta" style={{ flex: 'none' }}>{formatNumber(t.views)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function GapsCard({ brief }: { brief: SampleBrief }) {
  return (
    <div data-ui className="ui-pad">
      <div className="ui-row">
        <p className="ui-title">Content gaps</p>
        <span className="ui-pill" style={{ background: 'var(--app-pill-warning-bg)', color: 'var(--app-pill-warning-ink)' }}>
          {brief.gaps.length} found
        </span>
      </div>
      <ul style={{ marginTop: 8 }}>
        {brief.gaps.slice(0, 4).map((g, i) => (
          <li key={g.gap} style={{ padding: '10px 0', borderTop: i ? '1px solid var(--app-rule)' : undefined }}>
            <p style={{ fontWeight: 600 }}>{g.gap}</p>
            <p className="ui-meta" style={{ marginTop: 2 }}>{g.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActionsCard({ brief }: { brief: SampleBrief }) {
  return (
    <div data-ui className="ui-pad">
      <div className="ui-row">
        <p className="ui-title">Next moves</p>
        <p className="ui-meta">From the gaps</p>
      </div>
      <ul style={{ marginTop: 8 }}>
        {brief.gaps.slice(0, 4).map((g, i) => (
          <li
            key={g.action}
            style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: i ? '1px solid var(--app-rule)' : undefined }}
          >
            <span
              aria-hidden="true"
              style={{ width: 16, height: 16, marginTop: 2, flex: 'none', border: '1.5px solid var(--app-control)', borderRadius: 4, background: i === 0 ? 'var(--app-text)' : undefined }}
            />
            <span style={i === 0 ? { textDecoration: 'line-through', color: 'var(--app-muted)' } : undefined}>{g.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
