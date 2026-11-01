type AlertCardProps = {
  id: string;
  payeeName: string;
  amount: string;
  note: string;
  reasons: string[];
  busy: boolean;
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
  onApprove,
  onDeny,
}: AlertCardProps) {
  const titleId = `alert-${id}`;
  return (
    <article
      className="rounded-2xl border-4 border-[var(--line)] bg-[var(--card)] p-5"
      aria-labelledby={titleId}
    >
      <p className="text-base font-bold text-[var(--warn)]">Waiting for you</p>
      <h2 id={titleId} className="mt-1 text-3xl font-bold">
        {amount} to {payeeName}
      </h2>
      {note ? <p className="mt-3">{note}</p> : null}
      {reasons.length > 0 ? (
        <ul className="mt-3 list-disc pl-6">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-14 rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-[var(--accent-ink)] disabled:opacity-60"
          onClick={onApprove}
          disabled={busy}
        >
          Approve
        </button>
        <button
          type="button"
          className="min-h-14 rounded-xl border-4 border-[var(--danger)] px-5 py-3 font-bold text-[var(--danger)] disabled:opacity-60"
          onClick={onDeny}
          disabled={busy}
        >
          Deny
        </button>
      </div>
    </article>
  );
}
