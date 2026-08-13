import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCE_TYPE_MAP, mapBlog, mapResource, mapSubject } from './api';

// Mínimo viable de un BackendSubject; cada test pisa solo lo que le importa.
function backendSubject(overrides: Record<string, unknown> = {}) {
  return {
    id: 's1',
    facultyId: 'f1',
    title: 'Análisis Matemático I',
    shortName: 'AM1',
    slug: 'analisis-matematico-1',
    description: 'Límites y derivadas',
    urlMoodle: 'https://moodle.test/am1',
    urlPrograma: 'https://uni.test/am1.pdf',
    year: 1,
    quadmester: 1,
    careers: [],
    prerequisites: ['Ingreso'],
    correlatives: ['AM2'],
    resourceCounts: { resumen: 3, parcial: 2, final: 1 },
    ...overrides,
  };
}

function backendResource(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    subjectId: 's1',
    title: 'Parcial 2024',
    type: 'parcial' as const,
    subtype: 'recuperatorio' as const,
    examYear: 2024,
    examMonth: 6,
    topic: 3,
    status: 'published' as const,
    downloadCount: 0,
    publishedAt: '2024-06-01',
    createdAt: '2024-06-01',
    fileUrl: 'https://files.test/r1.pdf',
    ...overrides,
  };
}

describe('RESOURCE_TYPE_MAP', () => {
  it('traduce los nombres visibles a los tipos del backend', () => {
    expect(RESOURCE_TYPE_MAP).toEqual({
      Resumenes: 'resumen',
      Parciales: 'parcial',
      Finales: 'final',
    });
  });
});

describe('mapSubject', () => {
  it('arma la url anteponiendo una barra al slug', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mapSubject(backendSubject() as any).url).toBe('/analisis-matematico-1');
  });

  it('renombra prerequisites a required', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mapSubject(backendSubject() as any).required).toEqual(['Ingreso']);
  });

  it('cae en contadores en cero cuando el backend no manda resourceCounts', () => {
    const sinCounts = backendSubject({ resourceCounts: undefined });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mapSubject(sinCounts as any).resourceCounts).toEqual({
      resumen: 0,
      parcial: 0,
      final: 0,
    });
  });
});

describe('mapResource', () => {
  it('conserva los campos que vienen completos', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mapResource(backendResource() as any)).toEqual({
      id: 'r1',
      title: 'Parcial 2024',
      fileUrl: 'https://files.test/r1.pdf',
      type: 'parcial',
      subtype: 'recuperatorio',
      examYear: 2024,
      examMonth: 6,
      topic: 3,
    });
  });

  it('normaliza los opcionales ausentes a null en vez de undefined', () => {
    const parcial = backendResource({
      subtype: undefined,
      examYear: undefined,
      examMonth: undefined,
      topic: undefined,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = mapResource(parcial as any);
    expect(mapped.subtype).toBeNull();
    expect(mapped.examYear).toBeNull();
    expect(mapped.examMonth).toBeNull();
    expect(mapped.topic).toBeNull();
  });
});

function backendBlog(overrides: Record<string, unknown> = {}) {
  return {
    subjectId: 's1',
    subtopics: [{ id: 'st1', name: 'General', slug: 'general', isDefault: true }],
    posts: [
      {
        id: 'p1',
        subtopicId: 'st1',
        body: '¿Alguien tiene el parcial 2024?',
        authority: 'anonymous',
        status: 'published',
        netScore: 0,
        createdAt: '2026-08-12T10:00:00.000Z',
        author: null,
        images: [],
        comments: [],
      },
    ],
    ...overrides,
  };
}

describe('mapBlog', () => {
  it('conserva la estructura del blog sin transformar los campos', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mapBlog(backendBlog() as any)).toEqual(backendBlog());
  });
});

// withCache guarda estado a nivel de módulo, así que cada test parte de un
// import fresco en vez de compartir el Map entre casos.
describe('withCache', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function loadWithCache() {
    const mod = await import('./api');
    return mod.withCache;
  }

  it('deduplica llamadas concurrentes a la misma key', async () => {
    const withCache = await loadWithCache();
    const fetcher = vi.fn().mockResolvedValue({ data: ['ok'], error: null });

    const [a, b] = await Promise.all([withCache('k', fetcher), withCache('k', fetcher)]);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('reusa el resultado cacheado dentro del TTL', async () => {
    const withCache = await loadWithCache();
    const fetcher = vi.fn().mockResolvedValue({ data: ['ok'], error: null });

    await withCache('k', fetcher);
    vi.advanceTimersByTime(59_000);
    await withCache('k', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('vuelve a pedir cuando venció el TTL de 60s', async () => {
    const withCache = await loadWithCache();
    const fetcher = vi.fn().mockResolvedValue({ data: ['ok'], error: null });

    await withCache('k', fetcher);
    vi.advanceTimersByTime(61_000);
    await withCache('k', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('no cachea respuestas con error', async () => {
    const withCache = await loadWithCache();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ data: [], error: 'boom' })
      .mockResolvedValueOnce({ data: ['ok'], error: null });

    const primera = await withCache('k', fetcher);
    const segunda = await withCache('k', fetcher);

    expect(primera.error).toBe('boom');
    expect(segunda.error).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
