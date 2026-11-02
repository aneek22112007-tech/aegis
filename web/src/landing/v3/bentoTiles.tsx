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
