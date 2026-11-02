import { Chip } from '../ui/Chip';
import { riskChip } from '../ui/status';

type AlertCardProps = {
  id: string;
  payeeName: string;
  amount: string;
  note: string;
  reasons: string[];
  busy: boolean;
  score?: number | null;
  level?: string | null;
  createdAt?: string;
  onApprove: () => void;
  onDeny: () => void;
};

/** One row in the guardian's approvals inbox. */
export function AlertCard({
  id,
  payeeName,
  amount,
  note,
  reasons,
  busy,
  score,
  level,
  createdAt,
  onApprove,
  onDeny,
}: AlertCardProps) {
  const titleId = `alert-${id}`;
  const risk = riskChip(level ?? 'MEDIUM');
  return (
    <article aria-labelledby={titleId} className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Chip tone="warn">Needs review</Chip>
            {typeof score === 'number' ? (
              <Chip tone={risk.tone}>
                Risk {score} · {risk.label}
              </Chip>
            ) : null}
            {createdAt ? (
              <span className="text-xs text-[var(--gray-500)]">
                {new Date(createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            ) : null}
          </div>
          <h3 id={titleId} className="mt-2 text-[15px] font-semibold tabular-nums">
            {amount} to {payeeName}
          </h3>
          {note ? <p className="text-[13px] text-[var(--gray-600)]">{note}</p> : null}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-danger" onClick={onDeny} disabled={busy}>
            Deny
          </button>
          <button type="button" className="btn btn-primary" onClick={onApprove} disabled={busy}>
            Approve
          </button>
        </div>
      </div>
      {reasons.length > 0 ? (
        <ul className="mt-3 list-disc space-y-0.5 pl-5 text-[13px] text-[var(--gray-700)] marker:text-[var(--gray-300)]">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
