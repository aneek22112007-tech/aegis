import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createPrisma } from '../src/db.js';
import { seedHousehold } from '../src/seed/household.js';
import { resetDatabase } from './reset.js';

const prisma = createPrisma(process.env.DATABASE_URL || 'file:./test.db');
const noon = new Date(2026, 5, 2, 12, 0, 0);

function app() {
  return createApp({ prisma, grok: null, now: () => noon });
}

afterAll(async () => {
  await prisma.$disconnect();
});

describe('payment decisions', () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedHousehold(prisma);
  });

  it('captures $48 to CVS Pharmacy', async () => {
    const response = await request(app()).post('/api/demo/scenarios/pharmacy');
    expect(response.status).toBe(201);
    expect(response.body.payment.outcome).toBe('sent');
    expect(response.body.payment.level).toBe('LOW');
    expect(response.body.payment.status).toBe('captured');
    expect(response.body.payment.message).toMatch(/Sent/);
  });

  it('holds $650 to a new payee', async () => {
    const response = await request(app()).post('/api/demo/scenarios/new-payee');
    expect(response.status).toBe(201);
    expect(response.body.payment.outcome).toBe('waiting');
    expect(response.body.payment.level).toBe('MEDIUM');
    expect(response.body.payment.status).toBe('held');
  });

  it('voids the Officer James payment, blocks the payee, and drafts a report', async () => {
    const response = await request(app()).post('/api/demo/scenarios/scam');
    expect(response.status).toBe(201);
    expect(response.body.payment.outcome).toBe('stopped');
    expect(response.body.payment.level).toBe('HIGH');
    expect(response.body.payment.status).toBe('voided');
    const payee = await prisma.payee.findFirst({ where: { displayName: 'Officer James' } });
    expect(payee?.status).toBe('blocked');
    const report = await request(app()).get(`/api/payments/${response.body.payment.id}/report`);
    expect(report.status).toBe(200);
    expect(report.text).toContain('Officer James');
    expect(report.text).toContain('$1,900.00');
    expect(report.text).toContain('reportfraud.ftc.gov');
    expect(report.text).toContain('VOIDED');
  });

  it('returns the original payment for a repeated idempotency key', async () => {
    const server = app();
    const first = await request(server)
      .post('/api/payments/create')
      .set('Idempotency-Key', 'same-key')
      .send({ payeeName: 'Helen Brooks', amount: 20, note: 'Tea' });
    const second = await request(server)
      .post('/api/payments/create')
      .set('Idempotency-Key', 'same-key')
      .send({ payeeName: 'Helen Brooks', amount: 20, note: 'Tea' });
    expect(second.body.payment.id).toBe(first.body.payment.id);
    expect(await prisma.payment.count({ where: { idempotencyKey: 'same-key' } })).toBe(1);
  });

  it('lets Priya approve a held payment', async () => {
    const created = await request(app()).post('/api/demo/scenarios/new-payee');
    const approved = await request(app()).post(`/api/payments/${created.body.payment.id}/approve`);
    expect(approved.body.payment.outcome).toBe('sent');
    expect(approved.body.payment.status).toBe('captured');
  });

  it('lets Priya deny a held payment', async () => {
    const created = await request(app()).post('/api/demo/scenarios/new-payee');
    const denied = await request(app()).post(`/api/payments/${created.body.payment.id}/deny`);
    expect(denied.body.payment.outcome).toBe('stopped');
    expect(denied.body.payment.message).toMatch(/Priya said not to send/);
  });

  it('lists every decision and exports CSV', async () => {
    const server = app();
    await request(server).post('/api/demo/scenarios/pharmacy');
    await request(server).post('/api/demo/scenarios/scam');
    const audit = await request(server).get('/api/audit');
    const names = audit.body.payments.map((row: { payeeName: string }) => row.payeeName);
    expect(names).toEqual(expect.arrayContaining(['CVS Pharmacy', 'Officer James']));
    const csv = await request(server).get('/api/audit/export.csv');
    expect(csv.status).toBe(200);
    expect(csv.text.split('\n')[0]).toBe('when,payee,amount,score,level,decision,status,note');
    expect(csv.text).toContain('Officer James');
    expect(csv.text).toContain('CVS Pharmacy');
  });
});
