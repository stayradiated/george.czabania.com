// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://stayradiated.github.io',
  base: '/obsidian-public',
  integrations: [sitemap()],
  output: 'static',
});
