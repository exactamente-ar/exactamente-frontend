import { describe, expect, it } from 'vitest';
import { buildSubjectsSitemap, escapeXml } from './buildSubjectsSitemap';

const SITE = 'https://www.exactamente.com.ar';

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
}

describe('escapeXml', () => {
  it('escapa los cinco caracteres reservados de XML', () => {
    expect(escapeXml(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&apos;f');
  });
});

describe('buildSubjectsSitemap', () => {
  it('arma un urlset válido con la declaración XML y el namespace de sitemaps', () => {
    const xml = buildSubjectsSitemap(SITE, []);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('sin materias igual incluye el índice /materias', () => {
    expect(locs(buildSubjectsSitemap(SITE, []))).toEqual([`${SITE}/materias`]);
  });

  it('agrega las tres páginas de recursos por materia con URLs absolutas', () => {
    const xml = buildSubjectsSitemap(SITE, [{ id: 's1' }, { id: 's2' }]);

    expect(locs(xml)).toEqual([
      `${SITE}/materias`,
      `${SITE}/s1/resumenes`,
      `${SITE}/s1/parciales`,
      `${SITE}/s1/finales`,
      `${SITE}/s2/resumenes`,
      `${SITE}/s2/parciales`,
      `${SITE}/s2/finales`,
    ]);
  });

  it('tolera una barra final en la URL del sitio', () => {
    expect(locs(buildSubjectsSitemap(`${SITE}/`, []))).toEqual([`${SITE}/materias`]);
  });

  it('codifica y escapa ids con caracteres especiales', () => {
    const xml = buildSubjectsSitemap(SITE, [{ id: 'a&b c' }]);

    expect(xml).toContain(`<loc>${SITE}/a%26b%20c/resumenes</loc>`);
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
  });
});
