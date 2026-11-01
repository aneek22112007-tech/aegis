export function ShieldMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5cffd0" />
          <stop offset="1" stopColor="#7c8cff" />
        </linearGradient>
      </defs>
      <path
        d="M16 2c3 1.2 6.4 1.8 10 1.8V15c0 6.6-4.2 11.4-10 15-5.8-3.6-10-8.4-10-15V3.8C9.6 3.8 13 3.2 16 2Z"
        fill="url(#mark)"
      />
      <path
        d="M10.5 16l3.8 3.8 7.4-7.6"
        fill="none"
        stroke="#04060c"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
