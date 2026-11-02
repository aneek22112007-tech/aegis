/** Compact metric tile: label, value, one line of context. No colour unless it means something. */
export function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'low' | 'med' | 'high';
}) {
  const dot =
    tone === 'low'
      ? 'var(--ok)'
      : tone === 'med'
        ? '#b7791f'
        : tone === 'high'
          ? 'var(--bad)'
          : null;
  return (
    <div className="bg-white px-5 py-4">
      <p className="flex items-center gap-1.5 text-[13px] text-[var(--gray-500)]">
        {dot ? (
          <span className="h-2 w-2 rounded-full" style={{ background: dot }} aria-hidden="true" />
        ) : null}
        {label}
      </p>
      <p className="mt-1 overflow-hidden text-[22px] font-semibold tracking-[-0.02em] tabular-nums">
        <span key={value} className="kpi-value inline-block">
          {value}
        </span>
      </p>
      {hint ? <p className="text-xs text-[var(--gray-500)]">{hint}</p> : null}
    </div>
  );
}
