import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// GitHub Pages serves this repo at /aegis/ and runs the browser demo (no payment server).
// Local dev and Playwright stay at /.
const pages = process.env.GITHUB_PAGES === 'true';
if (pages) process.env.VITE_DEMO_MODE ??= 'true';
const base = process.env.VITE_BASE ?? (pages ? '/aegis/' : '/');

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    // three.js is lazy-loaded only on the landing hero; keep the warning for anything bigger.
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
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
