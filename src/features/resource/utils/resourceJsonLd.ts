import type { Subject, SubjectCareer } from '@/features/home/types/subjects';
import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import { RESOURCE_TYPE_LABELS } from '@/features/resource/utils/resourceSummary';
import { toAbsoluteUrl } from '@/shared/constants/site';

/** Segmento de la URL de cada tipo: `/[id]/resumenes`, etc. */
export const RESOURCE_TYPE_SLUGS: Record<StringResource, string> = {
  Resumenes: 'resumenes',
  Parciales: 'parciales',
  Finales: 'finales',
};

/** Valor de `learningResourceType`, en singular. */
const LEARNING_RESOURCE_TYPES: Record<StringResource, string> = {
  Resumenes: 'Resumen',
  Parciales: 'Parcial',
  Finales: 'Final',
};

type JsonLdNode = Record<string, unknown>;

interface JsonLdInput {
  subject: Subject;
  type: StringResource;
  /** `null` si no se pudieron obtener los recursos. */
  resources: ResourceFetch[] | null;
  /** URL canónica absoluta de la página actual. */
  pageUrl: string;
  /** Descripción de respaldo si la materia no tiene una propia. */
  description: string;
}

/**
 * Un proveedor por universidad distinta. La facultad va como `department`
 * (la primera que aparezca para esa universidad).
 */
function buildProviders(careers: SubjectCareer[]): JsonLdNode[] {
  const byUniversity = new Map<string, JsonLdNode>();
  for (const career of careers) {
    if (!career.universityName || byUniversity.has(career.universityName)) continue;
    const provider: JsonLdNode = { '@type': 'CollegeOrUniversity', name: career.universityName };
    if (career.facultyName) {
      provider.department = { '@type': 'CollegeOrUniversity', name: career.facultyName };
    }
    byUniversity.set(career.universityName, provider);
  }
  return [...byUniversity.values()];
}

function buildCourse({ subject, pageUrl, description }: JsonLdInput): JsonLdNode {
  const course: JsonLdNode = {
    '@type': 'Course',
    '@id': `${pageUrl}#course`,
    name: subject.title,
    description: subject.description.trim() || description,
    url: pageUrl,
    inLanguage: 'es',
  };
  const providers = buildProviders(subject.careers);
  if (providers.length === 1) course.provider = providers[0];
  else if (providers.length > 1) course.provider = providers;
  return course;
}

function buildItemList({ subject, type, resources, pageUrl }: JsonLdInput): JsonLdNode | null {
  if (!resources || resources.length === 0) return null;
  return {
    '@type': 'ItemList',
    name: `${RESOURCE_TYPE_LABELS[type]} de ${subject.title}`,
    numberOfItems: resources.length,
    itemListElement: resources.map((resource, index) => {
      const item: JsonLdNode = {
        '@type': 'LearningResource',
        name: resource.title,
        learningResourceType: LEARNING_RESOURCE_TYPES[type],
        inLanguage: 'es',
        url: `${pageUrl}#${resource.id}`,
        isPartOf: { '@id': `${pageUrl}#course` },
      };
      if (resource.examYear !== null) item.temporalCoverage = String(resource.examYear);
      return { '@type': 'ListItem', position: index + 1, item };
    }),
  };
}

function buildBreadcrumb({ subject, type, pageUrl }: JsonLdInput): JsonLdNode {
  const subjectUrl = toAbsoluteUrl(
    `/${encodeURIComponent(subject.id)}/${RESOURCE_TYPE_SLUGS.Resumenes}`,
  );
  const crumbs = [
    { name: 'Inicio', item: toAbsoluteUrl('/') },
    // No hay una página propia de la materia: la de resúmenes es su entrada.
    { name: subject.title, item: subjectUrl },
    { name: RESOURCE_TYPE_LABELS[type], item: pageUrl },
  ];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      ...crumb,
    })),
  };
}

/** Datos estructurados de la página de recursos de una materia. */
export function buildResourcesJsonLd(input: JsonLdInput): JsonLdNode {
  const itemList = buildItemList(input);
  return {
    '@context': 'https://schema.org',
    '@graph': [buildCourse(input), ...(itemList ? [itemList] : []), buildBreadcrumb(input)],
  };
}

/**
 * JSON listo para ir dentro de `<script type="application/ld+json">`. Escapar
 * `<` evita que un dato con `</script>` cierre el bloque y meta HTML.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
