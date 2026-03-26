'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Construction, Bell, CheckCircle } from 'lucide-react';
import DashboardNav from '@/components/DashboardNav';
import Sidebar from '@/components/Sidebar';

const featureNames: Record<string, string> = {
  competitors: 'Competitor Tracking',
  reports: 'Reports',
  trends: 'Trend Intelligence',
  exports: 'Exports Hub',
  settings: 'Settings',
};

export default function ComingSoonPage() {
  const { slug } = useParams<{ slug: string }>();
  const featureName = featureNames[slug] ?? 'This feature';
  const [notified, setNotified] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <DashboardNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)] p-8">
          <div className="text-center max-w-md">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Construction className="w-10 h-10 text-indigo-400" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Coming in v2
            </div>

            <h1 className="text-2xl font-extrabold text-white mb-3">
              {featureName}
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              This feature is coming in v2. Currently in development.
            </p>

            {/* Notify me */}
            {notified ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                You&apos;ll be notified when it launches!
              </div>
            ) : (
              <button
                onClick={() => setNotified(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-medium rounded-xl transition-all"
              >
                <Bell className="w-4 h-4 text-zinc-400" />
                Notify me when it&apos;s ready
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
