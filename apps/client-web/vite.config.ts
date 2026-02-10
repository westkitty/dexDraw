import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses (including Tailscale)
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/ws': {
        target: 'ws://localhost:4000',
        ws: true,
      },
    },
    allowedHosts: ['.ts.net', 'localhost', '.tailscale.net'],
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
});
