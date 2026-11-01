import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { mountStaticWeb } from './staticWeb.js';

describe('mountStaticWeb', () => {
  it('serves index.html for app routes but leaves /api alone', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'aegis-web-'));
    writeFileSync(path.join(dir, 'index.html'), '<div id="root"></div>');
    const app = express();
    expect(mountStaticWeb(app, dir)).toBe(true);
    app.get('/api/health', (_req, res) => res.json({ ok: true }));
    const page = await request(app).get('/guardian');
    expect(page.status).toBe(200);
    expect(page.text).toContain('id="root"');
    const api = await request(app).get('/api/health');
    expect(api.body).toEqual({ ok: true });
  });

  it('does nothing without a built app', () => {
    expect(mountStaticWeb(express(), undefined)).toBe(false);
    expect(mountStaticWeb(express(), '/nope')).toBe(false);
  });
});
