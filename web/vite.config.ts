import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  server: {
    // Point at the Bun server (default) or `wrangler dev` with API_URL=http://localhost:8787
    proxy: {
      '/api': process.env.API_URL || 'http://localhost:3000',
    },
  },
});
