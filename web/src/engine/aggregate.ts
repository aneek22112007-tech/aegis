import { decisionFor, levelFor } from './level.js';
import type { RiskDecision, RuleHit } from './types.js';

export function aggregate(hits: RuleHit[]): RiskDecision {
  const reasons = hits.flatMap((hit) => hit.reasons);
  const forced = hits.find((hit) => hit.force === 'HIGH');
  if (forced) {
    return { score: 100, level: 'HIGH', decision: 'void', reasons, hits };
  }
  let score = hits.reduce((sum, hit) => sum + hit.points, 0);
  score = Math.max(0, Math.min(100, Math.round(score)));
  const caps = hits.flatMap((hit) => (hit.cap === undefined ? [] : [hit.cap]));
  if (caps.length > 0) score = Math.min(score, ...caps);
  const level = levelFor(score);
  return { score, level, decision: decisionFor(level), reasons, hits };
}
