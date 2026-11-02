/** Flat CSS version of the AEGIS card, used without WebGL and in the static story. */
export function CssCard({ className = '' }: { className?: string }) {
  return (
    <div className={`pay-card ${className}`} aria-hidden="true">
      <div className="flex items-start justify-between">
        <span className="text-[15px] font-semibold tracking-[0.02em]">AEGIS</span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.8"
        >
          <path d="M8 6.5a8 8 0 0 1 0 11M12 4a12 12 0 0 1 0 16M16 2a16 16 0 0 1 0 20" />
        </svg>
      </div>
      <div className="pay-chip" />
      <div className="flex items-end justify-between text-[12px] tracking-[0.08em]">
        <span>MARGARET · •••• 4821</span>
        <span className="opacity-70">GUARDED</span>
      </div>
    </div>
  );
}
