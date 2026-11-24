// Las tres páginas SSR de recursos que existen por cada materia.
const RESOURCE_PAGES = ['resumenes', 'parciales', 'finales'] as const;

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ENTITIES[char]);
}

/**
 * Sitemap de las páginas dinámicas: el índice `/materias` y las páginas de
 * recursos de cada materia. `@astrojs/sitemap` no las ve porque son SSR.
 */
export function buildSubjectsSitemap(siteUrl: string, subjects: Array<{ id: string }>): string {
  const base = siteUrl.replace(/\/+$/, '');
  const paths = [
    '/materias',
    ...subjects.flatMap(({ id }) =>
      RESOURCE_PAGES.map((page) => `/${encodeURIComponent(id)}/${page}`),
    ),
  ];
  const urls = paths.map((path) => `  <url><loc>${escapeXml(base + path)}</loc></url>`);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
