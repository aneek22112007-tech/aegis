import { heuristicCompile } from '../../engine/heuristic';
import { evaluateRisk } from '../../engine/evaluate';
import { summarizePolicy } from '../../engine/summary';

const GUARDIAN = { name: 'Priya', contact: 'daughter' };

export const SAMPLE_RULES =
  'Ask Priya before I send more than $500 to someone new. Never pay gift cards. No payments after 9pm.';

/** The rules Priya wrote, and what the engine understood, side by side. */
export function RulesArt() {
  const sentences = summarizePolicy(heuristicCompile(SAMPLE_RULES, GUARDIAN))
    .split(/(?<=\.)\s+/)
    .filter(Boolean);
  return (
    <div className="bento-rules">
      <p className="bento-label">Priya wrote</p>
      <p className="bento-quote">{SAMPLE_RULES}</p>
      <p className="bento-label mt-4">AEGIS will</p>
      <ul className="bento-checks">
        {sentences.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

/** An order is authorized first; only a passing check captures it. */
export function AuthorizeArt() {
  const rows: [string, string, string][] = [
    ['CVS Pharmacy', '$48.00', 'Captured'],
    ['Helen Carter', '$650.00', 'Authorized'],
    ['James W.', '$1,900.00', 'Voided'],
  ];
  return (
    <ul className="bento-rows">
      {rows.map(([who, amount, status]) => (
        <li key={who}>
          <span className="truncate">{who}</span>
          <span className="tabular-nums text-[var(--gray-500)]">{amount}</span>
          <span className="bento-pill" data-status={status.toLowerCase()}>
            {status}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Score for the "Officer James" payment, computed by the real engine. */
export function ScoreArt() {
  const policy = heuristicCompile(SAMPLE_RULES, GUARDIAN);
  const decision = evaluateRisk({
    amount: 1900,
    payeeName: 'James W.',
    note: 'urgent bank investigation, keep money safe',
    payeeStatus: 'unknown',
    recentPaymentCount: 1,
    recentPaymentTotal: 48,
    historyAmounts: [48, 62, 120, 35],
    now: new Date('2026-11-03T14:47:00'),
    policy,
  });
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="bento-score">{decision.score}</span>
        <span className="bento-pill" data-status="voided">
          {decision.level}
        </span>
      </div>
      <ul className="bento-reasons">
        {decision.reasons.slice(0, 3).map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

/** A few rows from the Lure Log: the scam patterns AEGIS caught. */
export function LureLogArt() {
  const rows: [string, string][] = [
    ['Gift card request', '3 this month'],
    ['Fake officer or bank', '2 this month'],
    ['Urgent “keep it safe”', '2 this month'],
  ];
  return (
    <ul className="bento-rows">
      {rows.map(([lure, count]) => (
        <li key={lure} className="bento-lure">
          <span className="truncate">{lure}</span>
          <span className="text-[var(--gray-500)]">{count}</span>
        </li>
      ))}
    </ul>
  );
}

/** Margaret can have any screen read aloud. */
export function ReadAloudArt() {
  const bars = [6, 14, 22, 12, 26, 18, 9, 20, 28, 15, 8, 18, 24, 11, 6];
  return (
    <div className="bento-voice">
      <span className="bento-voice-btn">Read aloud</span>
      <div className="bento-wave">
        {bars.map((h, i) => (
          <span key={i} style={{ height: h }} />
        ))}
      </div>
      <p className="bento-voice-line">“Waiting for Priya to check this payment.”</p>
    </div>
  );
}

/** Quiet hours on a 24-hour bar: payments after 9 PM wait until morning. */
export function QuietHoursArt() {
  return (
    <div>
      <div className="bento-hours" role="presentation">
        <span className="bento-hours-quiet" style={{ left: `${(21 / 24) * 100}%`, right: 0 }} />
        <span className="bento-hours-quiet" style={{ left: 0, width: `${(7 / 24) * 100}%` }} />
      </div>
      <div className="bento-hours-scale">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
      <p className="mt-3 text-[13px] text-[var(--gray-600)]">
        Quiet from 9 PM to 7 AM. Late-night requests wait for Priya.
      </p>
    </div>
  );
}
