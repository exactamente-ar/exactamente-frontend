// @vitest-environment node
// Los componentes .astro se renderizan a string con el Container API, no se
// montan en jsdom (ver Footer.test.ts para el porqué del entorno node).
import { getContainerRenderer } from '@astrojs/react';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { describe, expect, it } from 'vitest';
import Layout from './Layout.astro';

// El Header monta islands de React (UserMenu), así que el container necesita
// el renderer de React para poder renderizar el layout completo.
async function render(props: Record<string, unknown> = {}) {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  return container.renderToString(Layout, { props });
}

describe('Layout.astro', () => {
  it('declara el idioma del sitio en español', async () => {
    const html = await render();

    expect(html).toMatch(/<html[^>]*\blang="es"/);
  });

  it('sin título usa el nombre del sitio', async () => {
    const html = await render();

    expect(html).toContain('<title>Exactamente</title>');
  });

  it('con título lo antepone al nombre del sitio', async () => {
    const html = await render({ title: 'Álgebra — Parciales' });

    expect(html).toContain('<title>Álgebra — Parciales | Exactamente</title>');
  });

  it('sin descripción usa una genérica del sitio', async () => {
    const html = await render();

    expect(html).toMatch(/<meta name="description" content="[^"]*resúmenes, parciales y finales/);
  });

  it('con descripción usa la recibida', async () => {
    const html = await render({ description: 'Parciales de Álgebra.' });

    expect(html).toContain('<meta name="description" content="Parciales de Álgebra.">');
  });
});
