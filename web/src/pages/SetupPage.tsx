import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { compileMandate, getMandate } from '../api';
import { GUARDIAN } from '../demo/backend';
import { evaluateRisk } from '../engine/evaluate';
import { heuristicCompile } from '../engine/heuristic';
import { matchesList } from '../engine/match';
import {
  applyOverrides,
  isActive,
  loadOverrides,
  saveOverrides,
  type RuleId,
  type RuleOverrides,
} from '../rules/overrides';
import { agoLabel, Avatar, field, PageTitle, Pill, primaryBtn, secondaryBtn } from '../senior/ui';
import { Icon, type IconName } from '../ui/Icon';

export const EXAMPLES = [
  'Never send more than $500 to someone new.',
  'Always allow my pharmacy and my utility company.',
  'If it says urgent and secret, stop it and call my daughter.',
  'Never send more than $1,000 in one payment.',
];

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function Switch({ on, label, onChange }: { on: boolean; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-8 w-14 flex-none rounded-full transition-colors ${on ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 h-6 w-6 rounded-full bg-[var(--card)] shadow-sm transition-[left] ${on ? 'left-7' : 'left-1'}`}
      />
    </button>
  );
}

function RuleCard({
  icon,
  title,
  summary,
  on,
  onToggle,
  onRemove,
  children,
}: {
  icon: IconName;
  title: string;
  summary: string;
  on: boolean;
  onToggle: () => void;
  onRemove: () => void;
  children?: ReactNode;
}) {
  return (
    <li className={`rule-card s-card p-4 sm:p-5 ${on ? '' : 'is-off'}`}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="hidden h-10 w-10 flex-none place-items-center rounded-xl bg-[var(--bg)] text-[var(--accent)] sm:grid"
        >
          <Icon name={icon} size={20} />
        </span>
        <h3 className="min-w-0 flex-1 text-[0.95rem] font-semibold leading-snug">
          {title}
          {on ? null : (
            <span className="ml-2 align-middle">
              <Pill tone="neutral">Off</Pill>
            </span>
          )}
        </h3>
        <Switch on={on} label={`${title}: ${on ? 'on' : 'off'}`} onChange={onToggle} />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          className="-mr-2 grid h-11 w-11 flex-none place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--danger)]"
        >
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="sm:pl-[3.25rem]">
        <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--muted)]">{summary}</p>
        {children && on ? <div className="mt-3">{children}</div> : null}
      </div>
    </li>
  );
}

function MoneyInput({
  id,
  label,
  name,
  value,
  onChange,
}: {
  id: string;
  label: string;
  name: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label htmlFor={id} className="flex flex-wrap items-center gap-3 text-[0.85rem]">
      <span className="font-semibold">{label}</span>
      <span className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        >
          $
        </span>
        <input
          id={id}
          aria-label={name}
          inputMode="numeric"
          className={`${field} !min-h-12 w-40 pl-8 tabular-nums`}
          value={String(value)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^0-9]/g, ''));
            if (Number.isFinite(n) && n > 0) onChange(n);
          }}
        />
      </span>
    </label>
  );
}

const PRESETS = [
  { payeeName: 'Officer James', amount: 1900, note: 'Urgent and secret: grandson bail' },
  { payeeName: 'CVS Pharmacy', amount: 48, note: 'Prescription refill' },
  { payeeName: 'Helen Brooks', amount: 650, note: 'Birthday gift' },
];

function TestPayment({ policy }: { policy: ReturnType<typeof applyOverrides> }) {
  const [t, setT] = useState(PRESETS[0]);
  const result = useMemo(
    () =>
      evaluateRisk({
        amount: t.amount || 0,
        payeeName: t.payeeName,
        note: t.note,
        payeeStatus: matchesList(t.payeeName, policy.alwaysAllow) ? 'trusted' : 'unknown',
        recentPaymentCount: 0,
        recentPaymentTotal: 0,
        historyAmounts: [],
        now: new Date(new Date().setHours(12, 0, 0, 0)),
        policy,
      }),
    [t, policy],
  );
  const out =
    result.decision === 'capture'
      ? { tone: 'ok' as const, label: 'Would be sent' }
      : result.decision === 'hold'
        ? { tone: 'warn' as const, label: `Would wait for ${GUARDIAN.name}` }
        : { tone: 'bad' as const, label: 'Would be stopped' };
  return (
    <section aria-labelledby="test-title" className="s-card p-5">
      <h2 id="test-title" className="flex items-center gap-2 text-[0.95rem] font-semibold">
        <Icon name="flask" size={20} />
        Test a payment against your rules
      </h2>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Example payments">
        {PRESETS.map((p) => (
          <button
            key={p.payeeName}
            type="button"
            aria-pressed={p.payeeName === t.payeeName}
            onClick={() => setT(p)}
            className="setup-chip"
          >
            {p.payeeName}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-[0.8rem] font-semibold" htmlFor="test-payee">
          Who
          <input
            id="test-payee"
            className={`${field} !min-h-12`}
            value={t.payeeName}
            onChange={(e) => setT({ ...t, payeeName: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-[7rem_1fr] gap-3">
          <label className="grid gap-1 text-[0.8rem] font-semibold" htmlFor="test-amount">
            Amount
            <input
              id="test-amount"
              inputMode="decimal"
              className={`${field} !min-h-12 tabular-nums`}
              value={String(t.amount)}
              onChange={(e) =>
                setT({ ...t, amount: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })
              }
            />
          </label>
          <label className="grid min-w-0 gap-1 text-[0.8rem] font-semibold" htmlFor="test-note">
            Note
            <input
              id="test-note"
              className={`${field} !min-h-12`}
              value={t.note}
              onChange={(e) => setT({ ...t, note: e.target.value })}
            />
          </label>
        </div>
      </div>
      <div
        aria-live="polite"
        className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={out.tone}>{out.label}</Pill>
          <span className="text-[0.8rem] tabular-nums text-[var(--muted)]">
            Risk {result.score} of 100
          </span>
        </div>
        {result.reasons.length ? (
          <ul className="mt-3 flex flex-col gap-1.5 text-[0.8rem] leading-relaxed">
            {result.reasons.slice(0, 3).map((r) => (
              <li key={r} className="border-l-2 border-[var(--line)] pl-3">
                {r}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[0.8rem] text-[var(--muted)]">Nothing in your rules objects.</p>
        )}
      </div>
    </section>
  );
}

export function SetupPage() {
  const [text, setText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [overrides, setOverrides] = useState<RuleOverrides>(() => loadOverrides());
  const [savedOverrides, setSavedOverrides] = useState(() => JSON.stringify(loadOverrides()));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    void getMandate()
      .then((body) => {
        const raw = body.mandate?.rawText || '';
        setText(raw);
        setSavedText(raw);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Please try that again.');
      });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(false), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const parsed = useMemo(() => heuristicCompile(text, GUARDIAN), [text]);
  const policy = useMemo(() => applyOverrides(parsed, overrides), [parsed, overrides]);
  const dirty = text !== savedText || JSON.stringify(overrides) !== savedOverrides;

  const patch = (p: Partial<RuleOverrides>) => setOverrides((o) => ({ ...o, ...p }));
  const toggle = (id: RuleId) =>
    patch({
      off: overrides.off.includes(id)
        ? overrides.off.filter((x) => x !== id)
        : [...overrides.off, id],
    });
  const remove = (id: RuleId) => patch({ removed: [...overrides.removed, id] });
  const shown = (id: RuleId) => !overrides.removed.includes(id);

  function addExample(sentence: string) {
    if (text.toLowerCase().includes(sentence.toLowerCase())) return;
    setText((t) => (t.trim() ? `${t.trim()} ${sentence}` : sentence));
    area.current?.focus();
  }

  async function save() {
    setBusy(true);
    setError('');
    try {
      await compileMandate(text);
      const next = saveOverrides({ ...overrides, editedAt: undefined });
      setOverrides(next);
      setSavedOverrides(JSON.stringify(next));
      setSavedText(text);
      setToast(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try that again.');
    } finally {
      setBusy(false);
    }
  }

  function discard() {
    setText(savedText);
    setOverrides(JSON.parse(savedOverrides) as RuleOverrides);
  }

  const allow = parsed.alwaysAllow.filter(
    (a) => !overrides.removedAllow.some((r) => r.toLowerCase() === a.toLowerCase()),
  );
  const scamWords = parsed.scamKeywords.slice(0, 6);
  const editedAt = overrides.editedAt;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:pt-10">
      <PageTitle
        title="Your rules"
        lead="Write them the way you would say them. AEGIS turns them into checks on every payment."
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="s-card flex flex-col gap-4 p-5">
            <label id="wishes-label" className="text-[0.95rem] font-semibold" htmlFor="wishes">
              What should always be true?
            </label>
            <textarea
              id="wishes"
              ref={area}
              className={`${field} min-h-40 py-4 leading-relaxed`}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <div>
              <p className="text-[0.8rem] font-semibold text-[var(--muted)]">Add a sentence</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLES.map((s) => {
                  const added = text.toLowerCase().includes(s.toLowerCase());
                  return (
                    <button
                      key={s}
                      type="button"
                      className="setup-chip"
                      aria-pressed={added}
                      onClick={() => addExample(s)}
                    >
                      <Icon name={added ? 'check' : 'plus'} size={16} />
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            {error ? (
              <p
                role="alert"
                className="rounded-2xl bg-[var(--danger)] px-5 py-4 font-semibold text-white"
              >
                {error}
              </p>
            ) : null}
          </section>

          <section aria-labelledby="understood-title">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="understood-title" className="text-[1.05rem] font-semibold">
                What AEGIS understood
              </h2>
              {overrides.removed.length ? (
                <button
                  type="button"
                  className="text-[0.8rem] font-semibold text-[var(--accent)]"
                  onClick={() => patch({ removed: [] })}
                >
                  Restore removed rules ({overrides.removed.length})
                </button>
              ) : (
                <span className="text-[0.8rem] text-[var(--muted)]">Updates as you type</span>
              )}
            </div>
            <ul className="mt-3 flex flex-col gap-3">
              {shown('newPayee') ? (
                <RuleCard
                  icon="user"
                  title="Limit for someone new"
                  summary={`Payments over ${money(overrides.newPayeeLimit ?? parsed.maxNewPayee)} to someone you have not paid before wait for ${GUARDIAN.name}.`}
                  on={isActive(overrides, 'newPayee')}
                  onToggle={() => toggle('newPayee')}
                  onRemove={() => remove('newPayee')}
                >
                  <MoneyInput
                    id="limit-new"
                    name="Limit for someone new"
                    label="Limit"
                    value={overrides.newPayeeLimit ?? parsed.maxNewPayee}
                    onChange={(n) => patch({ newPayeeLimit: n })}
                  />
                </RuleCard>
              ) : null}
              {shown('allow') ? (
                <RuleCard
                  icon="check"
                  title="Always allow"
                  summary={
                    allow.length
                      ? 'These payees go straight through, with no extra check.'
                      : 'Nobody yet. Try “Always allow my pharmacy.”'
                  }
                  on={isActive(overrides, 'allow')}
                  onToggle={() => toggle('allow')}
                  onRemove={() => remove('allow')}
                >
                  {allow.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {allow.map((a) => (
                        <li key={a} className="setup-tag">
                          <span className="capitalize">{a}</span>
                          <button
                            type="button"
                            aria-label={`Stop always allowing ${a}`}
                            onClick={() => patch({ removedAllow: [...overrides.removedAllow, a] })}
                            className="grid h-7 w-7 place-items-center rounded-full hover:bg-[var(--line)]"
                          >
                            <Icon name="close" size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </RuleCard>
              ) : null}
              {shown('scam') ? (
                <RuleCard
                  icon="alert"
                  title="Stop scam words"
                  summary={`If a note says words like these, AEGIS stops the payment and calls ${GUARDIAN.name}.`}
                  on={isActive(overrides, 'scam')}
                  onToggle={() => toggle('scam')}
                  onRemove={() => remove('scam')}
                >
                  <ul className="flex flex-wrap gap-2">
                    {scamWords.map((w) => (
                      <li key={w} className="setup-tag">
                        {w}
                      </li>
                    ))}
                  </ul>
                </RuleCard>
              ) : null}
              {shown('limits') ? (
                <RuleCard
                  icon="card"
                  title="Most in one payment"
                  summary={`No single payment over ${money(overrides.perPaymentLimit ?? parsed.maxPerTxn)}. A day stops at ${money(parsed.dailyLimit)}.`}
                  on={isActive(overrides, 'limits')}
                  onToggle={() => toggle('limits')}
                  onRemove={() => remove('limits')}
                >
                  <MoneyInput
                    id="limit-one"
                    name="Most in one payment"
                    label="Limit"
                    value={overrides.perPaymentLimit ?? parsed.maxPerTxn}
                    onChange={(n) => patch({ perPaymentLimit: n })}
                  />
                </RuleCard>
              ) : null}
              {shown('quiet') ? (
                <RuleCard
                  icon="clock"
                  title="Quiet hours"
                  summary={`Payments between ${parsed.quietHours.start} and ${parsed.quietHours.end} get a second look.`}
                  on={isActive(overrides, 'quiet')}
                  onToggle={() => toggle('quiet')}
                  onRemove={() => remove('quiet')}
                />
              ) : null}
            </ul>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-6" aria-label="Check and share">
          <TestPayment policy={policy} />
          <section className="s-card p-5" aria-labelledby="share-title">
            <div className="flex items-center gap-3">
              <Avatar name={GUARDIAN.name} size={48} />
              <div>
                <h2 id="share-title" className="text-[0.95rem] font-semibold">
                  Shared with {GUARDIAN.name}
                </h2>
                <p className="text-[0.8rem] text-[var(--muted)]">
                  Your {GUARDIAN.contact}, guardian access
                </p>
              </div>
            </div>
            <p className="mt-3 text-[0.85rem] leading-relaxed">
              {GUARDIAN.name} sees the same rules and can change them with you.
            </p>
            <p className="mt-2 text-[0.8rem] text-[var(--muted)]">
              {editedAt ? `Last edited ${agoLabel(editedAt)}` : 'Not changed on this device yet'}
            </p>
            <Link
              to="/guardian"
              className="mt-3 inline-flex items-center gap-1 text-[0.85rem] font-semibold text-[var(--accent)] no-underline"
            >
              Open {GUARDIAN.name}&rsquo;s view
              <Icon name="arrowRight" size={16} />
            </Link>
          </section>
        </aside>
      </div>

      <div className="setup-footer sticky z-10 -mx-4 mt-8 border-t border-[var(--line)] bg-[var(--card)] px-4 py-3 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <p
            aria-live="polite"
            className="flex items-center gap-2 text-[0.8rem] font-semibold sm:text-[0.85rem]"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${dirty ? 'bg-[var(--warn)]' : 'bg-[var(--ok,#12703f)]'}`}
            />
            {dirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
          <div className="ml-auto flex gap-2">
            {dirty ? (
              <button type="button" className={`${secondaryBtn} !min-h-12 !px-4`} onClick={discard}>
                Discard
              </button>
            ) : null}
            <button
              type="button"
              className={`${primaryBtn} !min-h-12 whitespace-nowrap !px-5`}
              onClick={() => void save()}
              aria-label="Save my rules"
              disabled={busy || !dirty || text.trim().length < 10}
            >
              {busy ? (
                'Saving…'
              ) : (
                <>
                  <span className="sm:hidden">Save</span>
                  <span className="hidden sm:inline">Save my rules</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          className="setup-toast s-card fixed left-1/2 top-20 z-40 flex w-[min(92vw,26rem)] -translate-x-1/2 items-start gap-3 p-4 shadow-lg"
        >
          <span className="s-ok grid h-9 w-9 flex-none place-items-center rounded-full">
            <Icon name="check" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.9rem] font-semibold">Rules saved</p>
            <p className="text-[0.8rem] text-[var(--muted)]">
              AEGIS uses them on the next payment.{' '}
              <Link to="/setup/confirm" className="font-semibold text-[var(--accent)]">
                Read them back
              </Link>
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setToast(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--bg)]"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
