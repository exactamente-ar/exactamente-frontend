// @vitest-environment node
// Los componentes .astro se renderizan a string con el Container API, no se
// montan en jsdom (ver Footer.test.ts para el porqué del entorno node).
import { getContainerRenderer } from '@astrojs/react';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { describe, expect, it, vi } from 'vitest';
import Layout from './Layout.astro';

// El Header monta islands de React (UserMenu), así que el container necesita
// el renderer de React para poder renderizar el layout completo.
async function render(
  props: Record<string, unknown> = {},
  { url = 'http://localhost:4321/', slots }: { url?: string; slots?: Record<string, string> } = {},
) {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  return container.renderToString(Layout, { props, request: new Request(url), slots });
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

describe('Layout.astro — canonical', () => {
  it('por defecto usa el origen de producción y el path actual, sin query string', async () => {
    const html = await render({}, { url: 'http://localhost:4321/s1/parciales?home=abc' });

    expect(html).toContain(
      '<link rel="canonical" href="https://www.exactamente.com.ar/s1/parciales">',
    );
  });

  it('respeta la URL canónica recibida', async () => {
    const html = await render({ canonical: 'https://www.exactamente.com.ar/otra' });

    expect(html).toContain('<link rel="canonical" href="https://www.exactamente.com.ar/otra">');
  });
});

describe('Layout.astro — Open Graph y Twitter', () => {
  it('publica título, descripción, URL, tipo, sitio e idioma', async () => {
    const html = await render(
      { title: 'Álgebra — Parciales', description: 'Parciales de Álgebra.' },
      { url: 'http://localhost:4321/s1/parciales?home=abc' },
    );

    expect(html).toContain(
      '<meta property="og:title" content="Álgebra — Parciales | Exactamente">',
    );
    expect(html).toContain('<meta property="og:description" content="Parciales de Álgebra.">');
    expect(html).toContain(
      '<meta property="og:url" content="https://www.exactamente.com.ar/s1/parciales">',
    );
    expect(html).toContain('<meta property="og:type" content="website">');
    expect(html).toContain('<meta property="og:site_name" content="Exactamente">');
    expect(html).toContain('<meta property="og:locale" content="es_AR">');
    expect(html).toContain('<meta name="twitter:card" content="summary">');
  });

  it('sin imagen usa el logo con URL absoluta', async () => {
    const html = await render();

    expect(html).toContain(
      '<meta property="og:image" content="https://www.exactamente.com.ar/logo.png">',
    );
  });

  it('convierte en absoluta una imagen relativa', async () => {
    const html = await render({ ogImage: '/images/materia-2.webp' });

    expect(html).toContain(
      '<meta property="og:image" content="https://www.exactamente.com.ar/images/materia-2.webp">',
    );
  });
});

describe('Layout.astro — slot head', () => {
  it('inserta dentro del <head> lo que recibe la página', async () => {
    const html = await render(
      {},
      { slots: { head: '<script type="application/ld+json">{"a":1}</script>' } },
    );
    const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));

    expect(head).toContain('<script type="application/ld+json">{"a":1}</script>');
  });
});

describe('Layout.astro — Modo Estudio apagado', () => {
  it('sin PUBLIC_STUDY_MODE no hay ninguna isla ni markup del Modo Estudio', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', undefined);
    const html = await render({
      studyContext: { subjectId: 's1', subjectName: 'Álgebra', careers: [] },
    });
    vi.unstubAllEnvs();

    expect(html).not.toMatch(/features\/study/);
    expect(html).not.toMatch(/study-context|study-live/);
    expect(html).not.toMatch(/Modo estudio/i);
  });
});

describe('Layout.astro — Modo Estudio prendido', () => {
  it('emite el contexto de materia como JSON en la página', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', 'true');
    const html = await render({
      studyContext: {
        subjectId: 's1',
        subjectName: 'Álgebra',
        careers: [{ careerId: 'c1', careerName: 'Ing. en Sistemas' }],
      },
    });
    vi.unstubAllEnvs();

    const match = html.match(/<script type="application\/json" id="study-context">(.*?)<\/script>/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1])).toEqual({
      subjectId: 's1',
      subjectName: 'Álgebra',
      careers: [{ careerId: 'c1', careerName: 'Ing. en Sistemas' }],
    });
  });

  it('sin contexto no emite el script', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', 'true');
    const html = await render();
    vi.unstubAllEnvs();

    expect(html).not.toMatch(/id="study-context"/);
  });
});

describe('Layout.astro — región live del Modo Estudio', () => {
  it('con el flag prendido hay una sola región polite', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', 'true');
    const html = await render();
    vi.unstubAllEnvs();

    expect(html.match(/id="study-live"/g)).toHaveLength(1);
    expect(html).toMatch(/id="study-live"[^>]*aria-live="polite"/);
  });
});
