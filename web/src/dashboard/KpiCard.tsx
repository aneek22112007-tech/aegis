type Tone = 'brand' | 'low' | 'med' | 'high';

export function KpiCard({
  label,
  value,
  hint,
  tone = 'brand',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="panel lift p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--d-muted)]">{label}</p>
      <p
        className="mt-2 text-2xl font-semibold tracking-tight tabular-nums break-words xl:text-[1.7rem]"
        style={{ color: `var(--d-${tone === 'brand' ? 'ink' : tone})` }}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-sm text-[var(--d-muted)]">{hint}</p> : null}
    </div>
  );
}
