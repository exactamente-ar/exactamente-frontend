import type { BlogComment, BlogPost, BlogSubtopic } from '../types/blog';

const DELETED_BODY = '[Eliminado]';

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

/**
 * Los tres comparadores replican el orden que devuelve el backend para el feed
 * (`desc netScore`, `desc createdAt`, `desc id` en posts; sin id en comentarios).
 * Con esto, insertar localmente produce el mismo orden que un refetch.
 */
function comparePosts(a: BlogPost, b: BlogPost): number {
  return (
    b.netScore - a.netScore || b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)
  );
}

function compareComments(a: BlogComment, b: BlogComment): number {
  return b.netScore - a.netScore || b.createdAt.localeCompare(a.createdAt);
}

/** Inserta un post nuevo manteniendo el orden del feed. No duplica ids. */
export function insertPost(posts: BlogPost[], post: BlogPost): BlogPost[] {
  if (posts.some((p) => p.id === post.id)) return posts;
  return [...posts, post].sort(comparePosts);
}

/** Inserta un comentario nuevo manteniendo el orden de sus hermanos. No duplica ids. */
export function insertComment(comments: BlogComment[], comment: BlogComment): BlogComment[] {
  if (comments.some((c) => c.id === comment.id)) return comments;
  return [...comments, comment].sort(compareComments);
}

function collectDescendants(comments: BlogComment[], parentId: string): BlogComment[] {
  return comments
    .filter((c) => c.parentId === parentId)
    .flatMap((c) => [c, ...collectDescendants(comments, c.id)]);
}

/**
 * Replica localmente la política de borrado del backend para posts:
 * hard delete (quita el post) si no quedan comentarios activos, soft delete
 * (marca `deleted`, cuerpo `[Eliminado]`) si sí quedan.
 */
export function removePost(posts: BlogPost[], postId: string): BlogPost[] {
  const post = posts.find((p) => p.id === postId);
  if (!post) return posts;
  const allCommentsDeleted = post.comments.every((c) => c.status === 'deleted');
  if (allCommentsDeleted) {
    return posts.filter((p) => p.id !== postId);
  }
  return posts.map((p) =>
    p.id === postId ? { ...p, status: 'deleted', body: DELETED_BODY, author: null, images: [] } : p,
  );
}

/**
 * Replica localmente la política de borrado del backend para comentarios:
 * hard delete del subárbol si todas las respuestas ya están eliminadas, soft
 * delete del comentario raíz si queda alguna activa.
 */
export function removeComment(comments: BlogComment[], commentId: string): BlogComment[] {
  const comment = comments.find((c) => c.id === commentId);
  if (!comment) return comments;
  const descendants = collectDescendants(comments, commentId);
  const allDescendantsDeleted = descendants.every((c) => c.status === 'deleted');
  if (allDescendantsDeleted) {
    const ids = new Set([commentId, ...descendants.map((c) => c.id)]);
    return comments.filter((c) => !ids.has(c.id));
  }
  return comments.map((c) =>
    c.id === commentId
      ? { ...c, status: 'deleted', body: DELETED_BODY, author: null, images: [] }
      : c,
  );
}
