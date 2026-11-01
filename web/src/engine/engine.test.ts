import { describe, expect, it } from 'vitest';
import * as server from '../../../server/src/risk/demoCases';
import { evaluateRisk as serverEvaluate } from '../../../server/src/risk/evaluate';
import { evaluateRisk } from './evaluate';
import { heuristicCompile } from './heuristic';

const MANDATE =
  "Never send more than $500 to anyone I haven't paid before. Always allow my pharmacy and my utility company. If someone says it's urgent and secret, block it and call my daughter.";

describe('browser risk engine', () => {
  const policy = heuristicCompile(MANDATE, { name: 'Priya', contact: 'daughter' });

  it('compiles the same policy as the server', () => {
    expect(policy).toEqual(server.DEMO_POLICY);
  });

  it.each([
    ['pharmacy', server.pharmacyCase, 'LOW'],
    ['new payee', server.newPayeeCase, 'MEDIUM'],
    ['scam', server.scamCase, 'HIGH'],
  ] as const)('matches the server for the %s case', (_name, input, level) => {
    const browser = evaluateRisk(input);
    expect(browser.level).toBe(level);
    expect(browser).toEqual(serverEvaluate(input));
  });
});
