import { describe, expect, it } from 'vitest';
import { ALL_SUBTOPICS_ID, filterPostsBySubtopic, resolveComposerSubtopic } from './feed';
import type { BlogPost, BlogSubtopic } from '../types/blog';

const subtopics: BlogSubtopic[] = [
  { id: 'sub-general', name: 'Subtema general', slug: 'general', isDefault: true },
  { id: 'sub-parciales', name: 'Parciales y finales', slug: 'parciales', isDefault: false },
];

function post(id: string, subtopicId: string): BlogPost {
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
  };
}

describe('filterPostsBySubtopic', () => {
  const posts = [post('a', 'sub-general'), post('b', 'sub-parciales'), post('c', 'sub-general')];

  it('devuelve todos los posts con el chip "Todos"', () => {
    expect(filterPostsBySubtopic(posts, ALL_SUBTOPICS_ID)).toHaveLength(3);
  });

  it('filtra solo los posts del subtema seleccionado', () => {
    const result = filterPostsBySubtopic(posts, 'sub-parciales');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('devuelve un array vacío si ningún post coincide', () => {
    expect(filterPostsBySubtopic(posts, 'sub-inexistente')).toEqual([]);
  });
});

describe('resolveComposerSubtopic', () => {
  it('mantiene el subtema seleccionado cuando es real', () => {
    expect(resolveComposerSubtopic('sub-parciales', subtopics)).toBe('sub-parciales');
  });

  it('cae al subtema por defecto con el chip "Todos"', () => {
    expect(resolveComposerSubtopic(ALL_SUBTOPICS_ID, subtopics)).toBe('sub-general');
  });

  it('cae al subtema por defecto si el id ya no existe', () => {
    expect(resolveComposerSubtopic('sub-borrado', subtopics)).toBe('sub-general');
  });

  it('cae al primer subtema si ninguno está marcado como default', () => {
    const sinDefault = subtopics.map((s) => ({ ...s, isDefault: false }));
    expect(resolveComposerSubtopic(ALL_SUBTOPICS_ID, sinDefault)).toBe('sub-general');
  });

  it('devuelve string vacío si no hay subtemas', () => {
    expect(resolveComposerSubtopic(ALL_SUBTOPICS_ID, [])).toBe('');
  });
});
