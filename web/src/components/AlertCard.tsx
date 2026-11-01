type AlertCardProps = {
  id: string;
  payeeName: string;
  amount: string;
  note: string;
  reasons: string[];
  busy: boolean;
  score?: number | null;
  level?: string | null;
  onApprove: () => void;
  onDeny: () => void;
};

export function AlertCard({
  id,
  payeeName,
  amount,
  note,
  reasons,
  busy,
  score,
  level,
  onApprove,
  onDeny,
}: AlertCardProps) {
  const titleId = `alert-${id}`;
  const tone = level === 'HIGH' ? 'high' : 'med';
  return (
    <article className="panel lift relative overflow-hidden p-6" aria-labelledby={titleId}>
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: `var(--d-${tone})` }}
        aria-hidden="true"
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: `var(--d-${tone})` }}
          >
            Waiting for you
          </p>
          <h2 id={titleId} className="mt-1 text-2xl font-semibold tracking-tight">
            {amount} to {payeeName}
          </h2>
          {note ? <p className="mt-1 text-[var(--d-muted)]">{note}</p> : null}
        </div>
        {typeof score === 'number' ? (
          <div className="rounded-2xl border border-[var(--d-line)] px-4 py-2 text-center">
            <p className="text-xs text-[var(--d-muted)]">Risk</p>
            <p className="text-2xl font-semibold" style={{ color: `var(--d-${tone})` }}>
              {score}
            </p>
          </div>
        ) : null}
      </div>
      {reasons.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2 rounded-xl bg-[var(--d-panel-2)] px-3 py-2">
              <span aria-hidden="true" style={{ color: `var(--d-${tone})` }}>
                ●
              </span>
              {reason}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="min-h-12 rounded-xl border px-5 py-3 font-semibold transition hover:opacity-80 disabled:opacity-50"
          style={{ borderColor: 'var(--d-high)', color: 'var(--d-high)' }}
          onClick={onDeny}
          disabled={busy}
        >
          Deny
        </button>
        <button
          type="button"
          className="min-h-12 rounded-xl px-5 py-3 font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          style={{ background: 'var(--d-low)' }}
          onClick={onApprove}
          disabled={busy}
        >
          Approve
        </button>
      </div>
    </article>
  );
}
