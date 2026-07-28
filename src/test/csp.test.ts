// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// El CSP de vercel.json es el único lugar donde se declaran los hosts externos
// que el sitio puede tocar. Un host mal escrito no rompe el build ni los tipos:
// se ve recién en producción, como un recurso bloqueado en la consola.

const FILES_HOST = 'https://files.exactamente.com.ar';

const csp = (() => {
  const config = JSON.parse(
    readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'),
  ) as {
    headers: { headers: { key: string; value: string }[] }[];
  };

  const header = config.headers
    .flatMap((rule) => rule.headers)
    .find((h) => h.key === 'Content-Security-Policy');

  if (!header) throw new Error('vercel.json no define Content-Security-Policy');

  return Object.fromEntries(
    header.value.split(';').map((directive) => {
      const [name, ...sources] = directive.trim().split(/\s+/);
      return [name, sources];
    }),
  ) as Record<string, string[] | undefined>;
})();

describe('CSP de producción', () => {
  // El backend devuelve fileUrl apuntando a este host (R2 detrás de un dominio
  // propio). El iframe de preview lo carga y el botón de descarga le hace fetch.
  it('permite el host de archivos en frame-src', () => {
    expect(csp['frame-src']).toContain(FILES_HOST);
  });

  it('permite el host de archivos en connect-src', () => {
    expect(csp['connect-src']).toContain(FILES_HOST);
  });

  it('no referencia el dominio de archivos sin el .com', () => {
    expect(JSON.stringify(csp)).not.toContain('https://files.exactamente.ar');
  });

  // El dominio está proxeado por Cloudflare, que inyecta el beacon de Web
  // Analytics en cada respuesta. No lo sirve el repo, pero el CSP lo tiene que
  // permitir igual o queda un error en la consola de todas las páginas.
  it('permite el beacon de Cloudflare Web Analytics', () => {
    expect(csp['script-src']).toContain('https://static.cloudflareinsights.com');
    expect(csp['connect-src']).toContain('https://cloudflareinsights.com');
  });
});
