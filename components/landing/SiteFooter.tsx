import Link from 'next/link';
import Wordmark from '@/components/Wordmark';

export default function SiteFooter() {
  return (
    <footer
      className="lp-field lp-grid lp-footer"
      data-chapter-bg="var(--yellow)"
      data-chapter-ink="var(--ink)"
    >
      <div className="lp-footer__top">
        <div className="lp-footer__notes">
          <Wordmark />
          <p>Competitor briefs for YouTube content teams.</p>
          <p>Built on the public YouTube Data API.</p>
        </div>
        <a className="lp-link" href="#top" style={{ fontWeight: 600 }}>
          Back to top
        </a>
      </div>

      <a className="lp-footer__contact lp-link" href="mailto:hello@vidmetrics.io">
        <span>hello</span>
        <span>@vidmetrics.io</span>
      </a>

      <div className="lp-footer__meta">
        <p style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link className="lp-link" href="/login">Log in</Link>
          <Link className="lp-link" href="/signup">Sign up</Link>
          <Link className="lp-link" href="/dashboard">Open the demo</Link>
        </p>
        <p>Set in Libre Franklin and Source Serif 4</p>
        <p>VidMetrics, 2026</p>
      </div>
    </footer>
  );
}
