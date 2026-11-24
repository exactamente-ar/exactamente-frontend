import { SUBJECTS_INDEX_CACHE_CONTROL } from '@/features/subjects-index/constants/cache';
import { buildSubjectsSitemap } from '@/features/subjects-index/utils/buildSubjectsSitemap';
import { getAllSubjects } from '@/shared/services/api';

/**
 * Respuesta del endpoint `/sitemap-subjects.xml`.
 *
 * Si la API falla devuelve 503 sin cache: un sitemap vacío le diría a los
 * buscadores que las páginas de materias dejaron de existir.
 */
export async function subjectsSitemapResponse(siteUrl: string): Promise<Response> {
  const result = await getAllSubjects();

  if (result.error !== null) {
    return new Response('Sitemap no disponible temporalmente.', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'Retry-After': '300',
      },
    });
  }

  return new Response(buildSubjectsSitemap(siteUrl, result.data), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': SUBJECTS_INDEX_CACHE_CONTROL,
    },
  });
}
