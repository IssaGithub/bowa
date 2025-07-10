// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// VPS deployment configuration - serves from root domain
export default defineConfig({
  output: 'static',
  // Remove base path for VPS deployment
  site: process.env.SITE_URL || 'https://yourdomain.com',
  vite: {
    // @ts-ignore - TailwindCSS v4 vite plugin type compatibility
    plugins: [tailwindcss()],
  }
}); 