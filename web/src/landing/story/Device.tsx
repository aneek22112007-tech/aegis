import type { CSSProperties, ReactNode } from 'react';

/** A phone mockup whose screen is live React UI, so it stays crisp at any scale. */
export function Device({
  children,
  label,
  className = '',
  style,
  testId,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  style?: CSSProperties;
  testId?: string;
}) {
  return (
    <figure
      className={`device ${className}`}
      style={style}
      role="img"
      aria-label={label}
      data-testid={testId}
    >
      <div className="device-screen" aria-hidden="true">
        <div className="device-island" />
        {children}
      </div>
    </figure>
  );
}

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[12px] font-semibold text-[var(--gray-900)]">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <svg width="16" height="10" viewBox="0 0 16 10">
          <rect x="0" y="6" width="3" height="4" rx="0.5" fill="currentColor" />
          <rect x="4.3" y="4" width="3" height="6" rx="0.5" fill="currentColor" />
          <rect x="8.6" y="2" width="3" height="8" rx="0.5" fill="currentColor" />
          <rect x="12.9" y="0" width="3" height="10" rx="0.5" fill="currentColor" />
        </svg>
        <svg width="22" height="11" viewBox="0 0 22 11">
          <rect
            x="0.5"
            y="0.5"
            width="18"
            height="10"
            rx="2.5"
            fill="none"
            stroke="currentColor"
            opacity="0.4"
          />
          <rect x="2" y="2" width="13" height="7" rx="1.5" fill="currentColor" />
          <rect
            x="19.5"
            y="3.5"
            width="1.5"
            height="4"
            rx="0.75"
            fill="currentColor"
            opacity="0.4"
          />
        </svg>
      </span>
    </div>
  );
}
