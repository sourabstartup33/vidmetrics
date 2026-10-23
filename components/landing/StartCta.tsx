'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StartCta() {
  const router = useRouter();
  const [channel, setChannel] = useState('@mkbhd');
  const [tab, setTab] = useState<'overview' | 'intelligence'>('intelligence');
  const handle = channel.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!handle) return;
    router.push(`/dashboard?channel=${encodeURIComponent(handle)}&tab=${tab}`);
  };

  return (
    <section
      className="lp-field lp-grid lp-cta"
      id="start"
      aria-labelledby="start-title"
      data-chapter-bg="var(--magenta)"
      data-chapter-ink="var(--ink)"
    >
      <div className="lp-cta__close">
        <h2 id="start-title" className="lp-head" data-reveal>
          Pick a rival.
        </h2>
        <p className="lp-body" data-reveal style={{ ['--i' as string]: 1 }}>
          You land on its dashboard: the latest uploads scored, and the brief one tab away.
        </p>
      </div>

      <form data-ui className="ui-dialog lp-cta__dialog" onSubmit={submit} data-reveal style={{ ['--i' as string]: 2 }}>
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Analyze a channel</p>
          <p className="ui-meta" style={{ marginTop: 4 }}>Any public YouTube channel. No account to connect.</p>

          <label htmlFor="cta-channel" style={{ display: 'block', marginTop: 20, fontWeight: 500 }}>
            Channel link or handle
          </label>
          <input
            id="cta-channel"
            className="ui-input"
            style={{ marginTop: 8 }}
            value={channel}
            onChange={e => setChannel(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />

          <p id="cta-open" style={{ marginTop: 16, fontWeight: 500 }}>Open on</p>
          <div className="ui-seg" role="group" aria-labelledby="cta-open" style={{ marginTop: 8 }}>
            <button type="button" aria-pressed={tab === 'overview'} onClick={() => setTab('overview')}>
              Overview
            </button>
            <button type="button" aria-pressed={tab === 'intelligence'} onClick={() => setTab('intelligence')}>
              Intelligence brief
            </button>
          </div>
        </div>
        <div className="ui-rule" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="ui-button" disabled={!handle} style={{ minHeight: 44 }}>
            {handle ? `Analyze ${handle.length > 24 ? 'channel' : handle}` : 'Analyze'}
          </button>
        </div>
      </form>
    </section>
  );
}
