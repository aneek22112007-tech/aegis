/** Static hero art used when WebGL is unavailable or the visitor prefers reduced motion. */
export function StaticShield() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" data-testid="static-shield">
      <svg
        viewBox="0 0 400 400"
        className="h-[70%] max-h-[460px] w-auto"
        role="img"
        aria-label="AEGIS shield"
      >
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#123c3d" />
            <stop offset="1" stopColor="#05121a" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="200" cy="200" r="170" fill="none" stroke="#38e8c6" strokeOpacity="0.3" />
        <rect x="20" y="120" width="70" height="44" rx="8" fill="#34f5b0" opacity="0.85" />
        <rect x="300" y="230" width="70" height="44" rx="8" fill="#34f5b0" opacity="0.6" />
        <rect x="40" y="240" width="70" height="44" rx="8" fill="#ff3b5c" opacity="0.9" />
        <path
          d="M200 70 C230 80 260 84 285 84 L285 190 C285 250 245 290 200 320 C155 290 115 250 115 190 L115 84 C140 84 170 80 200 70 Z"
          fill="url(#sg)"
          stroke="#5cffd0"
          strokeWidth="4"
          filter="url(#glow)"
        />
        <path
          d="M160 195 L190 225 L245 165"
          fill="none"
          stroke="#b8fff0"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
