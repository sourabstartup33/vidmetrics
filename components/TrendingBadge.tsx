export default function TrendingBadge({ score }: { score: number }) {
  let bgClass = 'bg-emerald-500/15 text-emerald-400';
  let dotClass = 'bg-emerald-400';
  
  if (score < 40) {
    bgClass = 'bg-red-500/15 text-red-400';
    dotClass = 'bg-red-400';
  } else if (score < 70) {
    bgClass = 'bg-amber-500/15 text-amber-400';
    dotClass = 'bg-amber-400';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bgClass}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {score}/100
    </div>
  );
}
