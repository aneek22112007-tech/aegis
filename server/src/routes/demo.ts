import { Router } from 'express';
import { asyncRoute } from '../http/asyncRoute.js';
import { PayPalError } from '../paypal/errors.js';
import { DEMO_SCENARIOS, type DemoScenario } from '../payments/scenarios.js';
import type { PaymentService } from '../payments/service.js';

export function createDemoRouter(service: PaymentService): Router {
  const router = Router();
  router.post(
    '/scenarios/:scenario',
    asyncRoute(async (req, res) => {
      const key = String(req.params.scenario);
      if (!(key in DEMO_SCENARIOS)) {
        throw new PayPalError('That demo does not exist.', 404, 'NO_SCENARIO', false);
      }
      const scenario = DEMO_SCENARIOS[key as DemoScenario];
      const created = await service.createPayment(scenario);
      const payment = await service.authorizePayment(created.id);
      res.status(201).json({ payment });
    }),
  );
  return router;
}
