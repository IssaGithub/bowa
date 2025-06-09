// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:9000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Ensure proper headers are forwarded
              proxyReq.setHeader('Origin', 'http://localhost:9000');
              proxyReq.setHeader('Access-Control-Request-Method', req.method);
              const apiKey = req.headers['x-publishable-api-key'];
              if (apiKey && typeof apiKey === 'string') {
                proxyReq.setHeader('x-publishable-api-key', apiKey);
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Handle CORS headers
              proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:4321';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,x-publishable-api-key';
            });
          }
        }
      }
    }
  }
});