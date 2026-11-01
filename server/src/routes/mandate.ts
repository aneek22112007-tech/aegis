import { Router } from 'express';
import { z } from 'zod';
import type { GrokClient } from '../grok/client.js';
import { asyncRoute } from '../http/asyncRoute.js';
import { compileMandateText } from '../mandate/compile.js';
import { getActiveMandate, saveMandateVersion } from '../mandate/store.js';
import { SENIOR_ID } from '../seed/household.js';
import type { PrismaClient } from '@prisma/client';

export type MandateRouterDeps = {
  prisma: PrismaClient;
  grok: GrokClient | null;
};

const compileBody = z.object({
  text: z.string().trim().min(8).max(2000),
  userId: z.string().min(1).optional(),
});

async function guardianFor(prisma: PrismaClient, userId: string) {
  const guardian = await prisma.guardian.findFirst({ where: { seniorId: userId } });
  return {
    name: guardian?.name || 'Priya',
    contact: guardian?.contact || 'daughter',
  };
}

export function createMandateRouter(deps: MandateRouterDeps): Router {
  const router = Router();

  router.get(
    '/',
    asyncRoute(async (req, res) => {
      const userId = typeof req.query.userId === 'string' ? req.query.userId : SENIOR_ID;
      const mandate = await getActiveMandate(deps.prisma, userId);
      res.json({ mandate });
    }),
  );

  router.post(
    '/compile',
    asyncRoute(async (req, res) => {
      const body = compileBody.parse(req.body);
      const userId = body.userId ?? SENIOR_ID;
      const compiled = await compileMandateText({
        text: body.text,
        guardian: await guardianFor(deps.prisma, userId),
        grok: deps.grok,
      });
      const mandate = await saveMandateVersion(deps.prisma, userId, body.text, compiled);
      res.status(201).json({ mandate });
    }),
  );

  return router;
}
