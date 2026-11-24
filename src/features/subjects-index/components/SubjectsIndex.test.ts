// @vitest-environment node
// Los componentes .astro se renderizan a string con el Container API (ver
// Footer.test.ts para el porqué del entorno node).
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import type { IndexUniversity } from '@/features/subjects-index/types/subjectsIndex';
import SubjectsIndex from './SubjectsIndex.astro';

const universities: IndexUniversity[] = [
  {
    name: 'UNICEN',
    faculties: [
      {
        name: 'Facultad de Ciencias Exactas',
        careers: [
          {
            careerId: 'c-sis',
            name: 'Ingeniería de Sistemas',
            years: [
              {
                year: 1,
                subjects: [
                  {
                    id: 's1',
                    title: 'Análisis Matemático I',
                    quadmester: 1,
                    resourceCounts: { resumen: 4, parcial: 2, final: 1 },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

async function render(props: { universities: IndexUniversity[] }) {
  const container = await AstroContainer.create();
  return container.renderToString(SubjectsIndex, { props });
}

describe('SubjectsIndex.astro', () => {
  it('muestra la jerarquía universidad, facultad, carrera y año', async () => {
    const html = await render({ universities });

    expect(html).toContain('UNICEN');
    expect(html).toContain('Facultad de Ciencias Exactas');
    expect(html).toContain('Ingeniería de Sistemas');
    expect(html).toContain('1.º año');
  });

  it('enlaza cada materia con un link plano y absoluto a sus resúmenes', async () => {
    const html = await render({ universities });

    expect(html).toMatch(/<a[^>]*href="\/s1\/resumenes"[^>]*>[\s\S]*Análisis Matemático I/);
  });

  it('muestra los contadores de recursos de la materia', async () => {
    const html = await render({ universities });

    expect(html).toContain('4 resúmenes');
    expect(html).toContain('2 parciales');
    expect(html).toContain('1 final');
  });

  it('avisa cuando no hay materias para mostrar', async () => {
    const html = await render({ universities: [] });

    expect(html).toContain('Todavía no hay materias cargadas.');
  });
});
