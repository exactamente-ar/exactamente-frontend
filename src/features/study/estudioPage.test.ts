// @vitest-environment node
// Los .astro se renderizan con el Container API (ver Footer.test.ts). Vive fuera de
// src/pages porque Astro convierte cualquier .ts de ahí en una ruta.
import { getContainerRenderer } from '@astrojs/react';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Estudio from '@/pages/estudio.astro';

async function request() {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  return container.renderToResponse(Estudio, {
    request: new Request('http://localhost:4321/estudio'),
  });
}

afterEach(() => vi.unstubAllEnvs());

describe('/estudio', () => {
  it('con el flag apagado responde 404', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', undefined);
    const response = await request();

    expect(response.status).toBe(404);
  });

  it('con el flag prendido monta las métricas', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', 'true');
    const response = await request();
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toMatch(/<astro-island[^>]*StudyMetrics/);
    expect(html).toContain('<meta name="robots" content="noindex">');
  });
});
