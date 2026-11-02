import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { HELD } from './content';

/** Splits copy into masked lines so each one can rise into view on its own. */
export function Lines({ lines, className = '' }: { lines: string[]; className?: string }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span className={`line block overflow-hidden ${className}`}>
            <span className="line-inner block">{line}</span>
          </span>
        </Fragment>
      ))}
    </>
  );
}

export function HeroCopy() {
  return (
    <>
      <p className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--gray-600)]">
        <Icon name="shield" className="text-[var(--brand)]" />
        Payment guardrails for older adults
      </p>
      <h1
        aria-label="Your parent’s rules, enforced before money moves."
        className="mt-4 text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[56px]"
      >
        <Lines lines={['Your parent’s rules,']} />{' '}
        <Lines lines={['enforced before', 'money moves.']} className="text-[var(--gray-500)]" />
      </h1>
      <p className="hero-sub mt-5 max-w-md text-[17px] leading-relaxed text-[var(--gray-600)]">
        AEGIS authorizes each PayPal payment, scores it against the rules your family set, and only
        captures it when it looks right. Anything unusual waits for a guardian.
      </p>
      <div className="hero-cta mt-8 flex flex-wrap gap-3">
        <Link to="/demo" className="btn btn-primary btn-lg">
          Run the live demo
          <Icon name="arrowRight" />
        </Link>
        <a href="#day" className="btn btn-secondary btn-lg">
          See Margaret’s day
        </a>
      </div>
      <ul className="hero-proof mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[var(--gray-600)]">
        {['PayPal Orders v2, authorize then capture', 'Rules in plain English', 'Open source'].map(
          (item) => (
            <li key={item} className="inline-flex items-center gap-1.5">
              <Icon name="check" className="text-[var(--brand)]" />
              {item}
            </li>
          ),
        )}
      </ul>
    </>
  );
}

export function Eyebrow({ n, children }: { n: string; children: string }) {
  return (
    <p className="flex items-center gap-3 text-[13px] font-semibold text-[var(--brand)]">
      <span className="mono text-[var(--gray-500)]">{n}</span>
      {children}
    </p>
  );
}

export function StartsCopy() {
  return (
    <>
      <Eyebrow n="02">A payment starts</Eyebrow>
      <h2 className="mt-3 text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[42px]">
        <Lines lines={['Margaret pays someone', 'new. Nothing moves yet.']} />
      </h2>
      <p className="mt-4 max-w-md text-[16px] leading-relaxed text-[var(--gray-600)]">
        She sends {HELD.amount} to {HELD.payee} from her AEGIS app. AEGIS creates a PayPal order
        with intent AUTHORIZE, so the money is reserved on her card but not captured.
      </p>
    </>
  );
}

export function ChecksCopy() {
  return (
    <>
      <Eyebrow n="03">AEGIS checks it</Eyebrow>
      <h2 className="mt-3 text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[42px]">
        <Lines lines={['Scored against her rules,', 'with every reason kept.']} />
      </h2>
      <ol className="mt-5 flex max-w-md flex-col gap-2 text-[15px] text-[var(--gray-700)]">
        <li className="flex gap-3">
          <span className="mono text-[var(--gray-500)]">a</span>Authorize with PayPal. Funds
          reserved.
        </li>
        <li className="flex gap-3">
          <span className="mono text-[var(--gray-500)]">b</span>Score amount, payee, history, time
          and the note.
        </li>
        <li className="flex gap-3">
          <span className="mono text-[var(--gray-500)]">c</span>Under 35 capture, 35–69 hold for
          Priya, 70+ void.
        </li>
      </ol>
    </>
  );
}

export const OUTCOME_COPY = {
  captured: {
    title: 'Her pharmacy refill goes straight through.',
    body: 'A trusted payee and a normal amount. AEGIS captures the authorization and no one is bothered.',
    tag: 'Captured',
  },
  held: {
    title: 'A new payee over her limit waits for Priya.',
    body: 'Priya gets the reasons on her phone and approves in one tap. Until then the money stays reserved, not sent.',
    tag: 'Held',
  },
  voided: {
    title: 'The bail scam is voided before capture.',
    body: 'Scam language, a large amount and a stranger. AEGIS voids the authorization, blocks the payee and drafts a report.',
    tag: 'Voided',
  },
} as const;
