// @ts-check
import { defineConfig } from 'astro/config';

// The deploy workflow sets these from GitHub Pages, so the menu works on
// https://<user>.github.io/<repo>/ and on a custom domain without code changes.
const site = process.env.SITE_URL || 'https://sebvstianlopz.github.io';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
