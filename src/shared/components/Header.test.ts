// @vitest-environment node
// Los .astro se renderizan a string con el Container API (ver Footer.test.ts
// para el porqué del entorno node).
import { getContainerRenderer } from '@astrojs/react';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Header from './Header.astro';

async function render() {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  return container.renderToString(Header);
}

afterEach(() => vi.unstubAllEnvs());

describe('Header.astro — Modo Estudio', () => {
  it('con el flag apagado no monta el chip del timer', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', undefined);
    const html = await render();

    expect(html).not.toMatch(/StudyChip/);
    expect(html).not.toMatch(/Modo estudio/i);
  });

  it('con el flag prendido monta el chip en la barra, fuera del menú mobile', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', 'true');
    const html = await render();

    expect(html.match(/<astro-island[^>]*StudyChip/g)).toHaveLength(1);
    const menu = html.slice(html.indexOf('class="mobile-menu'));
    expect(menu).not.toMatch(/StudyChip/);
  });

  it('con el flag prendido el menú mobile tiene el acceso a las métricas', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', 'true');
    const html = await render();

    const menu = html.slice(html.indexOf('class="mobile-menu'));
    expect(menu).toMatch(/<a[^>]*href="\/estudio"[^>]*>[\s\S]*?Mis métricas de estudio/);
  });

  it('con el flag apagado no hay acceso a /estudio', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', undefined);
    const html = await render();

    expect(html).not.toContain('/estudio');
  });
});
