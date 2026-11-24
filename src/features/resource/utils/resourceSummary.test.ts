import { describe, expect, it } from 'vitest';
import type { Subject, SubjectCareer } from '@/features/home/types/subjects';
import type { ResourceFetch } from '@/features/resource/types/resource';
import {
  buildResourcesDescription,
  buildResourcesSummary,
  formatCareers,
  formatCursada,
  formatExamYearRange,
  formatResourceCount,
  getExamYearRange,
} from './resourceSummary';

const career = (overrides: Partial<SubjectCareer> = {}): SubjectCareer => ({
  careerId: 'c1',
  planId: 'p1',
  year: 2,
  quadmester: 1,
  careerName: 'Ingeniería en Sistemas',
  facultyName: 'Facultad de Ingeniería',
  universityName: 'Universidad Nacional del Centro',
  ...overrides,
});

const subject = (overrides: Partial<Subject> = {}): Subject => ({
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

describe('formatCareers', () => {
  it('devuelve null sin carreras', () => {
    expect(formatCareers([])).toBeNull();
  });

  it('incluye carrera, facultad y universidad', () => {
    expect(formatCareers([career()])).toBe(
      'Ingeniería en Sistemas (Facultad de Ingeniería, Universidad Nacional del Centro)',
    );
  });

  it('une varias carreras con coma e "y" y elimina duplicados', () => {
    const result = formatCareers([
      career(),
      career({ planId: 'p2' }),
      career({ careerId: 'c2', careerName: 'Licenciatura en Sistemas' }),
      career({ careerId: 'c3', careerName: 'Profesorado en Matemática' }),
    ]);

    expect(result).toBe(
      'Ingeniería en Sistemas (Facultad de Ingeniería, Universidad Nacional del Centro), ' +
        'Licenciatura en Sistemas (Facultad de Ingeniería, Universidad Nacional del Centro) y ' +
        'Profesorado en Matemática (Facultad de Ingeniería, Universidad Nacional del Centro)',
    );
  });

  it('omite facultad o universidad vacías', () => {
    expect(formatCareers([career({ facultyName: '', universityName: 'UNICEN' })])).toBe(
      'Ingeniería en Sistemas (UNICEN)',
    );
    expect(formatCareers([career({ facultyName: '', universityName: '' })])).toBe(
      'Ingeniería en Sistemas',
    );
  });
});

describe('formatCursada', () => {
  it('describe año y cuatrimestre', () => {
    expect(formatCursada(3, 2)).toBe('3.º año, 2.º cuatrimestre');
  });

  it('omite el cuatrimestre si no es 1 ni 2', () => {
    expect(formatCursada(1, 0)).toBe('1.º año');
  });

  it('devuelve null si el año no es válido', () => {
    expect(formatCursada(0, 1)).toBeNull();
    expect(formatCursada(Number.NaN, 1)).toBeNull();
  });
});

describe('formatResourceCount', () => {
  it('usa singular y plural según la cantidad', () => {
    expect(formatResourceCount(1, 'Resumenes')).toBe('1 resumen');
    expect(formatResourceCount(3, 'Resumenes')).toBe('3 resúmenes');
    expect(formatResourceCount(1, 'Parciales')).toBe('1 parcial');
    expect(formatResourceCount(0, 'Finales')).toBe('0 finales');
  });
});

describe('getExamYearRange', () => {
  it('devuelve null sin recursos', () => {
    expect(getExamYearRange([])).toBeNull();
  });

  it('devuelve null si ningún recurso tiene año de examen', () => {
    expect(getExamYearRange([resource({ examYear: null })])).toBeNull();
  });

  it('ignora los años nulos y toma el mínimo y el máximo', () => {
    const range = getExamYearRange([
      resource({ examYear: 2021 }),
      resource({ examYear: null }),
      resource({ examYear: 2018 }),
      resource({ examYear: 2024 }),
    ]);

    expect(range).toEqual({ from: 2018, to: 2024 });
  });
});

describe('formatExamYearRange', () => {
  it('muestra un rango entre dos años distintos', () => {
    expect(formatExamYearRange({ from: 2018, to: 2024 })).toBe('de 2018 a 2024');
  });

  it('muestra un único año si coinciden', () => {
    expect(formatExamYearRange({ from: 2024, to: 2024 })).toBe('de 2024');
  });
});

describe('buildResourcesSummary', () => {
  it('arma los párrafos con carreras, cursada, cantidad y años del tipo actual', () => {
    const lines = buildResourcesSummary({
      subject: subject(),
      type: 'Parciales',
      resources: [resource({ examYear: 2019 }), resource({ examYear: 2024 })],
    });

    expect(lines).toEqual([
      'Álgebra se cursa en Ingeniería en Sistemas (Facultad de Ingeniería, Universidad Nacional del Centro).',
      'Corresponde al 2.º año, 1.º cuatrimestre del plan de estudios.',
      'Hay 2 parciales publicados, de 2019 a 2024.',
    ]);
  });

  it('omite lo que no se conoce: sin carreras, sin año válido y sin años de examen', () => {
    const lines = buildResourcesSummary({
      subject: subject({ careers: [], year: 0 }),
      type: 'Resumenes',
      resources: [resource({ type: 'resumen', examYear: null })],
    });

    expect(lines).toEqual(['Hay 1 resumen publicado.']);
  });

  it('avisa cuando todavía no hay recursos del tipo actual', () => {
    const lines = buildResourcesSummary({
      subject: subject({ careers: [] }),
      type: 'Finales',
      resources: [],
    });

    expect(lines).toEqual([
      'Corresponde al 2.º año, 1.º cuatrimestre del plan de estudios.',
      'Todavía no hay finales publicados.',
    ]);
  });

  it('no inventa la cantidad si no se pudo obtener', () => {
    const lines = buildResourcesSummary({
      subject: subject({ careers: [], year: 0 }),
      type: 'Finales',
      resources: null,
    });

    expect(lines).toEqual([]);
  });
});

describe('buildResourcesDescription', () => {
  it('incluye tipo, materia, carrera, universidad, cantidad y años', () => {
    const description = buildResourcesDescription({
      subject: subject(),
      type: 'Parciales',
      resources: [resource({ examYear: 2019 }), resource({ examYear: 2024 })],
    });

    expect(description).toBe(
      'Parciales de Álgebra (Ingeniería en Sistemas, Universidad Nacional del Centro): ' +
        '2 parciales de 2019 a 2024, compartidos por estudiantes.',
    );
  });

  it('funciona sin carreras ni años de examen', () => {
    const description = buildResourcesDescription({
      subject: subject({ careers: [] }),
      type: 'Resumenes',
      resources: [resource({ type: 'resumen', examYear: null })],
    });

    expect(description).toBe('Resúmenes de Álgebra: 1 resumen, compartido por estudiantes.');
  });

  it('con cero recursos no muestra la cantidad', () => {
    const description = buildResourcesDescription({
      subject: subject(),
      type: 'Finales',
      resources: [],
    });

    expect(description).toBe(
      'Finales de Álgebra (Ingeniería en Sistemas, Universidad Nacional del Centro), ' +
        'compartidos por estudiantes.',
    );
  });

  it('sin recursos conocidos usa la misma forma que con cero', () => {
    const description = buildResourcesDescription({
      subject: subject({ careers: [] }),
      type: 'Finales',
      resources: null,
    });

    expect(description).toBe('Finales de Álgebra, compartidos por estudiantes.');
  });
});
