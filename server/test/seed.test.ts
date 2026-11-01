import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createPrisma } from '../src/db.js';
import { MANDATE_TEXT, seedHousehold, SENIOR_ID } from '../src/seed/household.js';
import { resetDatabase } from './reset.js';

const prisma = createPrisma(process.env.DATABASE_URL || 'file:./test.db');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('seedHousehold', () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  it('creates Margaret, Priya, and twenty payments for each trusted payee', async () => {
    await seedHousehold(prisma);

    const senior = await prisma.user.findUnique({ where: { id: SENIOR_ID } });
    expect(senior?.name).toBe('Margaret');

    const guardian = await prisma.guardian.findFirst({ where: { seniorId: SENIOR_ID } });
    expect(guardian?.name).toBe('Priya');
    expect(guardian?.relationship).toBe('daughter');

    const payees = await prisma.payee.findMany({ orderBy: { displayName: 'asc' } });
    expect(payees.map((payee) => payee.displayName)).toEqual(['CVS Pharmacy', 'City Utilities']);
    expect(payees.every((payee) => payee.status === 'trusted')).toBe(true);

    for (const payee of payees) {
      expect(await prisma.payment.count({ where: { payeeId: payee.id } })).toBe(20);
    }

    const mandate = await prisma.mandate.findFirst({ where: { userId: SENIOR_ID, active: true } });
    expect(mandate?.rawText).toBe(MANDATE_TEXT);
    expect(mandate?.version).toBe(1);
  });

  it('does not duplicate the household on a second run', async () => {
    await seedHousehold(prisma);
    await seedHousehold(prisma);
    expect(await prisma.user.count()).toBe(2);
    expect(await prisma.payment.count()).toBe(40);
  });
});
