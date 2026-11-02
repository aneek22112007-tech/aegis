import { heuristicCompile } from '../../engine/heuristic';
import { clock, summarizePolicy } from '../../engine/summary';
import { GUARDIAN, SAMPLE_RULES, scoreScamPayment } from './scamPayment';

export { SAMPLE_RULES };

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
      <p className="bento-foot">Compiled in your browser by the AEGIS rule engine.</p>
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
  const decision = scoreScamPayment();

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
  // Counts are for the sandbox's sample month.
  const rows: [string, string][] = [
    ['Gift cards', '3'],
    ['Fake officer', '2'],
    ['“Keep it safe”', '2'],
  ];
  return (
    <ul className="bento-rows">
      {rows.map(([lure, count]) => (
        <li key={lure} className="bento-lure">
          <span className="truncate">{lure}</span>
          <span className="tabular-nums text-[var(--gray-500)]">{count}</span>
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

function hourOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h + (m || 0) / 60;
}

/** Quiet hours on a 24-hour bar, read from the compiled policy so it always matches. */
export function QuietHoursArt() {
  const { start, end } = heuristicCompile(SAMPLE_RULES, GUARDIAN).quietHours;
  const from = (hourOf(start) / 24) * 100;
  const to = (hourOf(end) / 24) * 100;
  return (
    <div>
      <div className="bento-hours" role="presentation">
        <span className="bento-hours-quiet" style={{ left: `${from}%`, right: 0 }} />
        <span className="bento-hours-quiet" style={{ left: 0, width: `${to}%` }} />
      </div>
      <div className="bento-hours-scale">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
      <p className="mt-3 text-[13px] text-[var(--gray-600)]">
        Quiet from {clock(start)} to {clock(end)}. Late-night requests wait for Priya.
      </p>
    </div>
  );
}

/** People Margaret already pays go straight through. */
export function TrustedArt() {
  const people: [string, string][] = [
    ['CVS Pharmacy', 'CV'],
    ['Helen Carter', 'HC'],
    ['City Water', 'CW'],
  ];
  return (
    <ul className="flex flex-col gap-2">
      {people.map(([name, initials]) => (
        <li key={name} className="bento-person">
          <span className="bento-avatar">{initials}</span>
          <span className="truncate">{name}</span>
          <span className="bento-dot" aria-label="Trusted" />
        </li>
      ))}
    </ul>
  );
}
