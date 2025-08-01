// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { 
  transformerNotationHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
  transformerMetaHighlight 
} from '@shikijs/transformers';

// https://astro.build/config
export default defineConfig({
  site: 'https://george.czabania.com',
  integrations: [sitemap()],
  output: 'static',
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
      transformers: [
        transformerNotationHighlight(),
        transformerNotationDiff(),
        transformerNotationFocus(),
        transformerMetaHighlight(),
      ],
    },
  },
});
