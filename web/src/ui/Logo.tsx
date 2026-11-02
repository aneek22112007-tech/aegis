/** AEGIS wordmark: a flat shield in the brand colour. No gradients. */
export function Logo({ size = 20, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-[-0.01em]">
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2 3.5 5.4v6.1c0 5.1 3.6 9.2 8.5 10.5 4.9-1.3 8.5-5.4 8.5-10.5V5.4z"
          fill="var(--brand)"
        />
        <path
          d="m8.2 12.2 2.6 2.6 5-5.3"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withText ? <span className="text-[15px]">AEGIS</span> : null}
    </span>
  );
}
