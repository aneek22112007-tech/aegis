import type { PrismaClient } from '@prisma/client';
import type { CompiledMandate } from './compile.js';
import { MandatePolicySchema, type MandatePolicy } from './schema.js';

export type StoredMandate = {
  id: string;
  userId: string;
  version: number;
  rawText: string;
  summary: string;
  source: string;
  active: boolean;
  policy: MandatePolicy;
  createdAt: Date;
};

function present(row: {
  id: string;
  userId: string;
  version: number;
  rawText: string;
  policyJson: string;
  summary: string;
  source: string;
  active: boolean;
  createdAt: Date;
}): StoredMandate {
  return {
    id: row.id,
    userId: row.userId,
    version: row.version,
    rawText: row.rawText,
    summary: row.summary,
    source: row.source,
    active: row.active,
    policy: MandatePolicySchema.parse(JSON.parse(row.policyJson)),
    createdAt: row.createdAt,
  };
}

export async function getActiveMandate(
  prisma: PrismaClient,
  userId: string,
): Promise<StoredMandate | null> {
  const row = await prisma.mandate.findFirst({
    where: { userId, active: true },
    orderBy: { version: 'desc' },
  });
  return row ? present(row) : null;
}

export async function saveMandateVersion(
  prisma: PrismaClient,
  userId: string,
  rawText: string,
  compiled: CompiledMandate,
): Promise<StoredMandate> {
  return prisma.$transaction(async (tx) => {
    const last = await tx.mandate.findFirst({
      where: { userId },
      orderBy: { version: 'desc' },
    });
    const version = (last?.version ?? 0) + 1;
    await tx.mandate.updateMany({ where: { userId, active: true }, data: { active: false } });
    const row = await tx.mandate.create({
      data: {
        userId,
        version,
        rawText,
        policyJson: JSON.stringify(compiled.policy),
        summary: compiled.summary,
        source: compiled.source,
        active: true,
      },
    });
    return present(row);
  });
}
