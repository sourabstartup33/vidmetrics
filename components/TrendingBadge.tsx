import { Flame } from 'lucide-react';

export default function TrendingBadge({ score }: { score: number }) {
  let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let iconColor = 'text-emerald-400';
  
  if (score < 40) {
    colorClass = 'text-red-400 bg-red-500/10 border-red-500/20';
    iconColor = 'text-red-400';
  } else if (score < 70) {
    colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    iconColor = 'text-amber-400';
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${colorClass}`}>
      <Flame className={`w-3.5 h-3.5 ${iconColor}`} />
      {score}/100
    </div>
  );
}
