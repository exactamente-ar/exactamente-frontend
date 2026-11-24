import { describe, expect, it } from 'vitest';
import type { Subject, SubjectCareer } from '@/features/home/types/subjects';
import type { ResourceFetch } from '@/features/resource/types/resource';
import { buildResourcesJsonLd, serializeJsonLd } from './resourceJsonLd';

const career = (overrides: Partial<SubjectCareer> = {}): SubjectCareer => ({
  careerId: 'c1',
  planId: 'p1',
  year: 2,
  quadmester: 1,
  careerName: 'Ingeniería en Sistemas',
  facultyName: 'Facultad de Ingeniería',
  universityName: 'UNICEN',
  ...overrides,
});

const subject = (overrides: Partial<Subject> = {}): Subject => ({
  id: 's1',
  title: 'Álgebra',
  shortName: 'ALG',
  description: 'Matrices y espacios vectoriales.',
  url: '/algebra',
  urlMoodle: '',
  urlPrograma: '',
  correlatives: [],
  required: [],
  quadmester: 1,
  year: 2,
  careers: [career()],
  resourceCounts: { resumen: 0, parcial: 0, final: 0 },
  ...overrides,
});

const resource = (overrides: Partial<ResourceFetch> = {}): ResourceFetch => ({
  id: 'r1',
  title: 'Parcial 1',
  type: 'parcial',
  subtype: null,
  examYear: 2024,
  examMonth: 6,
  topic: null,
  fileUrl: 'https://files.example.com/r1.pdf',
  ...overrides,
});

const PAGE_URL = 'https://www.exactamente.com.ar/s1/parciales';

type Node = Record<string, unknown> & { '@type': string };

function build(overrides: Partial<Parameters<typeof buildResourcesJsonLd>[0]> = {}) {
  const data = buildResourcesJsonLd({
    subject: subject(),
    type: 'Parciales',
    resources: [resource()],
    pageUrl: PAGE_URL,
    description: 'Descripción generada.',
    ...overrides,
  });
  const graph = data['@graph'] as Node[];
  const find = (type: string) => graph.find((node) => node['@type'] === type);
  return { data, find };
}

describe('buildResourcesJsonLd', () => {
  it('declara el contexto de schema.org', () => {
    expect(build().data['@context']).toBe('https://schema.org');
  });

  it('describe la materia como Course con la universidad y la facultad como proveedor', () => {
    const course = build().find('Course');

    expect(course).toMatchObject({
      '@id': `${PAGE_URL}#course`,
      name: 'Álgebra',
      description: 'Matrices y espacios vectoriales.',
      url: PAGE_URL,
      inLanguage: 'es',
      provider: {
        '@type': 'CollegeOrUniversity',
        name: 'UNICEN',
        department: { '@type': 'CollegeOrUniversity', name: 'Facultad de Ingeniería' },
      },
    });
  });

  it('usa la descripción generada si la materia no tiene una propia', () => {
    const course = build({ subject: subject({ description: '  ' }) }).find('Course');

    expect(course?.description).toBe('Descripción generada.');
  });

  it('omite el proveedor si la materia no tiene carreras', () => {
    const course = build({ subject: subject({ careers: [] }) }).find('Course');

    expect(course).not.toHaveProperty('provider');
  });

  it('lista un proveedor por universidad distinta', () => {
    const course = build({
      subject: subject({
        careers: [
          career(),
          career({ careerId: 'c2', facultyName: 'Facultad de Ciencias Exactas' }),
          career({ careerId: 'c3', universityName: 'UNLP', facultyName: '' }),
        ],
      }),
    }).find('Course');

    expect(course?.provider).toEqual([
      {
        '@type': 'CollegeOrUniversity',
        name: 'UNICEN',
        department: { '@type': 'CollegeOrUniversity', name: 'Facultad de Ingeniería' },
      },
      { '@type': 'CollegeOrUniversity', name: 'UNLP' },
    ]);
  });

  it('lista los recursos como LearningResource con su tipo y el año del examen', () => {
    const list = build({
      resources: [resource({ id: 'r1', title: 'Parcial 1', examYear: 2023 })],
    }).find('ItemList');

    expect(list).toMatchObject({
      name: 'Parciales de Álgebra',
      numberOfItems: 1,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'LearningResource',
            name: 'Parcial 1',
            learningResourceType: 'Parcial',
            temporalCoverage: '2023',
            inLanguage: 'es',
            url: `${PAGE_URL}#r1`,
            isPartOf: { '@id': `${PAGE_URL}#course` },
          },
        },
      ],
    });
  });

  it('no inventa el año si el recurso no lo tiene', () => {
    const list = build({
      type: 'Resumenes',
      resources: [resource({ type: 'resumen', examYear: null })],
    }).find('ItemList');
    const items = list?.itemListElement as Array<{ item: Record<string, unknown> }>;

    expect(items[0].item.learningResourceType).toBe('Resumen');
    expect(items[0].item).not.toHaveProperty('temporalCoverage');
  });

  it('omite el ItemList sin recursos', () => {
    expect(build({ resources: [] }).find('ItemList')).toBeUndefined();
    expect(build({ resources: null }).find('ItemList')).toBeUndefined();
  });

  it('arma el BreadcrumbList Inicio → materia → tipo', () => {
    const breadcrumb = build({
      type: 'Finales',
      pageUrl: 'https://www.exactamente.com.ar/s1/finales',
    }).find('BreadcrumbList');

    expect(breadcrumb?.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://www.exactamente.com.ar/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Álgebra',
        item: 'https://www.exactamente.com.ar/s1/resumenes',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Finales',
        item: 'https://www.exactamente.com.ar/s1/finales',
      },
    ]);
  });
});

describe('serializeJsonLd', () => {
  it('escapa "<" para que nadie pueda cerrar el script desde un dato', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' });

    expect(json).not.toContain('<');
    expect(json).toContain('\\u003c/script>');
  });

  it('sigue siendo JSON válido y conserva el valor original', () => {
    const value = { name: 'a < b </script>' };

    expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
  });
});
