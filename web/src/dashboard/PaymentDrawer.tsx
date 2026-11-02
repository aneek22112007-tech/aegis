import { useEffect, useRef, type ReactNode } from 'react';
import { Chip } from '../ui/Chip';
import { Icon } from '../ui/Icon';
import { formatDateTime, riskChip, shortId, statusChip } from '../ui/status';
import { buildTimeline } from './timeline';

export type DrawerPayment = {
  id: string;
  payeeName: string;
  amount: string;
  note: string;
  status: string;
  level: string | null;
  score: number | null;
  decision: string | null;
  resolution: string | null;
  reasons: string[];
  createdAt: string;
  paypalOrderId?: string | null;
};

/** Right-hand payment detail sheet with IDs, timeline and reasons. */
export function PaymentDrawer({
  payment,
  onClose,
  actions,
}: {
  payment: DrawerPayment;
  onClose: () => void;
  actions?: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const status = statusChip(payment.status);
  const risk = riskChip(payment.level);
  const steps = buildTimeline(payment);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close details"
        tabIndex={-1}
        className="absolute inset-0 bg-[rgba(16,24,40,0.24)]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col border-l border-[var(--gray-200)] bg-white shadow-[var(--shadow-lg)]"
      >
        <div className="flex h-14 items-center justify-between border-b border-[var(--gray-200)] px-5">
          <span className="text-xs text-[var(--gray-500)]">Payment</span>
          <button ref={closeRef} type="button" className="btn" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-2">
            <Chip tone={status.tone}>{status.label}</Chip>
            <Chip tone={risk.tone}>Risk {payment.score ?? '—'}</Chip>
          </div>
          <h2
            id="drawer-title"
            className="mt-3 text-2xl font-semibold tracking-[-0.02em] tabular-nums"
          >
            {payment.amount} to {payment.payeeName}
          </h2>
          {payment.note ? <p className="mt-1 text-[var(--gray-600)]">{payment.note}</p> : null}

          <dl className="mt-5 grid grid-cols-[120px_1fr] gap-y-2 border-y border-[var(--gray-100)] py-4 text-[13px]">
            <dt className="text-[var(--gray-500)]">Payment ID</dt>
            <dd className="mono truncate" title={payment.id}>
              {shortId(payment.id)}
            </dd>
            {payment.paypalOrderId ? (
              <>
                <dt className="text-[var(--gray-500)]">PayPal order</dt>
                <dd className="mono">{payment.paypalOrderId}</dd>
              </>
            ) : null}
            <dt className="text-[var(--gray-500)]">Created</dt>
            <dd>{formatDateTime(payment.createdAt)}</dd>
            <dt className="text-[var(--gray-500)]">Decision</dt>
            <dd className="capitalize">{payment.decision ?? '—'}</dd>
          </dl>

          <h3 className="mt-5 text-[13px] font-semibold">Timeline</h3>
          <ol className="mt-3" aria-label="Payment timeline">
            {steps.map((step, i) => (
              <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
                {i < steps.length - 1 ? (
                  <span
                    className="absolute left-[7px] top-4 h-full w-px bg-[var(--gray-200)]"
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={`relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 bg-white ${
                    step.state === 'failed'
                      ? 'border-[var(--bad)]'
                      : step.state === 'current'
                        ? 'border-[#b7791f]'
                        : 'border-[var(--ok)]'
                  }`}
                />
                <div>
                  <p className="text-[13px] font-medium">{step.label}</p>
                  <p className="text-xs text-[var(--gray-500)]">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="mt-6 text-[13px] font-semibold">Why AEGIS decided this</h3>
          {payment.reasons.length ? (
            <ul className="mt-2 divide-y divide-[var(--gray-100)] rounded-md border border-[var(--gray-200)] text-[13px]">
              {payment.reasons.map((reason) => (
                <li key={reason} className="px-3 py-2">
                  {reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-[var(--gray-500)]">
              Matched Margaret’s history. No rules were triggered.
            </p>
          )}
        </div>
        {actions ? (
          <div className="flex justify-end gap-2 border-t border-[var(--gray-200)] px-5 py-3">
            {actions}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
