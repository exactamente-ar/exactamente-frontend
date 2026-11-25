// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// El apex redirige a www, así que las URLs canónicas y del sitemap van con www.
const SITE = 'https://www.exactamente.com.ar';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    sitemap({
      // El callback de OAuth no es contenido indexable. /materias ya figura en
      // sitemap-subjects.xml: listarlo acá también lo duplicaría. /estudio son
      // datos personales del navegador (Modo Estudio) y sin el flag responde 404.
      filter: (page) =>
        !page.startsWith(`${SITE}/auth/callback`) &&
        !page.startsWith(`${SITE}/materias`) &&
        !page.startsWith(`${SITE}/estudio`),
      // Las páginas de recursos ([id]/*) son SSR con parámetros y la integración
      // no las ve: se publican en un sitemap dinámico que se suma al índice.
      customSitemaps: [`${SITE}/sitemap-subjects.xml`],
    }),
  ],
  site: SITE,

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});
