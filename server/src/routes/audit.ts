import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { asyncRoute } from '../http/asyncRoute.js';
import { formatUsd } from '../lib/money.js';
import { toCsv } from '../reports/csv.js';
import { SENIOR_ID } from '../seed/household.js';

function parseReasons(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

async function decisionRows(prisma: PrismaClient) {
  return prisma.payment.findMany({
    where: { userId: SENIOR_ID, decision: { not: null } },
    include: { payee: true },
    orderBy: { createdAt: 'desc' },
  });
}

export function createAuditRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get(
    '/',
    asyncRoute(async (_req, res) => {
      const rows = await decisionRows(prisma);
      res.json({
        payments: rows.map((row) => ({
          id: row.id,
          payeeName: row.payee?.displayName ?? 'Unknown',
          amount: formatUsd(row.amountCents),
          amountCents: row.amountCents,
          note: row.note,
          score: row.riskScore,
          level: row.riskLevel,
          decision: row.decision,
          status: row.status,
          resolution: row.resolution,
          reasons: parseReasons(row.riskReasons),
          createdAt: row.createdAt.toISOString(),
        })),
      });
    }),
  );

  router.get(
    '/export.csv',
    asyncRoute(async (_req, res) => {
      const rows = [...(await decisionRows(prisma))].reverse();
      const csv = toCsv(
        rows.map((row) => ({
          createdAt: row.createdAt,
          payeeName: row.payee?.displayName ?? 'Unknown',
          amount: formatUsd(row.amountCents),
          score: row.riskScore,
          level: row.riskLevel,
          decision: row.decision,
          status: row.status,
          note: row.note,
        })),
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.send(csv);
    }),
  );

  return router;
}
