import type { Subject } from '@/features/home/types/subjects';
import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import { buildResourcesJsonLd, serializeJsonLd } from '@/features/resource/utils/resourceJsonLd';
import {
  buildResourcesDescription,
  buildResourcesSummary,
} from '@/features/resource/utils/resourceSummary';
import { toAbsoluteUrl } from '@/shared/constants/site';
import { getResources } from '@/shared/services/api';

export interface ResourcesPageData {
  /** Recursos del tipo actual, o `null` si el pedido falló. */
  initialData: ResourceFetch[] | null;
  initialError: string | null;
  /** Párrafos descriptivos para el HTML del servidor. */
  summary: string[];
  /** Meta descripción armada con datos reales. */
  description: string;
  canonicalUrl: string;
  /** JSON-LD ya serializado y seguro para incrustar en un `<script>`. */
  jsonLd: string;
  /** Valor de `Cache-Control` para la respuesta de la página. */
  cacheControl: string;
}

/**
 * Cache en la CDN de Vercel. Con datos: 10 minutos frescos y hasta un día
 * sirviendo la versión vieja mientras se revalida. Así casi ninguna vista llega
 * al backend, que limita las lecturas públicas por IP (y el SSR sale por las IPs
 * compartidas de Vercel). Con error: `no-store`, para no servirle el error a
 * todos durante el tiempo de cache.
 */
export const CACHE_CONTROL = {
  success: 'public, s-maxage=600, stale-while-revalidate=86400',
  error: 'no-store',
} as const;

/**
 * Todo lo que las páginas `/[id]/{resumenes,parciales,finales}` resuelven en el
 * servidor, para que los buscadores que no ejecutan JS vean la lista, el texto
 * descriptivo y los datos estructurados.
 *
 * Se pide solo el tipo actual: un único pedido al backend por vista. Por eso
 * el texto muestra únicamente la cantidad de ese tipo.
 */
export async function loadResourcesPage(
  subject: Subject,
  type: StringResource,
  pathname: string,
): Promise<ResourcesPageData> {
  const result = await getResources(subject.id, type);
  const initialData = result.error === null ? result.data : null;
  const initialError = result.error === null ? null : result.error;

  const canonicalUrl = toAbsoluteUrl(pathname);
  const description = buildResourcesDescription({ subject, type, resources: initialData });

  return {
    initialData,
    initialError,
    summary: buildResourcesSummary({ subject, type, resources: initialData }),
    description,
    canonicalUrl,
    jsonLd: serializeJsonLd(
      buildResourcesJsonLd({
        subject,
        type,
        resources: initialData,
        pageUrl: canonicalUrl,
        description,
      }),
    ),
    cacheControl: initialError === null ? CACHE_CONTROL.success : CACHE_CONTROL.error,
  };
}
