import type { PrismaClient } from '@prisma/client';
import { normalizePayeeName } from '../payees/names.js';

export const SENIOR_ID = 'user_margaret';
export const GUARDIAN_USER_ID = 'user_priya';
export const GUARDIAN_ID = 'guardian_priya';

export const MANDATE_TEXT =
  "Never send more than $500 to anyone I haven't paid before. Always allow my pharmacy and my utility company. If someone says it's urgent and secret, block it and call my daughter.";

export const SEEDED_POLICY = {
  maxNewPayee: 500,
  maxPerTxn: 2000,
  dailyLimit: 2000,
  alwaysAllow: ['CVS Pharmacy', 'City Utilities', 'pharmacy', 'utility'],
  alwaysBlock: [] as string[],
  scamKeywords: ['urgent', 'secret', 'bail', 'grandson', 'gift card', 'wire', 'irs', 'warrant'],
  quietHours: { start: '22:00', end: '07:00' },
  guardian: { name: 'Priya', contact: 'daughter' },
  escalation: 'Ask Priya before the money moves.',
};

export const SEEDED_SUMMARY =
  'AEGIS will not send more than $500 to someone Margaret has not paid before. CVS Pharmacy and City Utilities are always allowed. If a request is urgent and secret, it is blocked and Priya is called.';

const PHARMACY_AMOUNTS = [
  32, 36, 40, 42, 44, 45, 46, 47, 48, 48, 49, 50, 51, 52, 54, 55, 42, 38, 46, 50,
];
const UTILITY_AMOUNTS = [
  88, 92, 90, 95, 86, 100, 84, 91, 89, 93, 87, 96, 90, 85, 94, 88, 91, 97, 86, 90,
];

export async function seedHousehold(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { id: SENIOR_ID } });
  if (existing) return;

  await prisma.user.create({
    data: {
      id: SENIOR_ID,
      name: 'Margaret',
      email: 'margaret@example.com',
      role: 'senior',
    },
  });
  await prisma.user.create({
    data: {
      id: GUARDIAN_USER_ID,
      name: 'Priya',
      email: 'priya@example.com',
      role: 'guardian',
    },
  });
  await prisma.guardian.create({
    data: {
      id: GUARDIAN_ID,
      seniorId: SENIOR_ID,
      userId: GUARDIAN_USER_ID,
      name: 'Priya',
      contact: 'daughter',
      relationship: 'daughter',
    },
  });
  await prisma.mandate.create({
    data: {
      userId: SENIOR_ID,
      version: 1,
      rawText: MANDATE_TEXT,
      policyJson: JSON.stringify(SEEDED_POLICY),
      summary: SEEDED_SUMMARY,
      source: 'seed',
      active: true,
    },
  });

  const pharmacy = await prisma.payee.create({
    data: {
      userId: SENIOR_ID,
      displayName: 'CVS Pharmacy',
      normalizedName: normalizePayeeName('CVS Pharmacy'),
      status: 'trusted',
    },
  });
  const utilities = await prisma.payee.create({
    data: {
      userId: SENIOR_ID,
      displayName: 'City Utilities',
      normalizedName: normalizePayeeName('City Utilities'),
      status: 'trusted',
    },
  });

  await prisma.payment.createMany({
    data: historyRows(
      pharmacy.id,
      PHARMACY_AMOUNTS,
      'Prescription refill',
      '2025-06-01T15:00:00.000Z',
    ),
  });
  await prisma.payment.createMany({
    data: historyRows(
      utilities.id,
      UTILITY_AMOUNTS,
      'Monthly utility bill',
      '2025-06-04T15:00:00.000Z',
    ),
  });
}

function historyRows(payeeId: string, amounts: number[], note: string, startIso: string) {
  const start = new Date(startIso);
  return amounts.map((dollars, index) => {
    const createdAt = new Date(start);
    createdAt.setUTCDate(start.getUTCDate() + index * 9);
    return {
      userId: SENIOR_ID,
      payeeId,
      amountCents: Math.round(dollars * 100),
      note,
      status: 'captured',
      decision: 'capture',
      riskScore: 8,
      riskLevel: 'LOW',
      riskReasons: JSON.stringify(['This payee is trusted.', 'The amount is in the usual range.']),
      currency: 'USD',
      createdAt,
    };
  });
}
