import { useMemo, useState } from 'react';
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

const LEVEL_STYLE: Record<RiskLevel, { label: string; action: string; color: string }> = {
  LOW: { label: 'Low risk', action: 'Captured silently', color: '#34f5b0' },
  MEDIUM: { label: 'Medium risk', action: 'Held — guardian asked', color: '#ffc65c' },
  HIGH: { label: 'High risk', action: 'Voided before capture', color: '#ff4d6a' },
};

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

function Gauge({ score, color }: { score: number; color: string }) {
  const r = 70;
  const length = Math.PI * r;
  return (
    <svg viewBox="0 0 180 110" className="w-full max-w-[260px]" aria-hidden="true">
      <path
        d="M20 95 A70 70 0 0 1 160 95"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M20 95 A70 70 0 0 1 160 95"
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - score / 100)}
        style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(.2,.8,.2,1), stroke 300ms' }}
      />
      <text x="90" y="88" textAnchor="middle" fontSize="34" fontWeight="700" fill="#fff">
        {score}
      </text>
    </svg>
  );
}

export function RiskPlayground({ now }: { now?: Date }) {
  const [payee, setPayee] = useState(PRESETS[2].payee);
  const [amount, setAmount] = useState(PRESETS[2].amount);
  const [note, setNote] = useState(PRESETS[2].note);
  const [status, setStatus] = useState<PayeeStatus>('unknown');
  const at = useMemo(() => now ?? new Date(), [now]);

  const dollars = Number(amount);
  const valid = payee.trim().length > 0 && Number.isFinite(dollars) && dollars > 0;
  const result = useMemo(
    () => (valid ? scorePlayground({ payee, amount: dollars, note, status, now: at }) : null),
    [valid, payee, dollars, note, status, at],
  );
  const style = result ? LEVEL_STYLE[result.level] : null;

  const field =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-emerald-300/60 focus:bg-white/[0.07]';

  return (
    <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl md:grid-cols-[1.1fr_1fr] md:p-8">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Try the risk engine"
      >
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
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
        <label className="flex flex-col gap-1.5 text-sm text-white/60">
          Who is being paid
          <input className={field} value={payee} onChange={(e) => setPayee(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/60">
          Amount (USD)
          <input
            className={field}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/60">
          Payment note
          <textarea
            className={`${field} min-h-24`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            className="h-5 w-5 accent-emerald-400"
            checked={status === 'trusted'}
            onChange={(e) => setStatus(e.target.checked ? 'trusted' : 'unknown')}
          />
          Margaret has paid this payee before
        </label>
        <p className="text-xs text-white/40">Rules compiled from: “{MANDATE_TEXT}”</p>
      </form>
      <div
        className="flex flex-col items-center justify-center gap-3 text-center"
        aria-live="polite"
        data-testid="risk-result"
      >
        {result && style ? (
          <>
            <Gauge score={result.score} color={style.color} />
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">Risk score</p>
            <p
              className="text-2xl font-semibold"
              style={{ color: style.color }}
              data-level={result.level}
            >
              {style.label} · {style.action}
            </p>
            <ul className="mt-2 w-full space-y-2 text-left text-sm text-white/75">
              {result.reasons.map((reason) => (
                <li key={reason} className="flex gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
                  <span aria-hidden="true" style={{ color: style.color }}>
                    ●
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-white/60">Enter a payee and an amount to see the decision.</p>
        )}
      </div>
    </div>
  );
}
