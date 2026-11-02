import { useEffect, useRef, useState } from 'react';

type Outcome = 'captured' | 'held' | 'voided';
type Scenario = {
  id: string;
  payee: string;
  amount: string;
  note: string;
  score: number;
  level: 'Low' | 'Medium' | 'High';
  outcome: Outcome;
  event: string;
};

export const FLOW_SCENARIOS: Scenario[] = [
  {
    id: 'cvs',
    payee: 'CVS Pharmacy',
    amount: '$48.00',
    note: 'Monthly prescription refill',
    score: 0,
    level: 'Low',
    outcome: 'captured',
    event: 'PAYMENT.CAPTURE.COMPLETED',
  },
  {
    id: 'helen',
    payee: 'Helen Brooks',
    amount: '$650.00',
    note: 'Birthday gift',
    score: 42,
    level: 'Medium',
    outcome: 'held',
    event: 'guardian.alert.created',
  },
  {
    id: 'james',
    payee: 'Officer James',
    amount: '$1,900.00',
    note: 'Urgent and secret: grandson bail',
    score: 100,
    level: 'High',
    outcome: 'voided',
    event: 'PAYMENT.AUTHORIZATION.VOIDED',
  },
];

const OUTCOME: Record<Outcome, { label: string; tone: string; detail: string }> = {
  captured: {
    label: 'Captured',
    tone: 'chip-ok',
    detail: 'Funds settle with the pharmacy. Nobody is interrupted.',
  },
  held: {
    label: 'Held for Priya',
    tone: 'chip-warn',
    detail: 'The authorization stays open until Priya approves or denies it.',
  },
  voided: {
    label: 'Voided',
    tone: 'chip-bad',
    detail: 'The authorization is released. No money leaves the account.',
  },
};

const STEPS = ['Margaret’s app', 'AEGIS rules', 'PayPal order', 'Payee'] as const;
const STEP_MS = 1100;

function stepDetail(s: Scenario, i: number) {
  if (i === 0) return `${s.amount} · “${s.note}”`;
  if (i === 1) return `Score ${s.score} · ${s.level}`;
  if (i === 2) return s.outcome === 'voided' ? 'AUTHORIZE → void' : 'intent AUTHORIZE';
  return s.outcome === 'captured' ? 'Paid' : s.outcome === 'held' ? 'Waiting' : 'Not paid';
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/** A payment travelling through the four hops, one scenario at a time. */
export function MoneyFlow() {
  const reduced = prefersReducedMotion();
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(reduced ? STEPS.length : 0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const s = FLOW_SCENARIOS[active];

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible || paused) return;
    const t = window.setTimeout(
      () => {
        if (step < STEPS.length) setStep(step + 1);
        else {
          setActive((a) => (a + 1) % FLOW_SCENARIOS.length);
          setStep(0);
        }
      },
      step < STEPS.length ? STEP_MS : 2600,
    );
    return () => window.clearTimeout(t);
  }, [step, visible, paused, reduced]);

  const choose = (i: number) => {
    setActive(i);
    setStep(reduced ? STEPS.length : 0);
    setPaused(false);
  };

  const stopAt = s.outcome === 'voided' ? 2 : s.outcome === 'held' ? 2 : 3;
  const done = step >= STEPS.length;
  const progress = Math.min(step, stopAt) / (STEPS.length - 1);

  return (
    <div ref={root} className="rounded-xl border border-[var(--gray-200)] bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--gray-200)] px-5 py-3">
        <div role="tablist" aria-label="Example payments" className="flex flex-wrap gap-1">
          {FLOW_SCENARIOS.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => choose(i)}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                i === active
                  ? 'bg-[var(--gray-100)] text-[var(--gray-900)]'
                  : 'text-[var(--gray-600)] hover:text-[var(--gray-900)]'
              }`}
            >
              {x.payee} <span className="tabular-nums text-[var(--gray-500)]">{x.amount}</span>
            </button>
          ))}
        </div>
        {!reduced ? (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="btn ml-auto text-[13px] text-[var(--gray-600)]"
          >
            {paused ? 'Play' : 'Pause'}
          </button>
        ) : null}
      </div>

      <div className="px-5 py-8 md:px-8">
        <ol className="flow-track relative grid gap-6 md:grid-cols-4 md:gap-4" aria-live="polite">
          <span aria-hidden="true" className="flow-rail" />
          <span
            aria-hidden="true"
            className={`flow-fill flow-${s.outcome}`}
            style={{ ['--p' as string]: progress }}
          />
          {STEPS.map((label, i) => {
            const reached = step > i || done;
            const blocked = s.outcome === 'voided' && i > stopAt && (done || step > stopAt);
            const current = !done && step === i;
            return (
              <li key={label} className="relative flex gap-3 md:flex-col md:items-start md:gap-3">
                <span
                  className={`flow-node ${reached && !blocked ? `is-reached flow-${s.outcome}` : ''} ${
                    current ? 'is-current' : ''
                  } ${blocked ? 'is-blocked' : ''}`}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--gray-900)]">{label}</p>
                  <p
                    className={`mt-0.5 text-[13px] tabular-nums transition-opacity duration-300 ${
                      reached || current ? 'opacity-100' : 'opacity-40'
                    } ${blocked ? 'text-[var(--gray-500)] line-through' : 'text-[var(--gray-600)]'}`}
                  >
                    {stepDetail(s, i)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div
          className={`mt-8 flex flex-col gap-3 rounded-lg border border-[var(--gray-200)] bg-[var(--gray-25)] p-4 transition-opacity duration-300 md:flex-row md:items-center ${
            done ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={!done}
        >
          <span className={`chip self-start md:self-auto ${OUTCOME[s.outcome].tone}`}>
            {OUTCOME[s.outcome].label}
          </span>
          <p className="text-[14px] text-[var(--gray-700)]">{OUTCOME[s.outcome].detail}</p>
          <code className="font-mono text-[12px] text-[var(--gray-500)] md:ml-auto">{s.event}</code>
        </div>
      </div>
    </div>
  );
}
