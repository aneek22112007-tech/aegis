import { existsSync } from 'node:fs';
import path from 'node:path';
import express, { type Express } from 'express';

/**
 * Serve the built React app (web/dist) from the API server so the whole stack
 * runs as one service in production. Unknown non-API paths fall back to index.html.
 */
export function mountStaticWeb(app: Express, dir: string | undefined): boolean {
  if (!dir) return false;
  const root = path.resolve(dir);
  const index = path.join(root, 'index.html');
  if (!existsSync(index)) return false;
  app.use(express.static(root, { index: false, maxAge: '1h' }));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(index);
  });
  return true;
}
