import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://cricket.sportmonks.com',
          changeOrigin: true,
          /**
           * Automatically inject the secret token from .env for all requests.
           * This keeps it hidden from the browser network tab too.
           */
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const url = new URL(proxyReq.path, 'https://cricket.sportmonks.com');
              url.searchParams.set('api_token', env.SPORTMONKS_API_TOKEN);
              proxyReq.path = url.pathname + url.search;
            });
          },
        },
      },
    },
  };
});
