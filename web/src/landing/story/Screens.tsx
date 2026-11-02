import { Logo } from '../../ui/Logo';
import { StatusBar } from './Device';
import type { StoryPayment } from './content';

export type Stage = 'home' | 'request' | 'authorize' | 'score' | 'decision';

const TONE = {
  LOW: { fg: 'var(--ok)', bg: 'var(--ok-bg)', label: 'Low risk' },
  MEDIUM: { fg: 'var(--warn)', bg: 'var(--warn-bg)', label: 'Medium risk' },
  HIGH: { fg: 'var(--bad)', bg: 'var(--bad-bg)', label: 'High risk' },
} as Record<string, { fg: string; bg: string; label: string }>;

const R = 64;
const ARC = Math.PI * R;

/** Semicircle gauge; fill comes from the --g custom property (0–1) so scroll can drive it without re-rendering. */
export function Gauge({ level }: { level: string }) {
  const tone = TONE[level] ?? TONE.LOW;
  return (
    <svg viewBox="0 0 160 92" className="mx-auto w-[180px]">
      <path
        d="M16 84 A64 64 0 0 1 144 84"
        fill="none"
        stroke="var(--gray-200)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M16 84 A64 64 0 0 1 144 84"
        fill="none"
        stroke={tone.fg}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={ARC}
        style={{ strokeDashoffset: `calc(${ARC}px * (1 - var(--g, 1)))` }}
      />
    </svg>
  );
}

function Header({ title }: { title?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--gray-200)] px-5 pb-3 pt-1">
      <Logo size={18} />
      <span className="text-[12px] text-[var(--gray-500)]">{title}</span>
    </div>
  );
}

function Home() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-5">
      <p className="text-[13px] text-[var(--gray-500)]">Good morning, Margaret</p>
      <div className="rounded-xl border border-[var(--gray-200)] p-4">
        <p className="flex items-center gap-2 text-[12px] font-semibold text-[var(--brand)]">
          <span className="h-2 w-2 rounded-full bg-[var(--ok)]" /> Your rules are on
        </p>
        <p className="mt-1.5 text-[14px] leading-snug">
          Anything unusual waits for Priya before money leaves.
        </p>
        <div className="mt-3 rounded-lg bg-[var(--brand)] py-2.5 text-center text-[15px] font-semibold text-white">
          Send money
        </div>
      </div>
      <p className="mt-1 text-[12px] font-medium text-[var(--gray-500)]">Recent</p>
      {[
        ['CVS Pharmacy', '$48.00', 'Sent'],
        ['City Utilities', '$92.00', 'Sent'],
        ['Helen Brooks', '$650.00', 'Waiting'],
      ].map(([p, a, s]) => (
        <div
          key={p}
          className="flex items-center justify-between border-b border-[var(--gray-100)] pb-2 text-[14px]"
        >
          <span>{p}</span>
          <span className="text-right">
            <span className="block font-medium tabular-nums">{a}</span>
            <span className="block text-[11px] text-[var(--gray-500)]">{s}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function Amount({ p }: { p: StoryPayment }) {
  return (
    <div className="text-center">
      <p className="text-[13px] text-[var(--gray-500)]">Paying {p.payee}</p>
      <p className="mt-1 text-[40px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
        {p.amount}
      </p>
      <p className="mt-1 text-[13px] text-[var(--gray-500)]">“{p.note}”</p>
    </div>
  );
}

export function Decision({ p }: { p: StoryPayment }) {
  const map = {
    captured: {
      fg: 'var(--ok)',
      bg: 'var(--ok-bg)',
      title: 'Sent',
      body: `${p.amount}.00 is on its way to ${p.payee}.`,
      icon: 'M5 12.5l4.5 4.5L19 7.5',
    },
    held: {
      fg: 'var(--warn)',
      bg: 'var(--warn-bg)',
      title: 'Waiting for Priya',
      body: 'Nothing has left your account yet.',
      icon: 'M12 7v5l3 2',
    },
    voided: {
      fg: 'var(--bad)',
      bg: 'var(--bad-bg)',
      title: 'Stopped',
      body: `${p.amount} never left your account. Priya has been told.`,
      icon: 'M7 7l10 10M17 7 7 17',
    },
  }[p.key];
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span
        className="grid h-14 w-14 place-items-center rounded-full"
        style={{ background: map.bg, color: map.fg }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {p.key === 'held' ? <circle cx="12" cy="12" r="8.5" /> : null}
          <path d={map.icon} />
        </svg>
      </span>
      <p className="text-[22px] font-semibold">{map.title}</p>
      <p className="px-2 text-[14px] text-[var(--gray-600)]">{map.body}</p>
    </div>
  );
}

/** Margaret's AEGIS app at each step of the story. */
export function MargaretScreen({
  stage,
  payment,
  reasonsShown = 99,
}: {
  stage: Stage;
  payment: StoryPayment;
  reasonsShown?: number;
}) {
  const tone = TONE[payment.level] ?? TONE.LOW;
  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <Header title={stage === 'home' ? 'Home' : 'Send money'} />
      {stage === 'home' ? (
        <Home />
      ) : (
        <div className="flex flex-1 flex-col gap-5 p-5 pt-7">
          <Amount p={payment} />
          {stage === 'request' ? (
            <div className="mt-auto rounded-lg bg-[var(--brand)] py-3 text-center text-[15px] font-semibold text-white">
              Confirm payment
            </div>
          ) : null}
          {stage === 'authorize' ? (
            <div className="rounded-xl border border-[var(--gray-200)] p-4 text-[13px]">
              <p className="flex items-center gap-2 font-medium">
                <span className="spin h-3.5 w-3.5 rounded-full border-2 border-[var(--gray-300)] border-t-[var(--brand)]" />
                Authorizing with PayPal
              </p>
              <p className="mt-1 text-[var(--gray-500)]">Funds reserved, not sent.</p>
            </div>
          ) : null}
          {stage === 'score' ? (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Gauge level={payment.level} />
                <p className="absolute inset-x-0 bottom-0 text-center">
                  <span className="story-score text-[28px] font-semibold tabular-nums">
                    {payment.score}
                  </span>
                  <span className="text-[12px] text-[var(--gray-500)]"> / 100</span>
                </p>
              </div>
              <p
                className="mx-auto rounded px-2 py-0.5 text-[12px] font-medium"
                style={{ color: tone.fg, background: tone.bg }}
              >
                {tone.label}
              </p>
              <ul className="flex flex-col gap-1.5 text-[13px] text-[var(--gray-700)]">
                {payment.reasons.slice(0, Math.min(3, reasonsShown)).map((r) => (
                  <li key={r} className="reason-in border-l-2 border-[var(--gray-300)] pl-2">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {stage === 'decision' ? <Decision p={payment} /> : null}
        </div>
      )}
    </div>
  );
}

/** Priya's phone with the approval request. Buttons are part of the picture, not controls. */
export function PriyaScreen({
  payment,
  approved = false,
}: {
  payment: StoryPayment;
  approved?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-[var(--gray-50)]">
      <StatusBar />
      <div className="px-4 pt-2">
        <p className="text-[12px] text-[var(--gray-500)]">AEGIS · Guardian</p>
        <div className="mt-3 rounded-xl border border-[var(--gray-200)] bg-white p-4 shadow-[var(--shadow-xs)]">
          <p className="text-[11px] font-medium text-[var(--warn)]">Needs your review</p>
          <p className="mt-1 text-[16px] font-semibold">
            {payment.amount} to {payment.payee}
          </p>
          <p className="text-[12px] text-[var(--gray-500)]">From Margaret · “{payment.note}”</p>
          <ul className="mt-2 flex flex-col gap-1 text-[12px] text-[var(--gray-700)]">
            {payment.reasons.slice(0, 2).map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
          {approved ? (
            <p className="mt-3 rounded-md bg-[var(--ok-bg)] py-2 text-center text-[13px] font-semibold text-[var(--ok)]">
              Approved · captured
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-semibold">
              <span className="rounded-md border border-[var(--gray-300)] py-2 text-center text-[var(--bad)]">
                Deny
              </span>
              <span className="rounded-md bg-[var(--brand)] py-2 text-center text-white">
                Approve
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
