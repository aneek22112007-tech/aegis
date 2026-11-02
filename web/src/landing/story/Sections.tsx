import { Chip } from '../../ui/Chip';
import { Icon } from '../../ui/Icon';
import { Lines } from './copy';
import { OUTCOME_COPY } from './copy';
import { Device } from './Device';
import { CssCard } from './PaymentCard';
import { MargaretScreen, PriyaScreen } from './Screens';
import { FTC_SOURCE, formatStat, LOG_ROWS, STATS, type StoryPayment } from './content';

const TONE = { captured: 'ok', held: 'warn', voided: 'bad' } as const;

export function OutcomePanel({ p, index }: { p: StoryPayment; index: number }) {
  const copy = OUTCOME_COPY[p.key];
  return (
    <div
      className={`outcome-panel outcome-${p.key} grid w-full items-center gap-10 lg:grid-cols-[1fr_1.1fr]`}
    >
      <div>
        <p className="flex items-center gap-3 text-[13px] font-semibold text-[var(--brand)]">
          <span className="mono text-[var(--gray-500)]">04 · {index + 1}/3</span>
          Outcome
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Chip tone={TONE[p.key]}>{copy.tag}</Chip>
          <span className="text-[13px] text-[var(--gray-500)]">
            {p.amount} to {p.payee} · risk {p.score}
          </span>
        </div>
        <h3 className="mt-3 max-w-md text-[30px] font-semibold leading-[1.15] tracking-[-0.02em]">
          {copy.title}
        </h3>
        <p className="mt-3 max-w-md text-[16px] leading-relaxed text-[var(--gray-600)]">
          {copy.body}
        </p>
        <ul className="mt-4 flex max-w-md flex-col gap-1.5 text-[14px] text-[var(--gray-700)]">
          {p.reasons.slice(0, 3).map((r) => (
            <li key={r} className="border-l-2 border-[var(--gray-300)] pl-2">
              {r}
            </li>
          ))}
        </ul>
      </div>
      <div className="outcome-scene relative flex min-h-[560px] items-center justify-center">
        <Device
          label={`Margaret’s app: ${copy.tag.toLowerCase()} ${p.amount} to ${p.payee}`}
          className="outcome-phone"
        >
          <MargaretScreen stage="decision" payment={p} />
        </Device>
        {p.key === 'held' ? (
          <Device
            label="Priya’s phone with Approve and Deny"
            className="priya-phone device-sm absolute right-[2%] top-[14%]"
          >
            <PriyaScreen payment={p} />
          </Device>
        ) : null}
        {p.key === 'voided' ? (
          <div className="void-card absolute left-[0%] top-[58%]">
            <CssCard className="scale-[0.8]" />
            <span className="void-stamp">Voided · $0.00 moved</span>
          </div>
        ) : null}
        {p.key === 'captured' ? (
          <div className="capture-event absolute left-[2%] top-[20%] rounded-md border border-[var(--gray-200)] bg-white px-3 py-2 text-[12px] shadow-[var(--shadow-md)]">
            <p className="mono text-[var(--brand)]">PAYMENT.CAPTURE.COMPLETED</p>
            <p className="text-[var(--gray-500)]">{p.amount}.00 · CVS Pharmacy</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LureLogSection() {
  return (
    <section
      id="audit"
      aria-labelledby="audit-title"
      className="border-t border-[var(--gray-200)] bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="flex items-center gap-3 text-[13px] font-semibold text-[var(--brand)]">
          <span className="mono text-[var(--gray-500)]">05</span>Lure Log
        </p>
        <h2
          id="audit-title"
          className="reveal mt-3 max-w-2xl text-[34px] font-semibold leading-[1.12] tracking-[-0.02em]"
        >
          <Lines lines={['Every decision lands', 'in one audit log.']} />
        </h2>
        <p className="mt-3 max-w-2xl text-[16px] text-[var(--gray-600)]">
          Each payment is kept with its score, reasons and outcome. Export it as CSV, or download a
          report for a stopped scam to share with the bank or police.
        </p>
        <div className="log-stage mt-10">
          <div
            role="table"
            aria-label="Lure Log sample"
            className="card overflow-hidden text-[13px]"
          >
            <div
              role="row"
              className="log-head grid grid-cols-[1.1fr_1.2fr_1fr_0.8fr_0.9fr_1.2fr] border-b border-[var(--gray-200)] bg-[var(--gray-25)] px-4 py-2.5 text-[12px] font-medium text-[var(--gray-500)]"
            >
              {['Date', 'Payee', 'Amount', 'Risk', 'Status', 'Payment ID'].map((h) => (
                <span
                  role="columnheader"
                  key={h}
                  className={h === 'Amount' ? 'text-right pr-6' : ''}
                >
                  {h}
                </span>
              ))}
            </div>
            {LOG_ROWS.map(([date, payee, amount, tone, risk, status, id], i) => (
              <div
                role="row"
                key={i}
                className="log-row grid grid-cols-[1.1fr_1.2fr_1fr_0.8fr_0.9fr_1.2fr] items-center border-b border-[var(--gray-100)] bg-white px-4 py-3 last:border-b-0"
              >
                <span role="cell" className="text-[var(--gray-500)]">
                  {date}
                </span>
                <span role="cell" className="font-medium">
                  {payee}
                </span>
                <span role="cell" className="pr-6 text-right tabular-nums">
                  {amount}
                </span>
                <span role="cell">
                  <Chip tone={tone}>{risk}</Chip>
                </span>
                <span role="cell">
                  <Chip tone={tone}>{status}</Chip>
                </span>
                <span role="cell" className="mono truncate text-[var(--gray-500)]">
                  {id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function NumbersSection() {
  return (
    <section
      id="numbers"
      aria-labelledby="numbers-title"
      className="border-t border-[var(--gray-200)] bg-[var(--gray-25)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="flex items-center gap-3 text-[13px] font-semibold text-[var(--brand)]">
          <span className="mono text-[var(--gray-500)]">06</span>Why it matters
        </p>
        <h2
          id="numbers-title"
          className="reveal mt-3 max-w-2xl text-[34px] font-semibold leading-[1.12] tracking-[-0.02em]"
        >
          <Lines lines={['Most alerts fire after', 'the money has gone.']} />
        </h2>
        <dl className="mt-12 grid gap-px overflow-hidden rounded-lg border border-[var(--gray-200)] bg-[var(--gray-200)] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className="bg-white p-6">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span
                  className="stat-value block text-[36px] font-semibold tracking-[-0.02em] tabular-nums"
                  data-stat={i}
                >
                  {formatStat(s.value, s)}
                </span>
                <span className="mt-2 block text-[14px] text-[var(--gray-600)]" aria-hidden="true">
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-[13px] text-[var(--gray-500)]">
          Source: FTC, <em>Protecting Older Consumers 2025–2026</em>, report to Congress (October
          2026).{' '}
          <a
            href={FTC_SOURCE}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[var(--brand)] hover:underline"
          >
            Read the FTC report
            <Icon name="external" />
          </a>
        </p>
      </div>
    </section>
  );
}
