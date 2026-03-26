'use client';

import {
  Calendar,
  TrendingUp,
  BarChart2,
  Target,
  Users,
  Type,
  LucideIcon,
} from 'lucide-react';
import { Insight } from '@/types';

// ── Icon name → Lucide component map ─────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Calendar,
  TrendingUp,
  BarChart2,
  Target,
  Users,
  Type,
};

// ── Signal → styling tokens ───────────────────────────────────
const SIGNAL_STYLES = {
  positive: {
    bg: 'bg-emerald-500/10',
    border: 'border-l-emerald-500 border-white/5',
    iconColor: 'text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-l-amber-500 border-white/5',
    iconColor: 'text-amber-400',
  },
  neutral: {
    bg: 'bg-white/5',
    border: 'border-l-white/20 border-white/5',
    iconColor: 'text-zinc-400',
  },
} as const;

interface KeyInsightsProps {
  insights: Insight[];
  loading?: boolean;
}

export default function KeyInsights({ insights, loading }: KeyInsightsProps) {
  // ── Loading skeleton ────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-xl border border-white/5 border-l-4 border-l-white/10 p-4 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-zinc-700 rounded" />
              <div className="h-3 w-32 bg-zinc-700 rounded" />
            </div>
            <div className="h-3 w-full bg-zinc-800 rounded mb-1" />
            <div className="h-3 w-4/5 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────
  if (insights.length < 5) {
    return (
      <div className="mb-5 px-4 py-6 bg-white/5 rounded-xl border border-white/10 text-center">
        <p className="text-sm text-zinc-500">Not enough data to generate insights</p>
      </div>
    );
  }

  // ── Insight grid ────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
      {insights.map((insight) => {
        const Icon = ICON_MAP[insight.icon] ?? Target;
        const styles = SIGNAL_STYLES[insight.signal];

        return (
          <div
            key={insight.id}
            className={`rounded-xl border border-l-4 p-4 transition-all hover:border-white/15 hover:scale-[1.01] ${styles.bg} ${styles.border}`}
          >
            <div className="flex items-start gap-2.5">
              <div className={`mt-0.5 shrink-0 ${styles.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white leading-snug mb-1">
                  {insight.headline}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {insight.detail}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
