import { ReactNode } from 'react';
import Link from 'next/link';
import Wordmark from '@/components/Wordmark';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

// The first chapter's yellow field beside a plain form.
export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth">
      <div className="auth__field">
        <Link href="/" aria-label="VidMetrics home">
          <Wordmark />
        </Link>
        <p className="auth__statement" aria-hidden="true">
          <span>Their hits,</span>
          <span>explained.</span>
        </p>
        <p className="auth__note">
          Paste any YouTube channel and get a brief on what wins, when they post and where they&rsquo;re open.
        </p>
      </div>
      <main className="auth__form">
        <div className="auth__inner">
          <Link href="/" className="auth__mobile-mark" aria-label="VidMetrics home">
            <Wordmark />
          </Link>
          <h1 className="auth__title">{title}</h1>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
