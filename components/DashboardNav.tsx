'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Bell, Search, Loader2 } from 'lucide-react';

interface DashboardNavProps {
  onAnalyze?: (url: string) => void;
  isLoading?: boolean;
}

export default function DashboardNav({ onAnalyze, isLoading }: DashboardNavProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !onAnalyze) return;
    onAnalyze(value.trim());
  };

  return (
    <nav className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 supports-[backdrop-filter]:bg-black/40">
      {/* Row 1: Logo + right icons (always visible) */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 relative z-10">
          <div className="bg-white p-1.5 rounded-md">
            <Play className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="font-semibold text-white tracking-tight hidden sm:block">VidMetrics</span>
        </Link>

        {/* Desktop: centered analyze form */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[480px] hidden md:block">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-full leading-5 bg-[#0A0A0A] placeholder-zinc-500 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                placeholder="Paste YouTube channel URL or @handle"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !value.trim()}
              className="px-5 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-full hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing…</span>
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </form>
        </div>

        {/* Right side: notification + avatar */}
        <div className="flex items-center justify-end gap-4 shrink-0 relative z-10">
          <button className="p-2 text-zinc-400 hover:text-white transition-colors relative hidden sm:block">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-black"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/150?img=33" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>

      {/* Row 2: Mobile-only full-width analyze form */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-white/10 rounded-lg leading-5 bg-[#0A0A0A] placeholder-zinc-500 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors min-h-[44px]"
              placeholder="Paste YouTube channel URL or @handle"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="w-full py-3 bg-indigo-500 text-white text-sm font-semibold rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing…</span>
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </form>
      </div>
    </nav>
  );
}
