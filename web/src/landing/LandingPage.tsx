import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '../ui/Chip';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { RiskPlayground } from './RiskPlayground';

export const FTC_SOURCE =
  'https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-issues-annual-report-congress-agencys-actions-protect-older-adults';

const NAV = [
  { href: '#how', label: 'How it works' },
  { href: '#checker', label: 'Risk checker' },
  { href: '#guardian', label: 'Guardian app' },
  { href: '#security', label: 'Security' },
  { href: '#faq', label: 'FAQ' },
];

function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  muted,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`border-t border-[var(--gray-200)] ${muted ? 'bg-[var(--gray-25)]' : 'bg-white'}`}
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-[13px] font-semibold text-[var(--brand)]">{eyebrow}</p>
        <h2
          id={`${id}-title`}
          className="mt-2 max-w-2xl text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--gray-900)]"
        >
          {title}
        </h2>
        {lead ? <p className="mt-3 max-w-2xl text-[16px] text-[var(--gray-600)]">{lead}</p> : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

/** Product mockup: the guardian approval screen on desktop with the senior app beside it. */
function HeroMock() {
  return (
    <div
      className="relative"
      data-testid="static-shield"
      aria-label="AEGIS guardian approval screen"
      role="img"
    >
      <div className="card overflow-hidden shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-2 border-b border-[var(--gray-200)] bg-[var(--gray-25)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--gray-300)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--gray-300)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--gray-300)]" />
          <span className="ml-3 text-xs text-[var(--gray-500)]">
            Margaret’s household › Approvals
          </span>
        </div>
        <div className="grid grid-cols-[150px_1fr] text-[13px]">
          <div className="hidden flex-col gap-1 border-r border-[var(--gray-200)] p-3 sm:flex">
            {['Overview', 'Approvals', 'Lure Log', 'Rules'].map((item, i) => (
              <span
                key={item}
                className={`rounded px-2 py-1.5 ${i === 1 ? 'bg-[var(--brand-50)] font-medium text-[var(--brand)]' : 'text-[var(--gray-600)]'}`}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="col-span-2 p-4 sm:col-span-1">
            <div className="flex items-center gap-2">
              <Chip tone="warn">Needs review</Chip>
              <Chip tone="warn">Risk 52 · Medium</Chip>
              <span className="ml-auto text-xs text-[var(--gray-500)]">2 min ago</span>
            </div>
            <p className="mt-3 text-[18px] font-semibold tracking-[-0.01em]">
              $650.00 to Helen Brooks
            </p>
            <p className="text-[var(--gray-500)]">“Birthday gift”</p>
            <ul className="mt-3 flex flex-col gap-1 text-[var(--gray-700)]">
              <li className="border-l-2 border-[var(--gray-300)] pl-2">
                First payment to this person
              </li>
              <li className="border-l-2 border-[var(--gray-300)] pl-2">
                Above Margaret’s $500 limit for new payees
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <span className="btn btn-danger">Deny</span>
              <span className="btn btn-primary">Approve</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-1 border-t border-[var(--gray-200)] pt-3 text-xs">
              <dt className="text-[var(--gray-500)]">Payment ID</dt>
              <dd className="mono text-right">pay_8f2k1q0zx3</dd>
              <dt className="text-[var(--gray-500)]">PayPal status</dt>
              <dd className="text-right">Authorized, not captured</dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-10 -left-6 hidden w-[190px] rounded-[28px] border border-[var(--gray-300)] bg-white p-3 shadow-[var(--shadow-lg)] lg:block">
        <div className="rounded-[20px] bg-[var(--gray-25)] p-3">
          <p className="text-[11px] text-[var(--gray-500)]">Margaret’s app</p>
          <p className="mt-2 text-[15px] font-semibold leading-snug">
            Your payment is waiting for Priya
          </p>
          <p className="mt-1 text-[12px] text-[var(--gray-600)]">
            $650 to Helen Brooks. Nothing has left your account.
          </p>
          <span className="btn btn-secondary mt-3 w-full">OK</span>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: '1',
    title: 'Margaret pays as usual',
    body: 'She enters an amount and a payee in a large-type app. AEGIS asks PayPal to authorize the payment — the money is reserved, not sent.',
  },
  {
    n: '2',
    title: 'AEGIS scores it against her rules',
    body: 'The risk engine checks the amount, the payee, her history, the time of day and scam language in the note, then explains each signal.',
  },
  {
    n: '3',
    title: 'Capture, hold or void',
    body: 'Below 35 it captures. From 35 to 69 it holds and asks her guardian. At 70 and above it voids the authorization before any money moves.',
  },
];

const FAQ = [
  {
    q: 'Does AEGIS hold my money?',
    a: 'No. Payments run through PayPal. AEGIS only decides whether an authorization is captured or voided.',
  },
  {
    q: 'What happens if the guardian doesn’t answer?',
    a: 'A held payment stays authorized and uncaptured. Nothing is sent until someone approves it, and the authorization expires on its own if no one does.',
  },
  {
    q: 'Can Margaret still pay people she trusts?',
    a: 'Yes. Payees on her trusted list with normal amounts are captured straight away, without asking anyone.',
  },
  {
    q: 'Is this a live product?',
    a: 'AEGIS is an open-source project. The hosted sandbox runs fully in your browser with test data; the server version uses the PayPal sandbox.',
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="card divide-y divide-[var(--gray-200)]">
      {FAQ.map((item, i) => (
        <div key={item.q}>
          <h3>
            <button
              type="button"
              aria-expanded={open === i}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-[15px] font-medium"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.q}
              <Icon name="chevronDown" className={open === i ? 'rotate-180' : ''} />
            </button>
          </h3>
          {open === i ? (
            <p className="px-5 pb-4 text-[14px] text-[var(--gray-600)]">{item.a}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

const LOG = [
  ['Oct 31, 09:12', 'CVS Pharmacy', '$48.00', 'ok', '12 Low', 'Captured'],
  ['Oct 31, 14:40', 'Helen Brooks', '$650.00', 'warn', '52 Medium', 'Held'],
  ['Nov 1, 23:05', 'Officer James', '$1,900.00', 'bad', '100 High', 'Voided'],
  ['Nov 2, 08:30', 'City Utilities', '$92.00', 'ok', '8 Low', 'Captured'],
] as const;

export default function LandingPage() {
  return (
    <div className="ui min-h-screen bg-white text-[var(--gray-900)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-[var(--gray-200)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
          <Link to="/" aria-label="AEGIS home">
            <Logo />
          </Link>
          <nav
            aria-label="Primary"
            className="hidden gap-6 text-[14px] text-[var(--gray-600)] md:flex"
          >
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-[var(--gray-900)]">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/guardian" className="btn hidden text-[var(--gray-700)] sm:inline-flex">
              Dashboard
            </Link>
            <Link to="/demo" className="btn btn-primary">
              Open sandbox
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="bg-gradient-to-b from-[var(--gray-25)] to-white">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1fr_1.1fr] lg:pt-24">
            <div>
              <p className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--gray-600)]">
                <Icon name="shield" className="text-[var(--brand)]" />
                Payment guardrails for older adults
              </p>
              <h1 className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[52px]">
                Your parent’s rules,{' '}
                <span className="text-[var(--gray-500)]">enforced before money moves.</span>
              </h1>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-[var(--gray-600)]">
                AEGIS authorizes each PayPal payment, scores it against the rules your family set,
                and only captures it when it looks right. Anything unusual waits for a guardian.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/demo" className="btn btn-primary btn-lg">
                  Run the live demo
                  <Icon name="arrowRight" />
                </Link>
                <a href="#how" className="btn btn-secondary btn-lg">
                  See how it works
                </a>
              </div>
              <p className="mt-6 text-[13px] text-[var(--gray-500)]">
                Open source · PayPal Orders v2 · No account needed for the sandbox
              </p>
            </div>
            <HeroMock />
          </div>
        </section>

        <section className="border-t border-[var(--gray-200)]">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-[1fr_2fr] md:items-center">
            <p className="text-[15px] font-medium">Why it matters</p>
            <p className="text-[15px] text-[var(--gray-600)]">
              The FTC’s latest report to Congress on protecting older adults describes billions in
              reported fraud losses, much of it sent by people who were talked into paying.{' '}
              <a
                href={FTC_SOURCE}
                className="inline-flex items-center gap-1 font-medium text-[var(--brand)] underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Read the FTC report
                <Icon name="external" />
              </a>
            </p>
          </div>
        </section>

        <Section
          id="how"
          eyebrow="How it works"
          title="Authorize first. Decide. Then capture."
          lead="Most fraud alerts fire after money has left. AEGIS sits between authorization and capture, so a bad payment can be stopped instead of reported."
        >
          <ol className="grid gap-px overflow-hidden rounded-lg border border-[var(--gray-200)] bg-[var(--gray-200)] md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="bg-white p-6">
                <span className="mono text-[13px] text-[var(--gray-500)]">Step {step.n}</span>
                <h3 className="mt-2 text-[16px] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--gray-600)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="checker"
          muted
          eyebrow="Risk checker"
          title="Try the same engine the server runs"
          lead="Pick an example or type your own payment. The score and reasons come from the AEGIS risk engine, running in your browser."
        >
          <RiskPlayground />
        </Section>

        <Section
          id="guardian"
          eyebrow="Guardian app"
          title="One inbox for the payments that need a person"
          lead="Guardians see why a payment was held, approve or deny it in one tap, and Margaret’s app updates as soon as they do."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <Chip tone="warn">Needs review</Chip>
                <span className="ml-auto text-xs text-[var(--gray-500)]">Just now</span>
              </div>
              <p className="mt-3 text-[16px] font-semibold">$650.00 to Helen Brooks</p>
              <p className="text-[13px] text-[var(--gray-500)]">
                Authorized with PayPal · not captured
              </p>
              <div className="mt-4 flex gap-2">
                <span className="btn btn-danger">Deny</span>
                <span className="btn btn-primary">Approve</span>
              </div>
            </div>
            <ul className="flex flex-col gap-4 text-[14px] text-[var(--gray-700)]">
              {[
                [
                  'Live updates',
                  'New holds appear without refreshing, with an optional alert sound.',
                ],
                ['Plain-language reasons', 'Every hold lists the signals that triggered it.'],
                ['Nothing moves while you decide', 'The authorization is reserved, not captured.'],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <Icon name="check" className="mt-0.5 shrink-0 text-[var(--brand)]" />
                  <span>
                    <span className="font-medium text-[var(--gray-900)]">{title}.</span> {body}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          id="audit"
          muted
          eyebrow="Audit log"
          title="Every decision, on the record"
          lead="The Lure Log keeps each payment with its score, reasons and outcome. Export it as CSV or download a report for a stopped scam to share with the bank or police."
        >
          <div className="card overflow-x-auto">
            <table className="table min-w-[640px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Payee</th>
                  <th className="text-right">Amount</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {LOG.map(([date, payee, amount, tone, risk, status]) => (
                  <tr key={payee}>
                    <td className="text-[var(--gray-500)]">{date}</td>
                    <td className="font-medium">{payee}</td>
                    <td className="text-right tabular-nums">{amount}</td>
                    <td>
                      <Chip tone={tone}>{risk}</Chip>
                    </td>
                    <td>
                      <Chip tone={tone}>{status}</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="security"
          eyebrow="Security & compliance"
          title="Built on the payment rails, not around them"
        >
          <div className="grid gap-px overflow-hidden rounded-lg border border-[var(--gray-200)] bg-[var(--gray-200)] md:grid-cols-3">
            {[
              [
                'lock',
                'No card data',
                'Payments are handled by PayPal. AEGIS never sees or stores card numbers.',
              ],
              [
                'shield',
                'Authorize-then-capture',
                'Uses PayPal Orders v2 intent AUTHORIZE, so stopped payments are voided, not refunded.',
              ],
              [
                'file',
                'Explainable decisions',
                'Each score is stored with its reasons and the rules version that produced it.',
              ],
            ].map(([icon, title, body]) => (
              <div key={title} className="bg-white p-6">
                <Icon name={icon as 'lock'} className="text-[var(--brand)]" />
                <h3 className="mt-3 text-[15px] font-semibold">{title}</h3>
                <p className="mt-1.5 text-[14px] text-[var(--gray-600)]">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="faq" muted eyebrow="FAQ" title="Questions families ask">
          <div className="max-w-3xl">
            <Faq />
          </div>
        </Section>

        <section className="border-t border-[var(--gray-200)] bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-14">
            <div>
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">
                See a scam stopped in under a minute
              </h2>
              <p className="mt-1 text-[15px] text-[var(--gray-600)]">
                The sandbox runs three real scenarios with test data.
              </p>
            </div>
            <Link to="/demo" className="btn btn-primary btn-lg">
              Open the sandbox
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--gray-200)] bg-[var(--gray-25)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 text-[14px] sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 text-[13px] text-[var(--gray-500)]">
              Payment guardrails for families.
            </p>
          </div>
          {[
            [
              'Product',
              [
                ['Sandbox', '/demo'],
                ['Guardian dashboard', '/guardian'],
                ['Lure Log', '/audit'],
                ['Margaret’s app', '/senior'],
              ],
            ],
            [
              'Learn',
              [
                ['How it works', '#how'],
                ['Risk checker', '#checker'],
                ['Security', '#security'],
                ['FAQ', '#faq'],
              ],
            ],
            [
              'Resources',
              [
                ['FTC report on older adults', FTC_SOURCE],
                ['Source on GitHub', 'https://github.com/aneek22112007-tech/aegis'],
              ],
            ],
          ].map(([title, links]) => (
            <div key={title as string}>
              <p className="font-medium">{title as string}</p>
              <ul className="mt-3 flex flex-col gap-2 text-[var(--gray-600)]">
                {(links as string[][]).map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('/') ? (
                      <Link to={href} className="hover:text-[var(--gray-900)]">
                        {label}
                      </Link>
                    ) : (
                      <a href={href} className="hover:text-[var(--gray-900)]">
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-6xl border-t border-[var(--gray-200)] px-6 py-5 text-[12px] text-[var(--gray-500)]">
          AEGIS is an open-source project and is not affiliated with PayPal. Sandbox data is
          fictional.
        </div>
      </footer>
    </div>
  );
}
