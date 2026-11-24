import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Subject } from '@/features/home/types/subjects';
import type { ResourceFetch } from '@/features/resource/types/resource';
import { CACHE_CONTROL, loadResourcesPage } from './resourcesPage';

const getResources = vi.hoisted(() => vi.fn());

vi.mock('@/shared/services/api', () => ({ getResources }));

const subject: Subject = {
  id: 's1',
  title: 'Álgebra',
  shortName: 'ALG',
  description: '',
  url: '/algebra',
  urlMoodle: '',
  urlPrograma: '',
  correlatives: [],
  required: [],
  quadmester: 1,
  year: 2,
  careers: [],
  resourceCounts: { resumen: 0, parcial: 0, final: 0 },
};

const resource = (id: string, examYear: number | null = 2024): ResourceFetch => ({
  id,
  title: `Recurso ${id}`,
  type: 'parcial',
  subtype: null,
  examYear,
  examMonth: null,
  topic: null,
  fileUrl: `https://files.example.com/${id}.pdf`,
});

const ok = (data: ResourceFetch[]) => ({ data, error: null });
const fail = (error: string) => ({ data: [], error });

function mockByType(byType: Record<string, ReturnType<typeof ok> | ReturnType<typeof fail>>) {
  getResources.mockImplementation((_id: string, type: string) => Promise.resolve(byType[type]));
}

beforeEach(() => {
  getResources.mockReset();
});

describe('loadResourcesPage', () => {
  // El backend limita las lecturas públicas por IP y todo el SSR sale por las
  // IPs compartidas de Vercel: cada pedido extra por vista acerca el 429.
  it('pide solo el tipo actual: un único pedido por vista', async () => {
    mockByType({ Resumenes: ok([]), Parciales: ok([]), Finales: ok([]) });

    await loadResourcesPage(subject, 'Parciales', '/s1/parciales');

    expect(getResources).toHaveBeenCalledTimes(1);
    expect(getResources).toHaveBeenCalledWith('s1', 'Parciales');
  });

  it('entrega los recursos del tipo actual como datos iniciales', async () => {
    const parciales = [resource('p1', 2019), resource('p2', 2023)];
    mockByType({
      Resumenes: ok([resource('r1', null)]),
      Parciales: ok(parciales),
      Finales: ok([]),
    });

    const page = await loadResourcesPage(subject, 'Parciales', '/s1/parciales');

    expect(page.initialData).toEqual(parciales);
    expect(page.initialError).toBeNull();
    expect(page.summary).toEqual([
      'Corresponde al 2.º año, 1.º cuatrimestre del plan de estudios.',
      'Hay 2 parciales publicados, de 2019 a 2023.',
    ]);
    expect(page.description).toBe(
      'Parciales de Álgebra: 2 parciales de 2019 a 2023, compartidos por estudiantes.',
    );
  });

  it('si falla el tipo actual pasa el error y no inventa la cantidad', async () => {
    mockByType({
      Resumenes: ok([resource('r1', null)]),
      Parciales: fail('timeout'),
      Finales: ok([]),
    });

    const page = await loadResourcesPage(subject, 'Parciales', '/s1/parciales');

    expect(page.initialData).toBeNull();
    expect(page.initialError).toBe('timeout');
    expect(page.summary).toEqual([
      'Corresponde al 2.º año, 1.º cuatrimestre del plan de estudios.',
    ]);
  });

  it('con datos permite cachear en la CDN', async () => {
    mockByType({ Resumenes: ok([]), Parciales: ok([resource('p1')]), Finales: ok([]) });

    const page = await loadResourcesPage(subject, 'Parciales', '/s1/parciales');

    expect(page.cacheControl).toBe(CACHE_CONTROL.success);
    expect(CACHE_CONTROL.success).toBe('public, s-maxage=600, stale-while-revalidate=86400');
  });

  it('una lista vacía también se cachea: es una respuesta válida', async () => {
    mockByType({ Resumenes: ok([]), Parciales: ok([]), Finales: ok([]) });

    const page = await loadResourcesPage(subject, 'Parciales', '/s1/parciales');

    expect(page.cacheControl).toBe(CACHE_CONTROL.success);
  });

  it('si falló el pedido no se cachea, para no servir el error a todos', async () => {
    mockByType({ Resumenes: ok([]), Parciales: fail('timeout'), Finales: ok([]) });

    const page = await loadResourcesPage(subject, 'Parciales', '/s1/parciales');

    expect(page.cacheControl).toBe(CACHE_CONTROL.error);
    expect(CACHE_CONTROL.error).toBe('no-store');
  });

  it('arma la URL canónica sin query string sobre el origen de producción', async () => {
    mockByType({ Resumenes: ok([]), Parciales: ok([]), Finales: ok([]) });

    const page = await loadResourcesPage(subject, 'Finales', '/s1/finales');

    expect(page.canonicalUrl).toBe('https://www.exactamente.com.ar/s1/finales');
  });

  it('serializa el JSON-LD de forma segura para incrustarlo', async () => {
    mockByType({
      Resumenes: ok([]),
      Parciales: ok([{ ...resource('p1'), title: '</script>' }]),
      Finales: ok([]),
    });

    const page = await loadResourcesPage(subject, 'Parciales', '/s1/parciales');
    const data = JSON.parse(page.jsonLd);

    expect(page.jsonLd).not.toContain('<');
    expect(data['@graph'].map((node: { '@type': string }) => node['@type'])).toEqual([
      'Course',
      'ItemList',
      'BreadcrumbList',
    ]);
  });
});
