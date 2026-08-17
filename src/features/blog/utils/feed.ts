import type { BlogPost, BlogSubtopic } from '../types/blog';

/** Devuelve solo los posts del subtema seleccionado. */
export function filterPostsBySubtopic(posts: BlogPost[], subtopicId: string): BlogPost[] {
  return posts.filter((post) => post.subtopicId === subtopicId);
}

/**
 * Mantiene el subtema seleccionado si todavía existe. Al entrar o si fue
 * eliminado, selecciona el subtema por defecto y cae al primero como respaldo.
 */
export function resolveActiveSubtopic(
  selectedSubtopicId: string,
  subtopics: BlogSubtopic[],
): string {
  if (subtopics.some((s) => s.id === selectedSubtopicId)) {
    return selectedSubtopicId;
  }
  return subtopics.find((s) => s.isDefault)?.id ?? subtopics[0]?.id ?? '';
}
