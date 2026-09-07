// @vitest-environment node
// Los componentes .astro se renderizan a string con el Container API, no se
// montan en jsdom (ver Footer.test.ts para el porqué del entorno node).
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import SupportBanner from './SupportBanner.astro';

describe('SupportBanner.astro', () => {
  it('arranca oculto: la decisión de mostrarlo es del cliente', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SupportBanner);

    expect(html).toMatch(/<aside[^>]*\bhidden\b[^>]*>/);
    expect(html).toContain('id="support-banner"');
  });

  it('lleva a /colaborar y trackea el click', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SupportBanner);

    expect(html).toContain('href="/colaborar"');
    expect(html).toContain("gtag('event', 'support_click'");
  });

  it('tiene un botón de cierre accesible', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SupportBanner);

    expect(html).toContain('aria-label="Cerrar aviso"');
  });
});
