import Link from 'next/link';
import Wordmark from '@/components/Wordmark';

// A plain bar: wordmark, the brief's chapters, one action. Its colours are
// set by LandingMotion from the chapter underneath.
export default function ChapterHeader() {
  return (
    <header className="lp-header">
      <Link href="/" aria-label="VidMetrics home">
        <Wordmark />
      </Link>
      <nav aria-label="Sections">
        <a className="lp-link" href="#brief">The brief</a>
        <a className="lp-link" href="#score">Scoring</a>
        <a className="lp-link" href="#how">How it runs</a>
        <a className="lp-link" href="#pricing">Pricing</a>
        <a className="lp-link" href="#questions">Questions</a>
      </nav>
      <div className="lp-header__end">
        <Link className="lp-link lp-header__login" href="/login">Log in</Link>
        <Link className="lp-button lp-button--ghost" href="/dashboard">Open the demo</Link>
      </div>
    </header>
  );
}
