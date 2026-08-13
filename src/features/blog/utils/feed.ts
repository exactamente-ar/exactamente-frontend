import type { BlogPost, BlogSubtopic } from '../types/blog';

/**
 * Valor centinela del chip "Todos". No es un subtema real: sirve para ver el
 * feed completo sin filtrar.
 */
export const ALL_SUBTOPICS_ID = '__all__';

/**
 * Devuelve los posts visibles según el chip de subtema seleccionado. Con
 * `ALL_SUBTOPICS_ID` se muestran todos; con un id real, solo los de ese subtema.
 */
export function filterPostsBySubtopic(posts: BlogPost[], subtopicId: string): BlogPost[] {
  if (subtopicId === ALL_SUBTOPICS_ID) return posts;
  return posts.filter((post) => post.subtopicId === subtopicId);
}

/**
 * Resuelve a qué subtema se asigna un post nuevo según el chip seleccionado.
 *
 * - Si el chip es un subtema real, ese es el destino.
 * - Si es "Todos" (o un id que ya no existe), el destino es el subtema por
 *   defecto (`isDefault`), cayendo al primero si no hubiera ninguno marcado.
 */
export function resolveComposerSubtopic(
  selectedSubtopicId: string,
  subtopics: BlogSubtopic[],
): string {
  if (
    selectedSubtopicId !== ALL_SUBTOPICS_ID &&
    subtopics.some((s) => s.id === selectedSubtopicId)
  ) {
    return selectedSubtopicId;
  }
  return subtopics.find((s) => s.isDefault)?.id ?? subtopics[0]?.id ?? '';
}
