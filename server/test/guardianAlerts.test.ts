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

describe('guardian alerts', () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedHousehold(prisma);
  });

  it('lists a payment that is waiting', async () => {
    const created = await request(app()).post('/api/demo/scenarios/new-payee');
    const response = await request(app()).get('/api/guardian/alerts');
    expect(response.status).toBe(200);
    expect(response.body.alerts).toHaveLength(1);
    expect(response.body.alerts[0].id).toBe(created.body.payment.id);
    expect(response.body.alerts[0].payeeName).toBe('Helen Brooks');
    expect(response.body.alerts[0].outcome).toBe('waiting');
  });

  it('drops the alert after the guardian approves', async () => {
    const created = await request(app()).post('/api/demo/scenarios/new-payee');
    const approved = await request(app()).post(`/api/payments/${created.body.payment.id}/approve`);
    expect(approved.body.payment.outcome).toBe('sent');
    const response = await request(app()).get('/api/guardian/alerts');
    expect(response.body.alerts).toEqual([]);
  });
});
