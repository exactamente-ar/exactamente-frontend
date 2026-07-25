/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig envuelve la config de Vite que arma Astro, así que los tests
// heredan el alias @/, el plugin de Tailwind y el manejo de archivos .astro.
// No usar un defineConfig de Vitest pelado: perdería todo eso.
export default getViteConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
