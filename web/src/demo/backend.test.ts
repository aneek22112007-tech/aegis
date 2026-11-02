import { beforeEach, describe, expect, it, vi } from 'vitest';
import { demoRequest } from './backend';
import { subscribe, type GuardianEvent } from './events';
import { resetState } from './store';

type View = { id: string; status: string; level: string; outcome: string; message: string };

function scenario(name: string): View {
  return (demoRequest('POST', `/api/demo/scenarios/${name}`).json as { payment: View }).payment;
}

describe('demo mode practice merchant', () => {
  beforeEach(() => {
    localStorage.clear();
    resetState();
  });

  it('captures the trusted pharmacy refill silently', () => {
    const payment = scenario('pharmacy');
    expect(payment.level).toBe('LOW');
    expect(payment.status).toBe('captured');
    expect(payment.message).toBe('Sent. $48.00 is on its way to CVS Pharmacy.');
  });

  it('holds a new payee and alerts the guardian until approved', () => {
    const events: GuardianEvent[] = [];
    const stop = subscribe((event) => events.push(event));
    const payment = scenario('new-payee');
    expect(payment.status).toBe('held');
    expect(events[0]?.type).toBe('alert');
    const alerts = demoRequest('GET', '/api/guardian/alerts').json as { alerts: View[] };
    expect(alerts.alerts.map((item) => item.id)).toEqual([payment.id]);
    const approved = demoRequest('POST', `/api/payments/${payment.id}/approve`).json as {
      payment: View;
    };
    expect(approved.payment.status).toBe('captured');
    expect(events[1]).toMatchObject({ type: 'resolved', paymentId: payment.id });
    stop();
  });

  it('voids the bail scam, blocks the payee, and drafts a report', () => {
    const payment = scenario('scam');
    expect(payment.level).toBe('HIGH');
    expect(payment.status).toBe('voided');
    const report = demoRequest('GET', `/api/payments/${payment.id}/report`).text ?? '';
    expect(report).toContain('Officer James');
    expect(report).toContain('$1,900.00');
    expect(report).toContain('https://reportfraud.ftc.gov');
    const household = demoRequest('GET', '/api/household').json as {
      payees: { name: string; status: string }[];
    };
    expect(household.payees).toContainEqual(
      expect.objectContaining({ name: 'Officer James', status: 'blocked' }),
    );
  });

  it('lists decisions in the audit log and CSV export', () => {
    scenario('pharmacy');
    scenario('scam');
    const audit = demoRequest('GET', '/api/audit').json as { payments: View[] };
    // three past bills are seeded, plus the two scenarios just run
    expect(audit.payments).toHaveLength(5);
    expect(
      audit.payments.every(
        (row) => new Date((row as View & { createdAt: string }).createdAt).getTime() <= Date.now(),
      ),
    ).toBe(true);
    const csv = demoRequest('GET', '/api/audit/export.csv').text ?? '';
    expect(csv).toContain('when,payee,amount,score,level,decision,status,note');
    expect(csv).toContain('Officer James');
  });

  it('rejects unknown routes and bad amounts with friendly errors', () => {
    expect(() => demoRequest('GET', '/api/nope')).toThrow(/not part of the demo/);
    expect(() =>
      demoRequest('POST', '/api/payments/create', { payeeName: 'A', amount: -1 }),
    ).toThrow(/amount/);
  });

  it('persists state between calls', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    scenario('pharmacy');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
