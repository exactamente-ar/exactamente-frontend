// @vitest-environment node
// jsdom reemplaza TextEncoder por una versión cuyo Uint8Array es de otro realm,
// y esbuild (que usa el compilador de Astro por debajo) valida ese invariante y
// explota. Los tests de .astro renderizan a string, así que no necesitan DOM.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Footer from './Footer.astro';

// Los componentes .astro no se pueden montar en jsdom: se renderizan a string
// con el Container API y se asserta sobre el HTML resultante.
describe('Footer.astro', () => {
  it('muestra los sponsors por defecto', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);

    expect(html).toContain('Con el apoyo de');
    expect(html).toContain('HackTandil');
  });

  it('oculta el bloque de sponsors con hideSponsor', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer, {
      props: { hideSponsor: true },
    });

    expect(html).not.toContain('Con el apoyo de');
  });
});
