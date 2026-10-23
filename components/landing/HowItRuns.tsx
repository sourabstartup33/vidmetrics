import { SampleBrief } from '@/lib/sampleBrief';
import { formatNumber } from '@/lib/utils';

// One analysis, further along in every field.
function AnalysisCard({ step, brief }: { step: 0 | 1 | 2 | 3; brief: SampleBrief }) {
  const maxViews = Math.max(...brief.uploads.map(u => u.views));
  return (
    <div data-ui className="ui-pad">
      <p className="ui-meta">Channel</p>
      <div className="ui-input" style={{ marginTop: 6 }}>
        youtube.com/{brief.channel.handle}
      </div>

      {step === 0 && (
        <p className="ui-meta" style={{ marginTop: 12 }}>
          Looking up the channel…
        </p>
      )}

      {step >= 1 && (
        <div style={{ marginTop: 14 }}>
          <p className="ui-title" style={{ fontSize: 15 }}>{brief.channel.title}</p>
          <p className="ui-meta num">
            {formatNumber(brief.channel.subscribers)} subscribers · {brief.channel.videoCount} videos
          </p>
        </div>
      )}

      {step >= 2 && (
        <div style={{ marginTop: 14 }}>
          <div className="ui-row">
            <span className="ui-meta">Latest uploads, oldest first</span>
            <span className="ui-meta num">{brief.uploadsRead}</span>
          </div>
          <div
            aria-hidden="true"
            style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 44, marginTop: 6 }}
          >
            {brief.uploads.map(u => (
              <span
                key={u.id}
                style={{
                  flex: 1,
                  height: `${Math.max(8, (u.views / maxViews) * 100)}%`,
                  background: step >= 3 && u.views === maxViews ? 'var(--app-data)' : '#b9b9b9',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {step >= 3 && (
        <div className="ui-rule" style={{ marginTop: 14, paddingTop: 12 }}>
          <p style={{ fontWeight: 600 }}>{brief.bestDay.day}s win.</p>
          <p className="ui-meta">
            {brief.bestDay.pct}% more views than their other posting days.
          </p>
        </div>
      )}
    </div>
  );
}

const FIELDS = [
  { bg: 'var(--cyan)', clause: 'First, paste a channel.' },
  { bg: 'var(--orange)', clause: 'It finds the channel.' },
  { bg: 'var(--white)', clause: 'Then it reads the uploads.' },
  { bg: 'var(--yellow)', clause: 'Then it writes the brief.' },
] as const;

export default function HowItRuns({ brief }: { brief: SampleBrief }) {
  return (
    <section className="lp-strip" id="how" aria-labelledby="how-title">
      {FIELDS.map((f, i) => (
        <div
          key={f.clause}
          className="lp-strip__field"
          style={{ ['--field' as string]: f.bg }}
          data-chapter-bg={f.bg}
          data-chapter-ink="var(--ink)"
        >
          <div>{i === 0 && <h2 id="how-title" className="lp-lead" data-reveal>How it runs</h2>}</div>
          <div className="lp-strip__card" data-reveal style={{ ['--i' as string]: i }}>
            <AnalysisCard step={i as 0 | 1 | 2 | 3} brief={brief} />
          </div>
          <p className="lp-lead lp-strip__clause" data-reveal style={{ ['--i' as string]: i }}>
            {f.clause}
          </p>
        </div>
      ))}
    </section>
  );
}
