// The VidMetrics mark: a play triangle cut from an ink square. On the landing
// page the triangle takes the colour of the chapter under the header.
export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="6" fill="currentColor" />
      <polygon points="11,8 25,16 11,24" style={{ fill: 'var(--header-bg, #FFD249)' }} />
    </svg>
  );
}

export default function Wordmark({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-[-0.02em] ${className}`}>
      <Mark size={size} />
      <span>VidMetrics</span>
    </span>
  );
}
