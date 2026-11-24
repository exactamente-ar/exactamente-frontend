import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAllSubjects = vi.fn();
vi.mock('@/shared/services/api', () => ({ getAllSubjects }));

const { subjectsSitemapResponse } = await import('./subjectsSitemapResponse');

const SITE = 'https://www.exactamente.com.ar';

describe('subjectsSitemapResponse', () => {
  beforeEach(() => {
    getAllSubjects.mockReset();
  });

  it('devuelve el sitemap como XML cacheable en el CDN', async () => {
    getAllSubjects.mockResolvedValue({ data: [{ id: 's1' }], error: null });

    const response = await subjectsSitemapResponse(SITE);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
    expect(body).toContain(`<loc>${SITE}/materias</loc>`);
    expect(body).toContain(`<loc>${SITE}/s1/finales</loc>`);
  });

  it('responde 503 sin cachear si la API falla, en vez de un sitemap vacío', async () => {
    getAllSubjects.mockResolvedValue({ data: [], error: 'Request failed with status 500' });

    const response = await subjectsSitemapResponse(SITE);

    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Retry-After')).toBe('300');
    expect(await response.text()).not.toContain('<urlset');
  });
});
