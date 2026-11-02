import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { approvePayment, DEMO_MODE, denyPayment, runDemo, type PaymentView } from '../api';
import { TimelineItems } from '../dashboard/PaymentDrawer';
import { buildTimeline } from '../dashboard/timeline';
import { resetState } from '../demo/store';
import { SCENARIOS, TONE_CHIP, verdictFor, type Phase, type Scenario } from '../demo-ui/scenarios';
import { Chip } from '../ui/Chip';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { useProductType } from '../ui/useProductType';
import { riskChip, shortId, statusChip } from '../ui/status';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type LogEvent = { id: string; type: string; at: Date; summary: string; source: 'aegis' | 'paypal' };

function eventId() {
  return `evt_${Math.random().toString(36).slice(2, 12)}`;
}

function time(at: Date) {
  return at.toLocaleTimeString('en-US', { hour12: false });
}

export function DemoPage() {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [active, setActive] = useState<Scenario | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [payment, setPayment] = useState<PaymentView | null>(null);
  const [guardian, setGuardian] = useState<'approved' | 'denied' | null>(null);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState('');
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const runId = useRef(0);
  const pace = reduce ? 0 : 450;

  useProductType();

  function log(type: string, summary: string, source: LogEvent['source'] = 'aegis') {
    setEvents((list) => [{ id: eventId(), type, at: new Date(), summary, source }, ...list]);
  }

  async function run(scenario: Scenario) {
    const id = ++runId.current;
    setActive(scenario);
    setPayment(null);
    setGuardian(null);
    setError('');
    setPhase('authorize');
    log('payment.created', `${scenario.amount} to ${scenario.payee}`);
    try {
      const [body] = await Promise.all([runDemo(scenario.id), wait(pace)]);
      if (id !== runId.current) return;
      const p = body.payment;
      setPayment(p);
      log(
        'PAYMENT.AUTHORIZATION.CREATED',
        `Order ${p.paypalOrderId ?? 'practice'} · intent AUTHORIZE`,
        'paypal',
      );
      setPhase('score');
      await wait(pace);
      if (id !== runId.current) return;
      log('risk.scored', `Score ${p.score ?? '–'} · ${riskChip(p.level).label}`);
      setPhase('decide');
      await wait(pace);
      if (id !== runId.current) return;
      if (p.outcome === 'sent') log('PAYMENT.CAPTURE.COMPLETED', `${p.amount} captured`, 'paypal');
      else if (p.outcome === 'waiting') log('guardian.alert.created', 'Sent to Priya for review');
      else log('PAYMENT.AUTHORIZATION.VOIDED', 'Voided before capture', 'paypal');
      setPhase('done');
      if (p.outcome !== 'waiting') markDone(scenario.id);
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
      log(`guardian.${choice}`, `Priya ${choice} ${body.payment.amount}`);
      log(
        choice === 'approved' ? 'PAYMENT.CAPTURE.COMPLETED' : 'PAYMENT.AUTHORIZATION.VOIDED',
        choice === 'approved' ? `${body.payment.amount} captured` : 'Voided before capture',
        'paypal',
      );
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
    setEvents([]);
    setCompleted([]);
  }

  const busy = phase === 'authorize' || phase === 'score' || phase === 'decide' || deciding;
  const verdict = payment && phase === 'done' ? verdictFor(payment, guardian) : null;
  const waiting = verdict !== null && payment?.outcome === 'waiting';
  const steps =
    payment && phase === 'done'
      ? buildTimeline(payment)
      : payment
        ? buildTimeline({
            ...payment,
            status: 'authorized',
            score: phase === 'authorize' ? null : payment.score,
          })
        : [];

  return (
    <div className="ui min-h-screen bg-[var(--gray-50)] text-[var(--gray-900)]">
      <div className="bg-[#c2410c] px-4 py-1.5 text-center text-[12px] font-medium text-white">
        Test mode · Sandbox data only. No real money moves.
      </div>
      <header className="border-b border-[var(--gray-200)] bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-5">
          <Link to="/" aria-label="AEGIS home">
            <Logo />
          </Link>
          <span className="hidden text-[var(--gray-300)] sm:inline">/</span>
          <span className="hidden text-[14px] font-medium sm:inline">Sandbox</span>
          <nav aria-label="Demo" className="ml-auto flex items-center gap-1 text-[13px]">
            <Link className="btn hidden text-[var(--gray-600)] sm:inline-flex" to="/guardian">
              Dashboard
            </Link>
            <Link className="btn hidden text-[var(--gray-600)] sm:inline-flex" to="/audit">
              Lure Log
            </Link>
            <button
              type="button"
              onClick={startOver}
              className="btn btn-secondary"
              aria-label="Start over"
            >
              <Icon name="refresh" />
              <span className="hidden sm:inline">Start over</span>
              <span className="sm:hidden">Reset</span>
            </button>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Run a test payment</h1>
        <p className="mt-1 max-w-2xl text-[14px] text-[var(--gray-600)]">
          Each scenario creates a PayPal order with intent AUTHORIZE, scores it against Margaret’s
          rules, then captures, holds or voids it.{' '}
          {DEMO_MODE
            ? 'This copy runs entirely in your browser.'
            : 'Without PayPal credentials the server uses a practice merchant.'}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <section aria-labelledby="scenarios-title" className="panel self-start bg-white">
            <h2
              id="scenarios-title"
              className="border-b border-[var(--gray-200)] px-4 py-3 text-[13px] font-semibold"
            >
              Scenarios
            </h2>
            <ul aria-label="Scenarios" className="divide-y divide-[var(--gray-200)]">
              {SCENARIOS.map((scenario) => {
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
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left disabled:cursor-wait ${
                        selected ? 'bg-[var(--brand-50)]' : 'hover:bg-[var(--gray-25)]'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-medium">{scenario.payee}</span>
                          <span className="tabular-nums text-[14px] font-medium">
                            {scenario.amount}
                          </span>
                        </span>
                        <span className="block truncate text-[12px] text-[var(--gray-500)]">
                          “{scenario.note}”
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <Chip tone={TONE_CHIP[scenario.tone]}>{scenario.tag}</Chip>
                          {done ? (
                            <span className="inline-flex items-center gap-1 text-[12px] text-[var(--ok)]">
                              <Icon name="check" /> Done
                            </span>
                          ) : (
                            <span className="text-[12px] text-[var(--gray-500)]">
                              {scenario.expect}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="flex min-w-0 flex-col gap-6">
            {error ? (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-md border border-[#f4c7c2] bg-[var(--bad-bg)] px-3 py-2 text-[13px] text-[var(--bad)]"
              >
                <Icon name="alert" />
                {error}
              </p>
            ) : null}

            <section aria-label="Payment pipeline" className="panel bg-white">
              {active ? (
                <div className="grid gap-0 md:grid-cols-[1fr_260px]">
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {payment ? (
                        <Chip
                          tone={statusChip(phase === 'done' ? payment.status : 'authorized').tone}
                        >
                          {phase === 'done' ? statusChip(payment.status).label : 'Processing'}
                        </Chip>
                      ) : (
                        <Chip tone="neutral">Authorizing…</Chip>
                      )}
                      {payment && phase !== 'authorize' ? (
                        <Chip tone={riskChip(payment.level).tone}>
                          Risk {payment.score ?? '–'} · {riskChip(payment.level).label}
                        </Chip>
                      ) : null}
                    </div>
                    <p className="mt-3 text-[20px] font-semibold tracking-[-0.01em]">
                      {active.amount} to {active.payee}
                    </p>
                    <p className="text-[13px] text-[var(--gray-500)]">“{active.note}”</p>

                    {verdict && payment ? (
                      <div
                        role="status"
                        className="mt-4 rounded-md border border-[var(--gray-200)] bg-[var(--gray-25)] px-4 py-3"
                      >
                        <p className="text-[14px] font-semibold">{verdict.title}</p>
                        <p className="text-[13px] text-[var(--gray-600)]">{payment.message}</p>
                      </div>
                    ) : (
                      <p role="status" className="mt-4 text-[13px] text-[var(--gray-500)]">
                        {phase === 'authorize'
                          ? 'Creating the PayPal authorization…'
                          : phase === 'error'
                            ? ''
                            : 'Scoring against Margaret’s rules…'}
                      </p>
                    )}

                    {waiting ? (
                      <div className="mt-4 rounded-md border border-[#f1d9a6] bg-[var(--warn-bg)] p-4">
                        <p className="text-[13px] font-medium text-[var(--warn)]">
                          Priya’s approval inbox
                        </p>
                        <p className="mt-1 text-[13px] text-[var(--gray-700)]">
                          The money is reserved, not sent. Approve to capture or deny to void.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={deciding}
                            onClick={() => void decide('denied')}
                            className="btn btn-danger"
                          >
                            Deny
                          </button>
                          <button
                            type="button"
                            disabled={deciding}
                            onClick={() => void decide('approved')}
                            className="btn btn-primary"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {payment && payment.reasons.length && phase !== 'authorize' ? (
                      <>
                        <h3 className="mt-5 text-[13px] font-semibold">Why AEGIS decided this</h3>
                        <ul className="mt-2 divide-y divide-[var(--gray-100)] rounded-md border border-[var(--gray-200)] text-[13px]">
                          {payment.reasons.map((reason) => (
                            <li key={reason} className="px-3 py-2">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    {payment ? (
                      <dl className="mt-5 grid grid-cols-[120px_1fr] gap-y-1.5 text-[13px]">
                        <dt className="text-[var(--gray-500)]">Payment ID</dt>
                        <dd className="mono truncate">{shortId(payment.id)}</dd>
                        <dt className="text-[var(--gray-500)]">PayPal order</dt>
                        <dd className="mono truncate">{payment.paypalOrderId ?? '—'}</dd>
                      </dl>
                    ) : null}

                    {verdict && !waiting ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link to="/audit" className="btn btn-secondary">
                          Open in Lure Log
                        </Link>
                        <NextButton
                          completed={completed}
                          onRun={(s) => void run(s)}
                          disabled={busy}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="border-t border-[var(--gray-200)] p-5 md:border-l md:border-t-0">
                    <h3 className="label mb-3">Timeline</h3>
                    <ol aria-live="polite">
                      {steps.length ? (
                        <TimelineItems steps={steps} />
                      ) : (
                        <li className="text-[13px] text-[var(--gray-500)]">Waiting for PayPal…</li>
                      )}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="grid min-h-48 place-items-center p-8 text-center text-[13px] text-[var(--gray-500)]">
                  <p>
                    Choose a scenario to send a test payment.
                    <br />
                    Events will appear in the log below.
                  </p>
                </div>
              )}
            </section>

            <section aria-labelledby="events-title" className="panel overflow-hidden bg-white">
              <div className="flex items-center justify-between border-b border-[var(--gray-200)] px-4 py-3">
                <h2 id="events-title" className="text-[13px] font-semibold">
                  Events
                </h2>
                <span className="text-[12px] text-[var(--gray-500)]">{events.length} events</span>
              </div>
              {events.length ? (
                <div className="overflow-x-auto">
                  <table className="table min-w-[560px]" aria-label="Webhook events">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Event</th>
                        <th>Details</th>
                        <th>ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.id}>
                          <td className="mono whitespace-nowrap text-[var(--gray-500)]">
                            {time(event.at)}
                          </td>
                          <td className="mono whitespace-nowrap">
                            <span
                              className={event.source === 'paypal' ? 'text-[var(--brand)]' : ''}
                            >
                              {event.type}
                            </span>
                          </td>
                          <td className="text-[var(--gray-600)]">{event.summary}</td>
                          <td className="mono text-[var(--gray-500)]">{event.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-4 py-6 text-[13px] text-[var(--gray-500)]">No events yet.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
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
  if (!next)
    return (
      <span className="self-center text-[13px] text-[var(--gray-500)]">
        All three scenarios done.
      </span>
    );
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onRun(next)}
      className="btn btn-primary"
    >
      Next: {next.payee} {next.amount}
    </button>
  );
}
