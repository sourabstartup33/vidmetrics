'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const EXAMPLES = ['@MrBeast', '@mkbhd', '@tseries'];

export default function Hero() {
  const router = useRouter();
  const [channel, setChannel] = useState('');
  const [error, setError] = useState('');

  const analyze = (e: FormEvent) => {
    e.preventDefault();
    const value = channel.trim();
    if (!value) {
      setError('Paste a channel link or an @handle first.');
      return;
    }
    router.push(`/dashboard?channel=${encodeURIComponent(value)}`);
  };

  return (
    <section
      className="lp-field lp-grid lp-hero"
      id="top"
      data-chapter-bg="var(--yellow)"
      data-chapter-ink="var(--ink)"
    >
      <h1 className="lp-hero__title">
        <span className="lp-hero__pale">Their hits,</span>
        <span>explained.</span>
      </h1>

      <div className="lp-hero__aside">
        <p className="lp-body">
          Paste any YouTube channel. VidMetrics reads its latest 50 uploads and writes you a brief: what
          wins, when they post and where they&rsquo;re open.
        </p>
        <form className="lp-channel-form" onSubmit={analyze} noValidate>
          <label className="sr-only" htmlFor="hero-channel">
            YouTube channel link or handle
          </label>
          <input
            id="hero-channel"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="youtube.com/@handle"
            value={channel}
            onChange={e => {
              setChannel(e.target.value);
              setError('');
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'hero-channel-error' : undefined}
          />
          <button className="lp-button" type="submit">
            Analyze
          </button>
        </form>
        {error && (
          <p id="hero-channel-error" className="lp-small lp-form-error" role="alert">
            {error}
          </p>
        )}
        <p className="lp-small lp-tries">
          <span>Try</span>
          {EXAMPLES.map(handle => (
            <button key={handle} type="button" onClick={() => { setChannel(handle); setError(''); }}>
              {handle}
            </button>
          ))}
        </p>
      </div>
    </section>
  );
}
