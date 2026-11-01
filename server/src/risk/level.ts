import type { Decision, RiskLevel } from './types.js';

export function levelFor(score: number): RiskLevel {
  if (score >= 70) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

export function decisionFor(level: RiskLevel): Decision {
  if (level === 'LOW') return 'capture';
  if (level === 'MEDIUM') return 'hold';
  return 'void';
}
