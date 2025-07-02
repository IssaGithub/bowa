// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://IssaGithub.github.io',
  base: '/bowa',
  vite: {
    // @ts-ignore - TailwindCSS v4 vite plugin type compatibility
    plugins: [tailwindcss()],
  }
});