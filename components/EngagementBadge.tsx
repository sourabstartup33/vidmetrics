export default function EngagementBadge({ rate }: { rate: string }) {
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-semibold">
      {rate}
    </div>
  );
}
