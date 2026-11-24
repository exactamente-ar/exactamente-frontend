import type { Subject, SubjectCareer } from '@/features/home/types/subjects';
import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';

const NOUNS: Record<StringResource, { singular: string; plural: string }> = {
  Resumenes: { singular: 'resumen', plural: 'resúmenes' },
  Parciales: { singular: 'parcial', plural: 'parciales' },
  Finales: { singular: 'final', plural: 'finales' },
};

/** Nombre visible del tipo, con tilde: `Resumenes` → `Resúmenes`. */
export const RESOURCE_TYPE_LABELS: Record<StringResource, string> = {
  Resumenes: 'Resúmenes',
  Parciales: 'Parciales',
  Finales: 'Finales',
};

/** Une una lista en castellano: `a`, `a y b`, `a, b y c`. */
function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

/** Cantidad con el sustantivo del tipo en singular o plural: `1 parcial`, `3 parciales`. */
export function formatResourceCount(count: number, type: StringResource): string {
  const noun = NOUNS[type];
  return `${count} ${count === 1 ? noun.singular : noun.plural}`;
}

function uniqueCareers(careers: SubjectCareer[]): SubjectCareer[] {
  const seen = new Set<string>();
  return careers.filter((career) => {
    const key = `${career.careerName}|${career.facultyName}|${career.universityName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Carreras con su facultad y universidad, o `null` si no hay ninguna. */
export function formatCareers(careers: SubjectCareer[]): string | null {
  const items = uniqueCareers(careers).map((career) => {
    const place = [career.facultyName, career.universityName].filter(Boolean).join(', ');
    return place ? `${career.careerName} (${place})` : career.careerName;
  });
  return items.length > 0 ? joinList(items) : null;
}

/** Año y cuatrimestre de cursada, o `null` si el año no es válido. */
export function formatCursada(year: number, quadmester: number): string | null {
  if (!Number.isInteger(year) || year < 1) return null;
  const yearText = `${year}.º año`;
  return quadmester === 1 || quadmester === 2
    ? `${yearText}, ${quadmester}.º cuatrimestre`
    : yearText;
}

export type ExamYearRange = { from: number; to: number };

/** Primer y último año de examen entre los recursos, ignorando los nulos. */
export function getExamYearRange(resources: ResourceFetch[]): ExamYearRange | null {
  const years = resources
    .map((resource) => resource.examYear)
    .filter((year): year is number => year !== null);
  if (years.length === 0) return null;
  return { from: Math.min(...years), to: Math.max(...years) };
}

export function formatExamYearRange(range: ExamYearRange): string {
  return range.from === range.to ? `de ${range.from}` : `de ${range.from} a ${range.to}`;
}

interface SummaryInput {
  subject: Subject;
  type: StringResource;
  /** `null` si no se pudieron obtener los recursos del tipo actual. */
  resources: ResourceFetch[] | null;
}

/**
 * Párrafos descriptivos de la página de recursos. Van en el HTML del servidor
 * para que los buscadores que no ejecutan JS tengan contexto de la materia.
 */
export function buildResourcesSummary({ subject, type, resources }: SummaryInput): string[] {
  const lines: string[] = [];

  const careers = formatCareers(subject.careers);
  if (careers) lines.push(`${subject.title} se cursa en ${careers}.`);

  const cursada = formatCursada(subject.year, subject.quadmester);
  if (cursada) lines.push(`Corresponde al ${cursada} del plan de estudios.`);

  // Solo se conoce la cantidad del tipo actual: un único pedido por vista. Si
  // ese pedido falló no se muestra ninguna cifra en vez de un cero falso.
  if (resources) {
    const count = resources.length;
    if (count === 0) {
      lines.push(`Todavía no hay ${NOUNS[type].plural} publicados.`);
    } else {
      const published = count === 1 ? 'publicado' : 'publicados';
      const range = getExamYearRange(resources);
      const rangeText = range ? `, ${formatExamYearRange(range)}` : '';
      lines.push(`Hay ${formatResourceCount(count, type)} ${published}${rangeText}.`);
    }
  }

  return lines;
}

/** Contexto breve para la meta descripción: primera carrera y su universidad. */
function shortCareerContext(careers: SubjectCareer[]): string | null {
  const first = careers[0];
  if (!first) return null;
  return [first.careerName, first.universityName].filter(Boolean).join(', ') || null;
}

/** Meta descripción de la página de recursos, armada con datos reales. */
export function buildResourcesDescription({ subject, type, resources }: SummaryInput): string {
  const context = shortCareerContext(subject.careers);
  const head = `${RESOURCE_TYPE_LABELS[type]} de ${subject.title}${context ? ` (${context})` : ''}`;

  const count = resources?.length ?? 0;
  if (!resources || count === 0) return `${head}, compartidos por estudiantes.`;

  const range = getExamYearRange(resources);
  const rangeText = range ? ` ${formatExamYearRange(range)}` : '';
  const shared = count === 1 ? 'compartido' : 'compartidos';
  return `${head}: ${formatResourceCount(count, type)}${rangeText}, ${shared} por estudiantes.`;
}
