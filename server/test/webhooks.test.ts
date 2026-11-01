import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createPrisma } from '../src/db.js';
import { seedHousehold } from '../src/seed/household.js';
import { resetDatabase } from './reset.js';

const prisma = createPrisma(process.env.DATABASE_URL || 'file:./test.db');

function app() {
  return createApp({ prisma, grok: null, now: () => new Date(2026, 5, 2, 12, 0, 0) });
}

function signed(server: ReturnType<typeof app>, body: object) {
  return request(server)
    .post('/api/webhooks/paypal')
    .set('paypal-transmission-id', 'tx')
    .set('paypal-transmission-time', 'time')
    .set('paypal-cert-url', 'https://example.test/cert')
    .set('paypal-auth-algo', 'SHA256withRSA')
    .set('paypal-transmission-sig', 'demo-valid')
    .send(body);
}

afterAll(async () => {
  await prisma.$disconnect();
});

describe('PayPal webhooks', () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedHousehold(prisma);
  });

  it('rejects a missing signature', async () => {
    const response = await request(app())
      .post('/api/webhooks/paypal')
      .send({ id: 'evt', event_type: 'PING' });
    expect(response.status).toBe(401);
  });

  it('stores an authorization id and ignores a replay', async () => {
    const server = app();
    const created = await request(server)
      .post('/api/payments/create')
      .send({ payeeName: 'Helen Brooks', amount: 20, note: 'Tea' });
    const orderId = created.body.payment.paypalOrderId as string;
    const event = {
      id: 'evt_auth',
      event_type: 'PAYMENT.AUTHORIZATION.CREATED',
      resource: { id: 'AUTH-1', supplementary_data: { related_ids: { order_id: orderId } } },
    };
    expect((await signed(server, event)).status).toBe(200);
    expect((await signed(server, event)).body.duplicate).toBe(true);
    const row = await prisma.payment.findUnique({ where: { id: created.body.payment.id } });
    expect(row?.paypalAuthId).toBe('AUTH-1');
    expect(await prisma.webhookEvent.count()).toBe(1);
  });

  it('marks a capture completed and a void without double-applying', async () => {
    const server = app();
    const created = await request(server)
      .post('/api/payments/create')
      .send({ payeeName: 'Helen Brooks', amount: 20, note: 'Tea' });
    await prisma.payment.update({
      where: { id: created.body.payment.id },
      data: { paypalAuthId: 'AUTH-2', status: 'authorized' },
    });
    const capture = await signed(server, {
      id: 'evt_cap',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      resource: {
        id: 'CAP-2',
        supplementary_data: { related_ids: { authorization_id: 'AUTH-2' } },
      },
    });
    expect(capture.status).toBe(200);
    const captured = await prisma.payment.findUnique({ where: { id: created.body.payment.id } });
    expect(captured?.status).toBe('captured');
    expect(captured?.paypalCaptureId).toBe('CAP-2');

    await prisma.payment.update({
      where: { id: created.body.payment.id },
      data: { status: 'authorized', paypalCaptureId: null },
    });
    await signed(server, {
      id: 'evt_void',
      event_type: 'PAYMENT.AUTHORIZATION.VOIDED',
      resource: { id: 'AUTH-2' },
    });
    const voided = await prisma.payment.findUnique({ where: { id: created.body.payment.id } });
    expect(voided?.status).toBe('voided');
  });
});
