interface MetricCardProps {
  title: string;
  value: string;
}

export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="bg-black/50 px-4 py-3 rounded-lg border border-white/5 border-l-4 border-l-indigo-500 shadow-sm">
      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">{title}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
