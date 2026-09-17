import { describe, expect, it } from 'vitest';
import {
  filterPostsBySubtopic,
  insertComment,
  insertPost,
  removeComment,
  removePost,
  resolveActiveSubtopic,
} from './feed';
import type { BlogComment, BlogPost, BlogSubtopic } from '../types/blog';

const subtopics: BlogSubtopic[] = [
  { id: 'sub-general', name: 'General', slug: 'general', isDefault: true },
  { id: 'sub-parciales', name: 'Parciales y finales', slug: 'parciales', isDefault: false },
];

function post(id: string, subtopicId: string, overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id,
    subtopicId,
    body: `body ${id}`,
    authority: 'visible',
    status: 'published',
    netScore: 0,
    createdAt: '2026-01-01T00:00:00Z',
    author: null,
    images: [],
    comments: [],
    mine: false,
    myVote: 0,
    ...overrides,
  };
}

function comment(
  id: string,
  postId: string,
  parentId: string | null = null,
  overrides: Partial<BlogComment> = {},
): BlogComment {
  return {
    id,
    postId,
    parentId,
    body: `body ${id}`,
    authority: 'visible',
    status: 'published',
    netScore: 0,
    depth: 1,
    createdAt: '2026-01-01T00:00:00Z',
    author: null,
    images: [],
    mine: false,
    myVote: 0,
    ...overrides,
  };
}

describe('filterPostsBySubtopic', () => {
  const posts = [post('a', 'sub-general'), post('b', 'sub-parciales'), post('c', 'sub-general')];

  it('filtra solo los posts del subtema seleccionado', () => {
    const result = filterPostsBySubtopic(posts, 'sub-parciales');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('devuelve un array vacío si ningún post coincide', () => {
    expect(filterPostsBySubtopic(posts, 'sub-inexistente')).toEqual([]);
  });
});

describe('resolveActiveSubtopic', () => {
  it('mantiene el subtema seleccionado cuando es real', () => {
    expect(resolveActiveSubtopic('sub-parciales', subtopics)).toBe('sub-parciales');
  });

  it('selecciona el subtema por defecto al entrar', () => {
    expect(resolveActiveSubtopic('', subtopics)).toBe('sub-general');
  });

  it('cae al subtema por defecto si el id ya no existe', () => {
    expect(resolveActiveSubtopic('sub-borrado', subtopics)).toBe('sub-general');
  });

  it('cae al primer subtema si ninguno está marcado como default', () => {
    const sinDefault = subtopics.map((s) => ({ ...s, isDefault: false }));
    expect(resolveActiveSubtopic('', sinDefault)).toBe('sub-general');
  });

  it('devuelve string vacío si no hay subtemas', () => {
    expect(resolveActiveSubtopic('', [])).toBe('');
  });
});

describe('insertPost', () => {
  it('agrega el post y ordena por netScore descendente', () => {
    const posts = [
      post('a', 'sub-general', { netScore: 10 }),
      post('b', 'sub-general', { netScore: 5 }),
    ];
    const nuevo = post('c', 'sub-general', { netScore: 0, createdAt: '2026-02-01T00:00:00Z' });

    const result = insertPost(posts, nuevo);

    expect(result.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('no duplica un post ya presente', () => {
    const posts = [post('a', 'sub-general')];
    const result = insertPost(posts, post('a', 'sub-general'));
    expect(result).toHaveLength(1);
  });
});

describe('insertComment', () => {
  it('agrega el comentario y ordena por netScore descendente', () => {
    const comments = [comment('c1', 'p1', null, { netScore: 8 })];
    const nuevo = comment('c2', 'p1', null, { netScore: 0, createdAt: '2026-02-01T00:00:00Z' });

    const result = insertComment(comments, nuevo);

    expect(result.map((c) => c.id)).toEqual(['c1', 'c2']);
  });

  it('no duplica un comentario ya presente', () => {
    const comments = [comment('c1', 'p1')];
    const result = insertComment(comments, comment('c1', 'p1'));
    expect(result).toHaveLength(1);
  });
});

describe('removePost', () => {
  it('hace hard delete si no tiene comentarios', () => {
    const posts = [post('a', 'sub-general')];
    expect(removePost(posts, 'a')).toEqual([]);
  });

  it('hace soft delete si quedan comentarios activos', () => {
    const posts = [
      post('a', 'sub-general', {
        comments: [comment('c1', 'a', null, { status: 'published' })],
      }),
    ];

    const result = removePost(posts, 'a');

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('deleted');
    expect(result[0].body).toBe('[Eliminado]');
    expect(result[0].comments).toHaveLength(1);
  });

  it('hace hard delete si todos los comentarios ya están eliminados', () => {
    const posts = [
      post('a', 'sub-general', {
        comments: [comment('c1', 'a', null, { status: 'deleted' })],
      }),
    ];

    expect(removePost(posts, 'a')).toEqual([]);
  });

  it('no hace nada si el post no existe', () => {
    const posts = [post('a', 'sub-general')];
    expect(removePost(posts, 'inexistente')).toEqual(posts);
  });
});

describe('removeComment', () => {
  it('hace hard delete si no tiene respuestas', () => {
    const comments = [comment('c1', 'p1')];
    expect(removeComment(comments, 'c1')).toEqual([]);
  });

  it('hace soft delete si quedan respuestas activas', () => {
    const comments = [
      comment('c1', 'p1', null, { status: 'published' }),
      comment('c2', 'p1', 'c1', { status: 'published', depth: 2 }),
    ];

    const result = removeComment(comments, 'c1');

    expect(result.map((c) => c.id)).toEqual(['c1', 'c2']);
    expect(result.find((c) => c.id === 'c1')?.status).toBe('deleted');
    expect(result.find((c) => c.id === 'c1')?.body).toBe('[Eliminado]');
  });

  it('hace hard delete del subárbol completo si todas las respuestas están eliminadas', () => {
    const comments = [
      comment('c1', 'p1', null, { status: 'published' }),
      comment('c2', 'p1', 'c1', { status: 'deleted', depth: 2 }),
      comment('c3', 'p1', 'c2', { status: 'deleted', depth: 3 }),
    ];

    expect(removeComment(comments, 'c1')).toEqual([]);
  });

  it('no hace nada si el comentario no existe', () => {
    const comments = [comment('c1', 'p1')];
    expect(removeComment(comments, 'inexistente')).toEqual(comments);
  });
});
