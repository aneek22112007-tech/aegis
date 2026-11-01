import { Router } from 'express';
import { asyncRoute } from '../http/asyncRoute.js';
import type { GuardianHub } from '../guardian/hub.js';
import type { PaymentService } from '../payments/service.js';

export function createGuardianRouter(deps: { hub: GuardianHub; service: PaymentService }): Router {
  const router = Router();

  router.get(
    '/alerts',
    asyncRoute(async (_req, res) => {
      const alerts = await deps.service.listHeld();
      res.json({ alerts });
    }),
  );

  router.get('/events', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
    res.write('event: ready\ndata: {}\n\n');
    const unsubscribe = deps.hub.subscribe((event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });
    req.on('close', () => {
      unsubscribe();
    });
  });

  return router;
}
