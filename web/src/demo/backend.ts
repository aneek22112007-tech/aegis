import { seniorMessage } from '../engine/copy';
import { toCsv } from '../engine/csv';
import { evaluateRisk } from '../engine/evaluate';
import { applyOverrides, loadOverrides } from '../rules/overrides';
import { buildFtcReport } from '../engine/ftc';
import { heuristicCompile } from '../engine/heuristic';
import { dollarsToCents, formatUsd } from '../engine/money';
import { explainDecision } from '../engine/reasons';
import { summarizePolicy } from '../engine/summary';
import type { PayeeStatus } from '../engine/types';
import { publish } from './events';
import { loadState, saveState, type DemoPayment, type DemoState } from './store';

/**
 * In-browser practice merchant used when VITE_DEMO_MODE=true (e.g. GitHub Pages).
 * It runs the same risk engine as the server and mimics the PayPal Orders v2
 * AUTHORIZE -> capture / hold / void lifecycle. No money moves and nothing leaves the browser.
 */

export const GUARDIAN = { name: 'Priya', contact: 'daughter' };

const SCENARIOS = {
  pharmacy: { payeeName: 'CVS Pharmacy', amount: 48, note: 'Prescription refill' },
  'new-payee': { payeeName: 'Helen Brooks', amount: 650, note: 'Birthday gift' },
  scam: {
    payeeName: 'Officer James',
    amount: 1900,
    note: 'URGENT keep this secret, your grandson needs bail',
  },
} as const;

export class DemoHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type DemoResponse = { status: number; json?: unknown; text?: string; type?: string };

function key(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function randomId(prefix: string): string {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}${raw.replace(/-/g, '').slice(0, 16).toUpperCase()}`;
}

function policyOf(state: DemoState) {
  return applyOverrides(heuristicCompile(state.mandateText, GUARDIAN), loadOverrides());
}

function mandateOf(state: DemoState) {
  return {
    id: `mandate_v${state.mandateVersion}`,
    version: state.mandateVersion,
    rawText: state.mandateText,
    summary: summarizePolicy(policyOf(state)),
    source: 'heuristic',
  };
}

export function viewOf(payment: DemoPayment) {
  const copy = seniorMessage({
    status: payment.status,
    resolution: payment.resolution,
    payeeName: payment.payeeName,
    amountCents: payment.amountCents,
    guardianName: GUARDIAN.name,
  });
  return {
    id: payment.id,
    payeeName: payment.payeeName,
    amountCents: payment.amountCents,
    amount: formatUsd(payment.amountCents),
    note: payment.note,
    status: payment.status,
    level: payment.level,
    score: payment.score,
    decision: payment.decision,
    resolution: payment.resolution,
    reasons: payment.reasons,
    outcome: copy.outcome,
    message: copy.message,
    paypalOrderId: payment.paypalOrderId,
    createdAt: payment.createdAt,
  };
}

function find(state: DemoState, id: string): DemoPayment {
  const payment = state.payments.find((item) => item.id === id);
  if (!payment) throw new DemoHttpError('We could not find that payment.', 404);
  return payment;
}

function payeeStatus(state: DemoState, name: string): PayeeStatus {
  return state.payees.find((payee) => key(payee.name) === key(name))?.status ?? 'unknown';
}

function setPayee(state: DemoState, name: string, status: 'trusted' | 'blocked') {
  const existing = state.payees.find((payee) => key(payee.name) === key(name));
  if (existing) existing.status = status;
  else state.payees.push({ id: randomId('payee_'), name, status });
}

export function createDemoPayment(
  state: DemoState,
  input: { payeeName: string; amount: number; note?: string },
): DemoPayment {
  const payeeName = input.payeeName.trim();
  if (!payeeName) throw new DemoHttpError('Please say who you are paying.', 400);
  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > 100_000) {
    throw new DemoHttpError('Please enter an amount between $0.01 and $100,000.', 400);
  }
  const payment: DemoPayment = {
    id: randomId('pay_'),
    payeeName,
    amountCents: dollarsToCents(input.amount),
    note: (input.note ?? '').trim().slice(0, 500),
    status: 'created',
    level: null,
    score: null,
    decision: null,
    resolution: null,
    reasons: [],
    paypalOrderId: randomId('DEMO-ORDER-'),
    authorizationId: null,
    createdAt: new Date().toISOString(),
  };
  state.payments.push(payment);
  return payment;
}

export function authorizeDemoPayment(state: DemoState, id: string, now = new Date()): DemoPayment {
  const payment = find(state, id);
  if (payment.status !== 'created') return payment;
  const dayAgo = now.getTime() - 24 * 60 * 60 * 1000;
  const recent = state.payments.filter(
    (item) =>
      item.id !== payment.id &&
      (item.status === 'captured' || item.status === 'held') &&
      new Date(item.createdAt).getTime() >= dayAgo,
  );
  const decision = evaluateRisk({
    amount: payment.amountCents / 100,
    payeeName: payment.payeeName,
    note: payment.note,
    payeeStatus: payeeStatus(state, payment.payeeName),
    recentPaymentCount: recent.length,
    recentPaymentTotal: recent.reduce((sum, item) => sum + item.amountCents / 100, 0),
    historyAmounts: state.history[key(payment.payeeName)] ?? [],
    now,
    policy: policyOf(state),
  });
  payment.authorizationId = randomId('DEMO-AUTH-');
  payment.score = decision.score;
  payment.level = decision.level;
  payment.decision = decision.decision;
  payment.reasons = explainDecision(decision);
  if (decision.decision === 'capture') {
    capture(state, payment);
    payment.resolution = 'auto';
  } else if (decision.decision === 'hold') {
    payment.status = 'held';
    payment.resolution = null;
    publish({
      type: 'alert',
      alert: {
        paymentId: payment.id,
        payeeName: payment.payeeName,
        amount: formatUsd(payment.amountCents),
        amountCents: payment.amountCents,
        note: payment.note,
        reasons: payment.reasons,
        score: decision.score,
        level: decision.level,
        createdAt: payment.createdAt,
      },
    });
  } else {
    payment.status = 'voided';
    payment.resolution = 'policy';
    setPayee(state, payment.payeeName, 'blocked');
  }
  return payment;
}

function capture(state: DemoState, payment: DemoPayment) {
  payment.status = 'captured';
  const history = state.history[key(payment.payeeName)] ?? [];
  state.history[key(payment.payeeName)] = [...history, payment.amountCents / 100];
  setPayee(state, payment.payeeName, 'trusted');
}

export function guardianDecide(state: DemoState, id: string, approve: boolean): DemoPayment {
  const payment = find(state, id);
  if (payment.status !== 'held') {
    throw new DemoHttpError('That payment is no longer waiting for a decision.', 409);
  }
  if (approve) capture(state, payment);
  else payment.status = 'voided';
  payment.resolution = 'guardian';
  const view = viewOf(payment);
  publish({ type: 'resolved', paymentId: id, outcome: view.outcome, message: view.message });
  return payment;
}

function decided(state: DemoState): DemoPayment[] {
  return state.payments
    .filter((payment) => payment.decision !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function auditRow(payment: DemoPayment) {
  const { outcome: _outcome, message: _message, paypalOrderId: _order, ...row } = viewOf(payment);
  return row;
}

function route(state: DemoState, method: string, path: string, body: unknown): DemoResponse {
  const input = (body ?? {}) as Record<string, unknown>;
  if (method === 'GET' && path === '/api/public-config') {
    return { status: 200, json: { paypalClientId: '', paypalEnv: 'sandbox', demoMode: true } };
  }
  if (method === 'GET' && path === '/api/household') {
    return {
      status: 200,
      json: {
        senior: { id: 'user_margaret', name: 'Margaret' },
        guardian: {
          id: 'guardian_priya',
          name: 'Priya',
          contact: 'daughter',
          relationship: 'daughter',
        },
        mandate: mandateOf(state),
        payees: state.payees,
      },
    };
  }
  if (method === 'GET' && path === '/api/mandate') {
    return { status: 200, json: { mandate: mandateOf(state) } };
  }
  if (method === 'POST' && path === '/api/mandate/compile') {
    const text = String(input.text ?? '').trim();
    if (text.length < 10)
      throw new DemoHttpError('Please write your wishes in a sentence or two.', 400);
    state.mandateText = text;
    state.mandateVersion += 1;
    return { status: 201, json: { mandate: mandateOf(state) } };
  }
  if (method === 'POST' && path === '/api/payments/create') {
    const payment = createDemoPayment(state, {
      payeeName: String(input.payeeName ?? ''),
      amount: Number(input.amount),
      note: String(input.note ?? ''),
    });
    return { status: 201, json: { payment: viewOf(payment) } };
  }
  if (method === 'GET' && path === '/api/guardian/alerts') {
    const alerts = state.payments.filter((payment) => payment.status === 'held').map(viewOf);
    return { status: 200, json: { alerts: alerts.reverse() } };
  }
  if (method === 'GET' && path === '/api/audit') {
    return { status: 200, json: { payments: decided(state).map(auditRow) } };
  }
  if (method === 'GET' && path === '/api/audit/export.csv') {
    const csv = toCsv(
      [...decided(state)].reverse().map((payment) => ({
        createdAt: new Date(payment.createdAt),
        payeeName: payment.payeeName,
        amount: formatUsd(payment.amountCents),
        score: payment.score,
        level: payment.level,
        decision: payment.decision,
        status: payment.status,
        note: payment.note,
      })),
    );
    return { status: 200, text: csv, type: 'text/csv' };
  }
  const scenario = path.match(/^\/api\/demo\/scenarios\/([\w-]+)$/);
  if (method === 'POST' && scenario) {
    const preset = SCENARIOS[scenario[1] as keyof typeof SCENARIOS];
    if (!preset) throw new DemoHttpError('That demo does not exist.', 404);
    const payment = authorizeDemoPayment(state, createDemoPayment(state, preset).id);
    return { status: 201, json: { payment: viewOf(payment) } };
  }
  const match = path.match(/^\/api\/payments\/([\w-]+)(?:\/(authorize|approve|deny|report))?$/);
  if (match) {
    const [, id, action] = match;
    if (method === 'GET' && !action)
      return { status: 200, json: { payment: viewOf(find(state, id)) } };
    if (method === 'POST' && action === 'authorize') {
      return { status: 200, json: { payment: viewOf(authorizeDemoPayment(state, id)) } };
    }
    if (method === 'POST' && (action === 'approve' || action === 'deny')) {
      return {
        status: 200,
        json: { payment: viewOf(guardianDecide(state, id, action === 'approve')) },
      };
    }
    if (method === 'GET' && action === 'report') {
      const payment = find(state, id);
      if (payment.status !== 'voided')
        throw new DemoHttpError('There is no report for that payment.', 404);
      const report = buildFtcReport({
        seniorName: 'Margaret',
        guardianName: GUARDIAN.name,
        guardianContact: GUARDIAN.contact,
        payeeName: payment.payeeName,
        amountCents: payment.amountCents,
        note: payment.note,
        reasons: payment.reasons,
        createdAt: new Date(payment.createdAt),
      });
      const ids = `\nPractice merchant IDs (no money moved)\nOrder: ${payment.paypalOrderId}\nAuthorization: ${payment.authorizationId ?? 'none'}\nStatus: VOIDED\n`;
      return { status: 200, text: report + ids, type: 'text/plain' };
    }
  }
  throw new DemoHttpError('That page is not part of the demo.', 404);
}

/** Handle one API call against the in-browser practice merchant. */
export function demoRequest(method: string, path: string, body?: unknown): DemoResponse {
  const state = loadState();
  const response = route(state, method.toUpperCase(), path.split('?')[0], body);
  saveState(state);
  return response;
}
