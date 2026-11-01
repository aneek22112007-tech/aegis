import type { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import { loadConfig } from './config.js';
import type { GrokClient } from './grok/client.js';
import { errorHandler } from './http/errors.js';
import { createHouseholdRouter } from './routes/household.js';
import { createMandateRouter } from './routes/mandate.js';

export type AppDeps = {
  prisma: PrismaClient;
  grok: GrokClient | null;
};

export function createApp(deps?: AppDeps) {
  const config = loadConfig();
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.webOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'aegis' });
  });

  if (deps) {
    app.use('/api/mandate', createMandateRouter(deps));
    app.use('/api/household', createHouseholdRouter(deps.prisma));
  }

  app.use(errorHandler);
  return app;
}
