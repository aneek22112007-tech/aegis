import { heuristicCompile } from '../../engine/heuristic';
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
