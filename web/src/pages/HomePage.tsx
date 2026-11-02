import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_MODE, getAudit, getHousehold, type AuditRow, type Household } from '../api';
import { agoLabel, Avatar, greeting, Pill, statusOf, usd, whenLabel } from '../senior/ui';
import { Icon, type IconName } from '../ui/Icon';

/** Test balance for the sandbox account; real balances stay in PayPal. */
export const TEST_BALANCE_CENTS = 284_250;
const GUARDIAN_PHONE = '+15555550142';

function Action({
  to,
  href,
  icon,
  label,
}: {
  to?: string;
  href?: string;
  icon: IconName;
  label: string;
}) {
  const inner = (
    <>
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_9%,var(--card))] text-[var(--accent)]">
        <Icon name={icon} size={30} />
      </span>
      <span className="text-center text-[0.8rem] font-semibold leading-tight">{label}</span>
    </>
  );
  const cls =
    'flex min-h-[8.2rem] flex-col items-center justify-center gap-3 rounded-2xl text-balance border border-[var(--line)] bg-[var(--card)] p-3 text-[var(--ink)] no-underline hover:border-[var(--accent)]';
  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link to={to!} className={cls}>
      {inner}
    </Link>
  );
}

function ActivityRow({ row }: { row: AuditRow }) {
  const status = statusOf(row.status);
  const stopped = status.tone === 'bad';
  return (
    <li className="flex min-h-[5rem] items-center gap-4 px-5 py-3">
      <Avatar name={row.payeeName} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9rem] font-semibold">{row.payeeName}</p>
        <p className="truncate text-[0.72rem] text-[var(--muted)]">
          {whenLabel(row.createdAt)}
          {row.note ? ` · ${row.note}` : ''}
        </p>
      </div>
      <div className="flex flex-none flex-col items-end gap-1">
        <p
          className={`text-[0.9rem] font-semibold tabular-nums ${stopped ? 'text-[var(--muted)] line-through' : ''}`}
        >
          −{row.amount}
        </p>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
    </li>
  );
}

export function HomePage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let gone = false;
    Promise.all([getHousehold(), getAudit()])
      .then(([h, a]) => {
        if (gone) return;
        setHousehold(h);
        setRows(a.payments);
      })
      .catch((cause: unknown) => {
        if (!gone) setError(cause instanceof Error ? cause.message : 'Please try that again.');
      });
    return () => {
      gone = true;
    };
  }, []);

  const now = new Date();
  const name = household?.senior?.name ?? 'Margaret';
  const guardian = household?.guardian?.name ?? 'Priya';
  const relation = household?.guardian?.relationship ?? 'daughter';
  const trusted = (household?.payees ?? []).filter((p) => p.status === 'trusted');
  const waiting = rows?.filter((r) => r.status === 'held') ?? [];
  const sentCents = (rows ?? [])
    .filter((r) => r.status === 'captured' || r.status === 'held')
    .filter((r) => !r.id.startsWith('pay_seed_'))
    .reduce((n, r) => n + r.amountCents, 0);
  const lastCheck = rows?.[0]?.createdAt;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline-flex">
          <Avatar name={name} size={60} />
        </span>
        <div>
          <h1 className="text-[1.15rem] sm:text-[1.45rem] font-semibold leading-tight tracking-[-0.02em]">
            {greeting(now)}, {name}
          </h1>
          <p className="text-[0.8rem] text-[var(--muted)]">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl bg-[var(--danger)] px-5 py-4 font-semibold text-white"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="balance-title" className="s-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="balance-title"
                className="flex items-center gap-2 text-[0.8rem] font-semibold text-[var(--muted)]"
              >
                <Icon name="card" size={20} />
                PayPal sandbox account
              </h2>
              {DEMO_MODE ? <Pill tone="neutral">Test money</Pill> : null}
            </div>
            {DEMO_MODE ? (
              <>
                <p className="mt-3 text-[2.4rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                  {usd(TEST_BALANCE_CENTS - sentCents)}
                </p>
                <p className="mt-2 text-[0.75rem] text-[var(--muted)]">
                  Available · test balance for the demo, not real money
                </p>
              </>
            ) : (
              <p className="mt-3 text-[0.95rem]">
                Your balance is shown in PayPal. AEGIS only sees payments you send from here.
              </p>
            )}
            {waiting.length ? (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--bg)] px-4 py-3 text-[0.8rem]">
                <Icon name="clock" size={20} />
                {usd(waiting.reduce((n, r) => n + r.amountCents, 0))} is reserved while {guardian}{' '}
                checks {waiting.length === 1 ? 'a payment' : `${waiting.length} payments`}.
              </p>
            ) : null}
          </section>

          <nav aria-label="Quick actions" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Action to="/senior/pay" icon="send" label="Send money" />
            <Action to="/senior/pay?payee=City%20Utilities" icon="receipt" label="Pay a bill" />
            <Action to="/setup" icon="shield" label="My rules" />
            <Action href={`tel:${GUARDIAN_PHONE}`} icon="phone" label={`Call ${guardian}`} />
          </nav>

          <section aria-labelledby="people-title" className="s-card p-5">
            <h2 id="people-title" className="text-[0.95rem] font-semibold">
              People and bills you trust
            </h2>
            <ul className="mt-4 flex gap-5 overflow-x-auto pb-1">
              {trusted.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/senior/pay?payee=${encodeURIComponent(p.name)}`}
                    className="flex w-[5.6rem] flex-col items-center gap-2 text-center text-[0.72rem] font-semibold leading-tight text-[var(--ink)] no-underline"
                  >
                    <Avatar name={p.name} size={60} />
                    {p.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/senior/pay"
                  className="flex w-[5.6rem] flex-col items-center gap-2 text-center text-[0.72rem] font-semibold leading-tight text-[var(--ink)] no-underline"
                >
                  <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-dashed border-[var(--muted)] text-[var(--muted)]">
                    <Icon name="plus" size={26} />
                  </span>
                  Someone new
                </Link>
              </li>
            </ul>
          </section>

          <section aria-labelledby="activity-title" className="s-card overflow-hidden">
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <h2 id="activity-title" className="text-[0.95rem] font-semibold">
                Recent activity
              </h2>
              <Link
                to="/audit"
                className="text-[0.75rem] font-semibold text-[var(--accent)] no-underline"
              >
                See all
              </Link>
            </div>
            {rows === null && !error ? (
              <p role="status" className="px-5 pb-5 text-[0.85rem] text-[var(--muted)]">
                Loading your payments…
              </p>
            ) : rows && rows.length === 0 ? (
              <p className="px-5 pb-5 text-[0.85rem] text-[var(--muted)]">No payments yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--line)]">
                {(rows ?? []).slice(0, 6).map((row) => (
                  <ActivityRow key={row.id} row={row} />
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6" aria-label="Your protection">
          <section aria-labelledby="protect-title" className="s-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ecfdf3] text-[#067647]">
                <Icon name="shield" size={26} />
              </span>
              <div>
                <h2 id="protect-title" className="text-[0.95rem] font-semibold">
                  Protected by your rules
                </h2>
                <p className="text-[0.72rem] text-[var(--muted)]">
                  {lastCheck ? `Last check ${agoLabel(lastCheck, now)}` : 'No payments checked yet'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[var(--bg)] p-4">
              <Avatar name={guardian} size={48} />
              <div className="min-w-0">
                <p className="text-[0.85rem] font-semibold">
                  {guardian}, your {relation}
                </p>
                <p className="text-[0.72rem] text-[var(--muted)]">Checks anything unusual</p>
              </div>
            </div>
            <p className="mt-4 text-[0.8rem] leading-relaxed">
              Every payment you send here is checked first. Anything unusual waits for {guardian}{' '}
              before money leaves your account.
            </p>
          </section>

          <section aria-labelledby="rules-title" className="s-card p-5">
            <h2 id="rules-title" className="text-[0.95rem] font-semibold">
              Your rules
            </h2>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--muted)]">
              {household?.mandate?.summary || household?.mandate?.rawText || 'Loading your rules…'}
            </p>
            <Link
              to="/setup"
              className="mt-4 inline-flex min-h-12 items-center gap-1 text-[0.8rem] font-semibold text-[var(--accent)] no-underline"
            >
              Change my rules
              <Icon name="chevronRight" size={18} />
            </Link>
          </section>

          <p className="px-1 text-[0.72rem] leading-relaxed text-[var(--muted)]">
            Payments made directly in the PayPal app are not seen by AEGIS. Use Send money so your
            rules apply.
          </p>
        </aside>
      </div>
    </div>
  );
}
