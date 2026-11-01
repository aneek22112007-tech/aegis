import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { asyncRoute } from '../http/asyncRoute.js';
import { getActiveMandate } from '../mandate/store.js';
import { SENIOR_ID } from '../seed/household.js';

export function createHouseholdRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get(
    '/',
    asyncRoute(async (_req, res) => {
      const senior = await prisma.user.findUnique({ where: { id: SENIOR_ID } });
      const guardian = await prisma.guardian.findFirst({ where: { seniorId: SENIOR_ID } });
      const mandate = await getActiveMandate(prisma, SENIOR_ID);
      const payees = await prisma.payee.findMany({
        where: { userId: SENIOR_ID },
        orderBy: { displayName: 'asc' },
      });
      res.json({
        senior: senior ? { id: senior.id, name: senior.name } : null,
        guardian: guardian
          ? {
              id: guardian.id,
              name: guardian.name,
              contact: guardian.contact,
              relationship: guardian.relationship,
            }
          : null,
        mandate,
        payees: payees.map((payee) => ({
          id: payee.id,
          name: payee.displayName,
          status: payee.status,
        })),
      });
    }),
  );

  return router;
}
