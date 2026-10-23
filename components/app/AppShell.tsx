'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, FileText, Loader2, Menu, Search, Settings, TrendingUp, Users, Download, X } from 'lucide-react';
import Wordmark from '@/components/Wordmark';

// Framed sheet: one tinted L-frame holds the sidebar and the top bar; the
// work sits on a white sheet inset 8px from the window's right and bottom.

const NAV = [
  { href: '/dashboard', label: 'Channel analysis', icon: BarChart3 },
  { href: '/dashboard/competitors', label: 'Competitors', icon: Users },
  { href: '/dashboard/trends', label: 'Trends', icon: TrendingUp },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/exports', label: 'Exports', icon: Download },
];

interface AppShellProps {
  children: ReactNode;
  title: string;
  onAnalyze?: (url: string) => void;
  isLoading?: boolean;
}

function AnalyzeForm({ onAnalyze, isLoading, id }: { onAnalyze?: (url: string) => void; isLoading?: boolean; id: string }) {
  const [value, setValue] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    if (onAnalyze) onAnalyze(v);
    else window.location.href = `/dashboard?channel=${encodeURIComponent(v)}`;
  };
  return (
    <form className="app-analyze" onSubmit={submit} role="search">
      <label htmlFor={id} className="sr-only">
        Channel link or handle
      </label>
      <Search className="app-analyze__icon" aria-hidden="true" />
      <input
        id={id}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Paste a channel link or @handle"
        autoComplete="off"
        spellCheck={false}
      />
      <button type="submit" className="app-button app-button--primary" disabled={isLoading || !value.trim()}>
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            Analyzing
          </>
        ) : (
          'Analyze'
        )}
      </button>
    </form>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <ul className="app-nav">
        {NAV.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link href={item.href} className="app-nav__item" aria-current={active ? 'page' : undefined} onClick={onNavigate}>
                <Icon className="app-nav__icon" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="app-nav__foot">
        <Link
          href="/dashboard/settings"
          className="app-nav__item"
          aria-current={pathname === '/dashboard/settings' ? 'page' : undefined}
          onClick={onNavigate}
        >
          <Settings className="app-nav__icon" aria-hidden="true" />
          Settings
        </Link>
        <div className="app-account">
          <span className="app-account__initial" aria-hidden="true">D</span>
          <span>
            <span className="app-account__name">Demo workspace</span>
            <Link href="/" className="app-account__out">Back to the site</Link>
          </span>
        </div>
      </div>
    </>
  );
}

export default function AppShell({ children, title, onAnalyze, isLoading }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="app">
      <aside className="app-sidebar" aria-label="Main">
        <Link href="/" className="app-sidebar__brand" aria-label="VidMetrics home">
          <Wordmark size={22} />
        </Link>
        <NavList />
      </aside>

      <header className="app-topbar">
        <button type="button" className="app-topbar__menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
        <span className="app-topbar__title">{title}</span>
        <div className="app-topbar__search">
          <AnalyzeForm onAnalyze={onAnalyze} isLoading={isLoading} id="topbar-channel" />
        </div>
      </header>

      <div className="app-phone-search">
        <AnalyzeForm onAnalyze={onAnalyze} isLoading={isLoading} id="phone-channel" />
      </div>

      <main className="app-sheet">{children}</main>

      {menuOpen && (
        <div className="app-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="app-menu__head">
            <Wordmark size={22} />
            <button type="button" className="app-topbar__menu" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <NavList onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}
