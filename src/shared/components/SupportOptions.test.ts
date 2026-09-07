// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import SupportOptions from './SupportOptions.astro';
import { CAFECITO_URL, MERCADOPAGO_ALIAS } from '@/shared/constants/support';

// Los links de plata son lo que no puede estar mal: si dejan de apuntar al
// Cafecito o al alias correctos, la página no sirve de nada.
describe('SupportOptions.astro', () => {
  it('ofrece el Cafecito y el alias de Mercado Pago', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SupportOptions);

    expect(html).toContain(`href="${CAFECITO_URL}"`);
    expect(html).toContain(MERCADOPAGO_ALIAS);
  });

  it('trackea de dónde sale cada colaboración', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SupportOptions);

    expect(html).toContain("method: 'cafecito'");
    expect(html).toContain("method: 'mercadopago'");
  });

  it('muestra el icono del cafecito y el de Mercado Pago', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SupportOptions);

    // Fragmentos del path de cada icono: si el SVG no está, la vía de aporte
    // pierde el ancla visual que la hace reconocible de un vistazo.
    expect(html).toContain('M2,21V19H20V21H2');
    expect(html).toContain('M11.115 16.479');
  });
});
