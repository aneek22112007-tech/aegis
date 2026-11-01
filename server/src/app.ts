import cors from 'cors';
import express from 'express';
import { loadConfig } from './config.js';

export function createApp() {
  const config = loadConfig();
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.webOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'aegis' });
  });

  return app;
}
