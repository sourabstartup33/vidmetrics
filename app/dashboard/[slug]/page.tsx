'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/app/AppShell';

const features: Record<string, { name: string; what: string }> = {
  competitors: {
    name: 'Competitors',
    what: 'Save the channels you watch and see them side by side, with each one’s latest uploads scored the same way.',
  },
  reports: {
    name: 'Reports',
    what: 'A weekly brief on every saved competitor, ready to share with the team on Monday morning.',
  },
  trends: {
    name: 'Trends',
    what: 'Formats, lengths and title patterns rising across the channels you track.',
  },
  exports: {
    name: 'Exports',
    what: 'Every CSV you have downloaded, and scheduled exports to a shared drive.',
  },
  settings: {
    name: 'Settings',
    what: 'Your workspace, members, API keys and plan.',
  },
};

export default function ComingSoonPage() {
  const { slug } = useParams<{ slug: string }>();
  const feature = features[slug] ?? { name: 'This screen', what: 'This part of VidMetrics is not built yet.' };

  return (
    <AppShell title={feature.name}>
      <div className="app-title">
        <div>
          <h1>{feature.name}</h1>
          <p className="app-title__finding">{feature.what}</p>
        </div>
      </div>
      <div className="app-row">
        <div className="app-empty" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span>Not in this version yet. Channel analysis and the Intelligence brief work today.</span>
          <Link href="/dashboard" className="app-button">
            Open channel analysis
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
