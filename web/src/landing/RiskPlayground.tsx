import { useMemo, useState } from 'react';
import { Chip } from '../ui/Chip';
import { evaluateRisk } from '../engine/evaluate';
import { heuristicCompile } from '../engine/heuristic';
import { explainDecision } from '../engine/reasons';
import type { PayeeStatus, RiskLevel } from '../engine/types';
import { MANDATE_TEXT } from '../demo/store';

const POLICY = heuristicCompile(MANDATE_TEXT, { name: 'Priya', contact: 'daughter' });

const HISTORY: Record<string, number[]> = {
  'cvs pharmacy': [32, 36, 40, 42, 44, 45, 46, 47, 48, 48, 49, 50, 51, 52, 54, 55, 42, 38, 46, 50],
  'city utilities': [
    88, 92, 90, 95, 86, 100, 84, 91, 89, 93, 87, 96, 90, 85, 94, 88, 91, 97, 86, 90,
  ],
};

const PRESETS = [
  {
    label: 'Pharmacy refill',
    payee: 'CVS Pharmacy',
    amount: '48',
    note: 'Prescription refill',
    status: 'trusted' as const,
  },
  {
    label: 'New person, $650',
    payee: 'Helen Brooks',
    amount: '650',
    note: 'Birthday gift',
    status: 'unknown' as const,
  },
  {
    label: 'Bail scam',
    payee: 'Officer James',
    amount: '1900',
    note: 'URGENT keep this secret, your grandson needs bail',
    status: 'unknown' as const,
  },
];

const LEVEL_STYLE: Record<
  RiskLevel,
  { label: string; action: string; tone: 'ok' | 'warn' | 'bad' }
> = {
  LOW: { label: 'Low risk', action: 'Captured silently', tone: 'ok' },
  MEDIUM: { label: 'Medium risk', action: 'Held — guardian asked', tone: 'warn' },
  HIGH: { label: 'High risk', action: 'Voided before capture', tone: 'bad' },
};
const BAR: Record<string, string> = { ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)' };

export function scorePlayground(input: {
  payee: string;
  amount: number;
  note: string;
  status: PayeeStatus;
  now: Date;
}) {
  const key = input.payee.trim().toLowerCase();
  const decision = evaluateRisk({
    amount: input.amount,
    payeeName: input.payee,
    note: input.note,
    payeeStatus: input.status,
    recentPaymentCount: 0,
    recentPaymentTotal: 0,
    historyAmounts: input.status === 'trusted' ? (HISTORY[key] ?? []) : [],
    now: input.now,
    policy: POLICY,
  });
  return { ...decision, reasons: explainDecision(decision) };
}

export function RiskPlayground({ now }: { now?: Date }) {
  const [payee, setPayee] = useState(PRESETS[2].payee);
  const [amount, setAmount] = useState(PRESETS[2].amount);
  const [note, setNote] = useState(PRESETS[2].note);
  const [status, setStatus] = useState<PayeeStatus>('unknown');
  const at = useMemo(() => now ?? new Date(), [now]);
  const dollars = Number(amount);
  const valid = payee.trim().length > 0 && amount.trim() !== '' && dollars > 0;
  const result = useMemo(
    () => (valid ? scorePlayground({ payee, amount: dollars, note, status, now: at }) : null),
    [valid, payee, dollars, note, status, at],
  );
  const style = result ? LEVEL_STYLE[result.level] : null;

  return (
    <div
      className="card grid overflow-hidden md:grid-cols-[1fr_1fr]"
      aria-label="Try the risk engine"
    >
      <form
        className="flex flex-col gap-4 border-b border-[var(--gray-200)] p-6 md:border-b-0 md:border-r"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex flex-wrap gap-2" role="group" aria-label="Examples">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`btn ${payee === preset.payee ? 'btn-secondary border-[var(--brand)] text-[var(--brand)]' : 'btn-secondary'}`}
              onClick={() => {
                setPayee(preset.payee);
                setAmount(preset.amount);
                setNote(preset.note);
                setStatus(preset.status);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <label className="label flex flex-col gap-1.5">
          Payee
          <input className="input" value={payee} onChange={(e) => setPayee(e.target.value)} />
        </label>
        <label className="label flex flex-col gap-1.5">
          Amount (USD)
          <input
            className="input tabular-nums"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="label flex flex-col gap-1.5">
          Payment note
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-[13px] text-[var(--gray-700)]">
          <input
            type="checkbox"
            checked={status === 'trusted'}
            onChange={(e) => setStatus(e.target.checked ? 'trusted' : 'unknown')}
          />
          Payee is on the trusted list
        </label>
      </form>
      <div
        className="flex flex-col gap-4 bg-[var(--gray-25)] p-6"
        aria-live="polite"
        data-testid="risk-result"
      >
        {result && style ? (
          <>
            <div className="flex items-center justify-between">
              <span className="label">Decision</span>
              <Chip tone={style.tone}>
                {style.label} · {style.action}
              </Chip>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[40px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
                  {result.score}
                </span>
                <span className="text-[13px] text-[var(--gray-500)]">/ 100 risk score</span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded bg-[var(--gray-200)]">
                <div
                  className="h-1.5 rounded"
                  style={{ width: `${Math.min(100, result.score)}%`, background: BAR[style.tone] }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-[var(--gray-500)]">
                <span>0</span>
                <span>35</span>
                <span>70</span>
                <span>100</span>
              </div>
            </div>
            <div>
              <p className="label mb-2">Reasons</p>
              <ul className="flex flex-col gap-1.5 text-[13px] text-[var(--gray-700)]">
                {result.reasons.map((reason) => (
                  <li key={reason} className="border-l-2 border-[var(--gray-300)] pl-2">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-[13px] text-[var(--gray-500)]">
            Enter a payee and an amount to see the decision.
          </p>
        )}
      </div>
    </div>
  );
}
