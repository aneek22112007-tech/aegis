import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { useProductType } from '../ui/useProductType';
import { MoneyFlow } from './MoneyFlow';
import { RiskPlayground } from './RiskPlayground';
import { Story } from './story/Story';
import { Bento } from './v3/Bento';
import { GuardianSide } from './v3/GuardianSide';
import { MargaretsDay } from './v3/MargaretsDay';
import { Trust } from './v3/Trust';
import { FAQ } from './v3/faq';
import { useActiveSection } from './v3/useActiveSection';

export const FTC_SOURCE =
  'https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-issues-annual-report-congress-agencys-actions-protect-older-adults';

const NAV = [
  { href: '#story', label: 'How it works' },
  { href: '#day', label: 'A day' },
  { href: '#features', label: 'Features' },
  { href: '#guardian', label: 'Priya’s side' },
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
              aria-controls={`faq-${i}`}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-[15px] font-medium"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.q}
              <Icon name="chevronDown" className={open === i ? 'rotate-180' : ''} />
            </button>
          </h3>
          <p
            id={`faq-${i}`}
            hidden={open !== i}
            className="px-5 pb-4 text-[14px] leading-relaxed text-[var(--gray-600)]"
          >
            {item.a}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  useProductType();
  const active = useActiveSection(NAV.map((item) => item.href.slice(1)));
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
              <a
                key={item.href}
                href={item.href}
                aria-current={active === item.href.slice(1) ? 'location' : undefined}
                className="nav-link hover:text-[var(--gray-900)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <details className="nav-menu md:hidden">
            <summary aria-label="Sections">
              <Icon name="list" />
            </summary>
            <nav aria-label="Sections" className="nav-menu-panel">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => e.currentTarget.closest('details')?.removeAttribute('open')}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </details>
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
        <Story />

        <Section
          id="day"
          muted
          eyebrow="A day with AEGIS"
          title="One Tuesday, from a pharmacy bill to a stopped scam"
          lead="Most payments never notice AEGIS. This is the one that does."
        >
          <MargaretsDay />
        </Section>

        <Section
          id="features"
          eyebrow="What it does"
          title="Small guardrails that add up"
          lead="Each piece below is running in the sandbox today, with the same engine the server uses."
        >
          <Bento />
        </Section>

        <Section
          id="guardian"
          muted
          eyebrow="Priya’s side"
          title="When something looks wrong, family decides"
          lead="Try it: you are Priya, and your mother is about to send $1,900 to a stranger."
        >
          <GuardianSide />
        </Section>

        <Section
          id="path"
          eyebrow="Payment path"
          title="Follow one payment through every hop"
          lead="Money only moves after the rules agree. Pick a payment to see where it stops."
        >
          <MoneyFlow />
        </Section>

        <Section
          id="checker"
          muted
          eyebrow="07 · Risk checker"
          title="Try the same engine the server runs"
          lead="Pick an example or type your own payment. The score and reasons come from the AEGIS risk engine, running in your browser."
        >
          <RiskPlayground />
        </Section>

        <Section
          id="security"
          eyebrow="Security & compliance"
          title="Built on the payment rails, not around them"
          lead="The exact PayPal calls AEGIS makes, taken from the server code."
        >
          <Trust />
        </Section>

        <Section id="faq" muted eyebrow="FAQ" title="Questions families ask">
          <div className="max-w-3xl">
            <Faq />
            <p className="mt-4 text-[14px] text-[var(--gray-600)]">
              Something else?{' '}
              <a
                href="https://github.com/aneek22112007-tech/aegis/issues"
                className="font-medium text-[var(--brand)] hover:underline"
              >
                Ask on GitHub
              </a>
              .
            </p>
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
                ['How it works', '#story'],
                ['Margaret’s day', '#day'],
                ['Priya’s side', '#guardian'],
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
