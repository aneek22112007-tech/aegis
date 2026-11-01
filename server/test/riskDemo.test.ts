import { describe, expect, it } from 'vitest';
import { newPayeeCase, pharmacyCase, scamCase } from '../src/risk/demoCases.js';
import { evaluateRisk } from '../src/risk/evaluate.js';

describe('demo risk cases', () => {
  it('sends $48 to CVS Pharmacy as a low, ordinary payment', () => {
    const decision = evaluateRisk(pharmacyCase);
    expect(decision.level).toBe('LOW');
    expect(decision.decision).toBe('capture');
    expect(decision.score).toBeLessThan(35);
  });

  it('holds $650 to a new payee for the guardian', () => {
    const decision = evaluateRisk(newPayeeCase);
    expect(decision.level).toBe('MEDIUM');
    expect(decision.decision).toBe('hold');
    expect(decision.score).toBeGreaterThanOrEqual(35);
    expect(decision.score).toBeLessThan(70);
  });

  it('stops $1,900 to Officer James', () => {
    const decision = evaluateRisk(scamCase);
    expect(decision.level).toBe('HIGH');
    expect(decision.decision).toBe('void');
    expect(decision.score).toBeGreaterThanOrEqual(70);
    expect(decision.reasons.join(' ')).toMatch(/bail|secret|urgent/i);
  });

  it('keeps the new-payee case in medium during quiet hours', () => {
    const decision = evaluateRisk({
      ...newPayeeCase,
      now: new Date(2026, 5, 2, 23, 30),
    });
    expect(decision.level).toBe('MEDIUM');
  });
});
