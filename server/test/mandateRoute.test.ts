import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createPrisma } from '../src/db.js';
import { seedHousehold, SENIOR_ID } from '../src/seed/household.js';
import { resetDatabase } from './reset.js';

const prisma = createPrisma(process.env.DATABASE_URL || 'file:./test.db');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('mandate routes', () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedHousehold(prisma);
  });

  it('compiles wishes on device and stores the next version', async () => {
    const app = createApp({ prisma, grok: null });
    const response = await request(app).post('/api/mandate/compile').send({
      text: 'Never send more than $300 to anyone I have not paid before. Always allow my pharmacy.',
    });
    expect(response.status).toBe(201);
    expect(response.body.mandate.version).toBe(2);
    expect(response.body.mandate.source).toBe('fallback');
    expect(response.body.mandate.policy.maxNewPayee).toBe(300);
    expect(response.body.mandate.summary).toContain('$300');

    const active = await request(app).get('/api/mandate');
    expect(active.body.mandate.version).toBe(2);
  });

  it('rejects a wish that is too short to compile', async () => {
    const app = createApp({ prisma, grok: null });
    const response = await request(app).post('/api/mandate/compile').send({ text: 'no' });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/check/i);
  });

  it('returns Margaret, Priya, and the trusted payees', async () => {
    const app = createApp({ prisma, grok: null });
    const response = await request(app).get('/api/household');
    expect(response.status).toBe(200);
    expect(response.body.senior.name).toBe('Margaret');
    expect(response.body.guardian.name).toBe('Priya');
    expect(response.body.payees.map((payee: { name: string }) => payee.name)).toEqual([
      'CVS Pharmacy',
      'City Utilities',
    ]);
    expect(response.body.mandate.userId).toBe(SENIOR_ID);
  });
});
