import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createPrisma } from '../src/db.js';
import { createHub } from '../src/guardian/hub.js';
import { createPaymentService } from '../src/payments/service.js';
import { createDemoPayPalClient } from '../src/paypal/demoClient.js';
import { seedHousehold } from '../src/seed/household.js';
import { resetDatabase } from './reset.js';

const prisma = createPrisma(process.env.DATABASE_URL || 'file:./test.db');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('hold timeout', () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedHousehold(prisma);
  });

  it('voids a held payment once the guardian window has passed', async () => {
    let now = new Date('2026-06-02T15:00:00.000Z');
    const paypal = createDemoPayPalClient();
    const service = createPaymentService({
      prisma,
      paypal,
      grok: null,
      hub: createHub(),
      now: () => now,
      holdTimeoutMs: 1_000,
    });
    const app = createApp({
      prisma,
      grok: null,
      paypal,
      service,
      now: () => now,
      holdTimeoutMs: 1_000,
    });
    const created = await request(app).post('/api/demo/scenarios/new-payee');
    expect(created.body.payment.status).toBe('held');
    now = new Date(now.getTime() + 5_000);
    expect(await service.voidExpiredHolds()).toBe(1);
    expect(await service.voidExpiredHolds()).toBe(0);
    const after = await request(app).get(`/api/payments/${created.body.payment.id}`);
    expect(after.body.payment.status).toBe('voided');
    expect(after.body.payment.message).toMatch(/did not answer in time/);
  });
});
