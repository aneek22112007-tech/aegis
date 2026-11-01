import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createPrisma } from '../src/db.js';
import { compileMandateText } from '../src/mandate/compile.js';
import { getActiveMandate, saveMandateVersion } from '../src/mandate/store.js';
import { MANDATE_TEXT, seedHousehold, SENIOR_ID } from '../src/seed/household.js';
import { resetDatabase } from './reset.js';

const prisma = createPrisma(process.env.DATABASE_URL || 'file:./test.db');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('mandate versions', () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedHousehold(prisma);
  });

  it('activates the new version and retires the previous one', async () => {
    const text = 'Never send more than $250 to anyone new. Always allow my pharmacy.';
    const compiled = await compileMandateText({
      text,
      guardian: { name: 'Priya', contact: 'daughter' },
      grok: null,
    });
    const saved = await saveMandateVersion(prisma, SENIOR_ID, text, compiled);
    expect(saved.version).toBe(2);
    expect(saved.active).toBe(true);

    const active = await getActiveMandate(prisma, SENIOR_ID);
    expect(active?.version).toBe(2);
    expect(active?.policy.maxNewPayee).toBe(250);

    const versions = await prisma.mandate.findMany({ where: { userId: SENIOR_ID } });
    expect(versions).toHaveLength(2);
    expect(versions.find((row) => row.version === 1)?.active).toBe(false);
    expect(versions.find((row) => row.rawText === MANDATE_TEXT)?.active).toBe(false);
  });
});
