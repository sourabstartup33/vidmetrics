export default function EngagementBadge({ rate }: { rate: string }) {
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
      {rate}
    </div>
  );
}
