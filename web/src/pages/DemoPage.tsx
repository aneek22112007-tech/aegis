import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { approvePayment, DEMO_MODE, denyPayment, runDemo, type PaymentView } from '../api';
import { resetState } from '../demo/store';
import { Phone } from '../demo-ui/Phone';
import { RiskGauge } from '../demo-ui/RiskGauge';
import {
  SCENARIOS,
  STEPS,
  stepIndex,
  TONE_COLOR,
  verdictFor,
  type Phase,
  type Scenario,
} from '../demo-ui/scenarios';
import { ShieldMark } from '../landing/ShieldMark';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function DemoPage() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Scenario | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [payment, setPayment] = useState<PaymentView | null>(null);
  const [guardian, setGuardian] = useState<'approved' | 'denied' | null>(null);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);
  const runId = useRef(0);
  const pace = reduce ? 0 : 750;

  // The senior screens scale the root font; this page uses the landing page's type scale.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = '16px';
    return () => {
      root.style.fontSize = previous;
    };
  }, []);

  async function run(scenario: Scenario) {
    const id = ++runId.current;
    setActive(scenario);
    setPayment(null);
    setGuardian(null);
    setError('');
    setPhase('authorize');
    try {
      const [body] = await Promise.all([runDemo(scenario.id), wait(pace)]);
      if (id !== runId.current) return;
      setPayment(body.payment);
      setPhase('score');
      await wait(pace * 1.6);
      if (id !== runId.current) return;
      setPhase('decide');
      await wait(pace);
      if (id !== runId.current) return;
      setPhase('done');
      if (body.payment.outcome !== 'waiting') markDone(scenario.id);
    } catch (cause) {
      if (id !== runId.current) return;
      setPhase('error');
      setError(cause instanceof Error ? cause.message : 'Please try that again.');
    }
  }

  function markDone(id: string) {
    setCompleted((list) => (list.includes(id) ? list : [...list, id]));
  }

  async function decide(choice: 'approved' | 'denied') {
    if (!payment) return;
    setDeciding(true);
    try {
      const body =
        choice === 'approved' ? await approvePayment(payment.id) : await denyPayment(payment.id);
      setPayment(body.payment);
      setGuardian(choice);
      if (active) markDone(active.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try that again.');
    } finally {
      setDeciding(false);
    }
  }

  function startOver() {
    runId.current++;
    if (DEMO_MODE) resetState();
    setActive(null);
    setPayment(null);
    setGuardian(null);
    setPhase('idle');
    setError('');
    setCompleted([]);
  }

  const busy = phase === 'authorize' || phase === 'score' || phase === 'decide' || deciding;
  const step = stepIndex(phase);
  const verdict = payment && phase === 'done' ? verdictFor(payment, guardian) : null;
  const waiting = verdict !== null && payment?.outcome === 'waiting';

  return (
    <MotionConfig reducedMotion="user">
      <div className="landing relative min-h-screen bg-[#04060c] font-[Inter,ui-sans-serif,system-ui] text-white antialiased">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[1100px] bg-[radial-gradient(60%_40%_at_70%_0%,rgba(52,245,176,0.12),transparent),radial-gradient(40%_40%_at_0%_100%,rgba(124,140,255,0.12),transparent)]"
        />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-wide">
            <ShieldMark /> AEGIS
          </Link>
          <nav aria-label="Demo" className="flex items-center gap-2 text-sm">
            <Link
              className="hidden rounded-full px-3 py-2 text-white/70 hover:text-white sm:inline"
              to="/guardian"
            >
              Dashboard
            </Link>
            <Link
              className="hidden rounded-full px-3 py-2 text-white/70 hover:text-white sm:inline"
              to="/audit"
            >
              Lure Log
            </Link>
            <button
              type="button"
              onClick={startOver}
              className="rounded-full border border-white/15 px-4 py-2 font-medium hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#34f5b0]"
            >
              Start over
            </button>
          </nav>
        </header>

        <main id="main" className="relative mx-auto max-w-6xl px-5 pb-20">
          <p className="text-sm font-medium text-[#34f5b0]">Live demo</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Watch AEGIS decide three payments.
          </h1>
          <p className="mt-3 max-w-2xl text-white/65">
            Each one is authorized, scored against Margaret’s own rules, then captured, held for her
            daughter Priya, or voided before any money moves.{' '}
            {DEMO_MODE
              ? 'This copy runs in your browser with a practice merchant.'
              : 'With no PayPal login, the server uses a practice merchant.'}
          </p>

          <ol className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Scenarios">
            {SCENARIOS.map((scenario, i) => {
              const selected = active?.id === scenario.id;
              const done = completed.includes(scenario.id);
              return (
                <li key={scenario.id}>
                  <button
                    type="button"
                    disabled={busy}
                    aria-pressed={selected}
                    aria-label={`Run ${scenario.payee} ${scenario.amount}`}
                    onClick={() => void run(scenario)}
                    className={`group h-full w-full rounded-2xl border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34f5b0] disabled:cursor-wait ${
                      selected
                        ? 'border-white/40 bg-white/[0.08]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="flex items-center justify-between text-xs text-white/50">
                      <span>Scenario {i + 1}</span>
                      <span
                        className="rounded-full px-2 py-0.5 font-medium"
                        style={{
                          color: TONE_COLOR[scenario.tone],
                          background: `${TONE_COLOR[scenario.tone]}1a`,
                        }}
                      >
                        {done ? 'Done ✓' : scenario.tag}
                      </span>
                    </span>
                    <span className="mt-3 block text-2xl font-semibold tabular-nums">
                      {scenario.amount}
                    </span>
                    <span className="block font-medium">{scenario.payee}</span>
                    <span className="mt-1 block text-sm text-white/55">“{scenario.note}”</span>
                    <span className="mt-4 block text-sm text-white/70">
                      Expect: {scenario.expect}{' '}
                      <span aria-hidden="true" className="transition group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {error ? (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-[#ff5c7a]/40 bg-[#ff5c7a]/10 px-4 py-3"
            >
              {error}
            </p>
          ) : null}

          <section
            aria-label="Payment pipeline"
            className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              {active ? (
                <>
                  <p className="text-sm text-white/55">
                    {active.payee} · {active.amount}
                  </p>
                  <ol className="mt-5 space-y-4" aria-live="polite">
                    {STEPS.map((s, i) => {
                      const state = step > i ? 'done' : step === i ? 'active' : 'todo';
                      return (
                        <li key={s.key} className="flex gap-4">
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm ${
                              state === 'done'
                                ? 'border-[#34f5b0] bg-[#34f5b0]/15 text-[#34f5b0]'
                                : state === 'active'
                                  ? 'animate-pulse border-white/60 text-white'
                                  : 'border-white/15 text-white/40'
                            }`}
                          >
                            {state === 'done' ? '✓' : i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={state === 'todo' ? 'text-white/40' : 'font-medium'}>
                              {s.label}
                              <span className="sr-only">
                                {state === 'done'
                                  ? ' complete'
                                  : state === 'active'
                                    ? ' in progress'
                                    : ''}
                              </span>
                            </p>
                            <p className="text-sm text-white/45">{s.hint}</p>
                            {s.key === 'authorize' && payment && step >= 1 ? (
                              <p className="mt-1 font-mono text-xs text-white/60">
                                Order {payment.paypalOrderId ?? 'practice'} authorized
                              </p>
                            ) : null}
                            {s.key === 'score' && payment && step >= 1 ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 grid items-start gap-4 sm:grid-cols-[10rem_1fr]"
                              >
                                <RiskGauge score={payment.score} />
                                <ul className="space-y-1.5 text-sm text-white/75">
                                  {payment.reasons.length ? (
                                    payment.reasons.map((reason) => (
                                      <li key={reason} className="flex gap-2">
                                        <span aria-hidden="true" className="text-white/35">
                                          •
                                        </span>
                                        {reason}
                                      </li>
                                    ))
                                  ) : (
                                    <li>Nothing unusual. It matches her history.</li>
                                  )}
                                </ul>
                              </motion.div>
                            ) : null}
                            {s.key === 'decide' && verdict ? (
                              <motion.p
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold"
                                style={{
                                  color: TONE_COLOR[verdict.tone],
                                  background: `${TONE_COLOR[verdict.tone]}1f`,
                                }}
                              >
                                {verdict.title}
                              </motion.p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>

                  <AnimatePresence>
                    {verdict && payment ? (
                      <motion.div
                        key={`${payment.id}-${verdict.title}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 rounded-2xl border p-5"
                        style={{ borderColor: `${TONE_COLOR[verdict.tone]}55` }}
                        role="status"
                      >
                        <h2 className="text-xl font-semibold">{payment.message}</h2>
                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                          <div>
                            <dt className="text-white/45">Result</dt>
                            <dd>{verdict.action}</dd>
                          </div>
                          <div>
                            <dt className="text-white/45">Risk</dt>
                            <dd className="tabular-nums">{payment.score ?? '–'} / 100</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-white/45">PayPal order</dt>
                            <dd className="truncate font-mono text-xs leading-5">
                              {payment.paypalOrderId ?? '—'}
                            </dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-white/45">AEGIS id</dt>
                            <dd className="truncate font-mono text-xs leading-5">{payment.id}</dd>
                          </div>
                        </dl>
                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                          <Link
                            to="/audit"
                            className="rounded-full bg-white px-4 py-2 font-medium text-black"
                          >
                            Open in Lure Log →
                          </Link>
                          {waiting ? (
                            <a
                              href="#guardian-phone"
                              className="self-center text-[#ffc857] underline-offset-4 hover:underline"
                            >
                              Decide on Priya’s phone →
                            </a>
                          ) : (
                            <NextButton
                              completed={completed}
                              onRun={(s) => void run(s)}
                              disabled={busy}
                            />
                          )}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </>
              ) : (
                <div className="grid h-full min-h-56 place-items-center text-center text-white/55">
                  <p>
                    Pick a scenario above to start.
                    <br />
                    <span className="text-sm">Tab and Enter work too.</span>
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 self-start sm:gap-5 lg:sticky lg:top-6">
              <Phone label="Margaret">
                <p className="text-xs text-white/50">Paying</p>
                <p className="text-lg font-semibold">{active?.payee ?? 'Choose a payment'}</p>
                <p className="text-3xl font-semibold tabular-nums">{active?.amount ?? ''}</p>
                <div className="mt-auto rounded-2xl bg-white/[0.06] p-3 text-sm">
                  {!active
                    ? 'Her rules are on.'
                    : verdict
                      ? payment?.outcome === 'sent'
                        ? '✓ Sent.'
                        : waiting
                          ? '⏳ Waiting for Priya.'
                          : '🛡 Stopped. No money moved.'
                      : 'Checking…'}
                </div>
              </Phone>
              <Phone label="Priya, guardian" id="guardian-phone">
                <p className="text-xs text-white/50">AEGIS alerts</p>
                {waiting && payment ? (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 rounded-2xl border border-[#ffc857]/40 bg-[#ffc857]/10 p-3"
                  >
                    <p className="text-xs text-[#ffc857]">Needs you</p>
                    <p className="text-sm font-semibold">
                      {payment.amount} to {payment.payeeName}
                    </p>
                    <div className="mt-3 grid gap-2">
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => void decide('denied')}
                        className="rounded-xl border border-[#ff5c7a]/60 py-2 text-sm font-semibold text-[#ff5c7a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                      >
                        Deny
                      </button>
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => void decide('approved')}
                        className="rounded-xl bg-[#34f5b0] py-2 text-sm font-semibold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                      >
                        Approve
                      </button>
                    </div>
                  </motion.div>
                ) : verdict && payment ? (
                  <p className="mt-2 rounded-2xl bg-white/[0.06] p-3 text-sm">
                    {guardian
                      ? `You ${guardian} ${payment.amount} to ${payment.payeeName}.`
                      : payment.outcome === 'stopped'
                        ? `Blocked ${payment.payeeName}. A report draft is ready.`
                        : 'Nothing needs you.'}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-white/50">All quiet.</p>
                )}
              </Phone>
            </div>
          </section>
        </main>
      </div>
    </MotionConfig>
  );
}

function NextButton({
  completed,
  onRun,
  disabled,
}: {
  completed: string[];
  onRun: (scenario: Scenario) => void;
  disabled: boolean;
}) {
  const next = SCENARIOS.find((s) => !completed.includes(s.id));
  if (!next) return <span className="self-center text-white/60">All three done.</span>;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onRun(next)}
      className="rounded-full border border-white/20 px-4 py-2 font-medium hover:bg-white/10"
    >
      Next: {next.payee} {next.amount}
    </button>
  );
}
