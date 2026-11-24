import { describe, expect, it } from 'vitest';
import type { Subject, SubjectCareer } from '@/features/home/types/subjects';
import { groupSubjects } from './groupSubjects';

function career(overrides: Partial<SubjectCareer> = {}): SubjectCareer {
  return {
    careerId: 'c-sis',
    planId: 'p1',
    year: 1,
    quadmester: 1,
    careerName: 'Ingeniería de Sistemas',
    facultyName: 'Facultad de Ciencias Exactas',
    universityName: 'UNICEN',
    ...overrides,
  };
}

function subject(overrides: Partial<Subject> = {}): Subject {
  return {
    id: 's1',
    title: 'Análisis Matemático I',
    shortName: 'AM1',
    description: '',
    url: '/am1',
    urlMoodle: '',
    urlPrograma: '',
    correlatives: [],
    required: [],
    quadmester: 1,
    year: 1,
    careers: [career()],
    resourceCounts: { resumen: 1, parcial: 2, final: 3 },
    ...overrides,
  };
}

describe('groupSubjects', () => {
  it('devuelve una lista vacía sin materias', () => {
    expect(groupSubjects([])).toEqual([]);
  });

  it('agrupa por universidad, facultad, carrera y año', () => {
    const result = groupSubjects([subject()]);

    expect(result).toEqual([
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
                        resourceCounts: { resumen: 1, parcial: 2, final: 3 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('una materia de varias carreras aparece en cada una, con el año de esa carrera', () => {
    const compartida = subject({
      careers: [
        career(),
        career({ careerId: 'c-mat', careerName: 'Profesorado de Matemática', year: 2 }),
      ],
    });

    const [unicen] = groupSubjects([compartida]);
    const careers = unicen.faculties[0].careers;

    expect(careers.map((c) => c.name)).toEqual([
      'Ingeniería de Sistemas',
      'Profesorado de Matemática',
    ]);
    expect(careers[0].years[0].year).toBe(1);
    expect(careers[1].years[0].year).toBe(2);
    expect(careers[1].years[0].subjects[0].id).toBe('s1');
  });

  it('no duplica una materia que figura en varios planes de la misma carrera', () => {
    const dosPlanes = subject({ careers: [career(), career({ planId: 'p2' })] });

    const [unicen] = groupSubjects([dosPlanes]);

    expect(unicen.faculties[0].careers[0].years[0].subjects).toHaveLength(1);
  });

  it('ordena universidades, facultades y carreras alfabéticamente', () => {
    const result = groupSubjects([
      subject({ id: 'a', careers: [career({ universityName: 'UNLP' })] }),
      subject({
        id: 'b',
        careers: [career({ facultyName: 'Facultad de Veterinaria', careerName: 'Zootecnia' })],
      }),
      subject({ id: 'd' }),
      subject({
        id: 'c',
        careers: [career({ careerId: 'c-bio', careerName: 'Biología' })],
      }),
    ]);

    expect(result.map((u) => u.name)).toEqual(['UNICEN', 'UNLP']);
    expect(result[0].faculties.map((f) => f.name)).toEqual([
      'Facultad de Ciencias Exactas',
      'Facultad de Veterinaria',
    ]);
    expect(result[0].faculties[0].careers.map((c) => c.name)).toEqual([
      'Biología',
      'Ingeniería de Sistemas',
    ]);
  });

  it('ordena los años de menor a mayor y las materias por cuatrimestre y título', () => {
    const result = groupSubjects([
      subject({ id: 'y2', title: 'Física', careers: [career({ year: 2 })] }),
      subject({ id: 'q2', title: 'Álgebra', careers: [career({ quadmester: 2 })] }),
      subject({ id: 'q1b', title: 'Química', careers: [career()] }),
      subject({ id: 'q1a', title: 'Biología', careers: [career()] }),
    ]);

    const years = result[0].faculties[0].careers[0].years;

    expect(years.map((y) => y.year)).toEqual([1, 2]);
    expect(years[0].subjects.map((s) => s.id)).toEqual(['q1a', 'q1b', 'q2']);
    expect(years[0].subjects[2].quadmester).toBe(2);
  });
});
