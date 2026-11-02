import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// Static hosts answer unknown paths with 404.html (status 404). Emitting a copy of
// index.html per top-level route makes deep links return 200.
const STATIC_ROUTES = [
  'demo',
  'senior',
  'senior/pay',
  'setup',
  'setup/confirm',
  'guardian',
  'audit',
];
function routeIndexes(): Plugin {
  return {
    name: 'aegis-route-indexes',
    apply: 'build',
    closeBundle() {
      const dist = fileURLToPath(new URL('./dist', import.meta.url));
      const html = fs.readFileSync(path.join(dist, 'index.html'));
      for (const route of STATIC_ROUTES) {
        fs.mkdirSync(path.join(dist, route), { recursive: true });
        fs.writeFileSync(path.join(dist, route, 'index.html'), html);
      }
    },
  };
}

// GitHub Pages serves this repo at /aegis/ and runs the browser demo (no payment server).
// Local dev and Playwright stay at /.
const pages = process.env.GITHUB_PAGES === 'true';
if (pages) process.env.VITE_DEMO_MODE ??= 'true';
const base = process.env.VITE_BASE ?? (pages ? '/aegis/' : '/');

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), ...(pages ? [routeIndexes()] : [])],
  build: {
    // AG Grid is the largest chunk; keep the warning for anything bigger.
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks: {
          grid: ['ag-grid-community', 'ag-grid-react'],
          charts: ['recharts'],
          motion: ['framer-motion'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
