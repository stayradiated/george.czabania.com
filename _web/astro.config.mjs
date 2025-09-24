// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

import expressiveCode from "astro-expressive-code";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://george.czabania.com",
  integrations: [sitemap(), svelte(), expressiveCode({
    themes: ['light-plus']
  }), mdx(), icon()],
  output: "static",
});