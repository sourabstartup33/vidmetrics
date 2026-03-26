import React from 'react';

export function ChartCard({
  title,
  subtitle,
  insight,
  children,
}: {
  title: string;
  subtitle: string;
  insight: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
      </div>
      <div className="h-56 w-full">{children}</div>
      <div className="flex items-center justify-between pt-3 border-t border-white/5 min-h-[32px]">
        <span className="text-xs text-zinc-600 font-medium tracking-wide uppercase">Based on recent data</span>
        {insight}
      </div>
    </div>
  );
}

export function EmptyChart() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-2">
      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
      </div>
      <span className="text-xs text-zinc-500 font-medium">Not enough data to render chart</span>
    </div>
  );
}
