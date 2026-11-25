import { afterEach, describe, expect, it } from 'vitest';
import {
  STUDY_CONTEXT_ID,
  resetPageContextCache,
  readPageContext,
  resolveContextSubject,
  serializeStudyContext,
  toStudyContext,
  type PageStudyContext,
} from './context';

const CONTEXT: PageStudyContext = {
  subjectId: 's1',
  subjectName: 'Cálculo II',
  careers: [
    { careerId: 'c1', careerName: 'Ing. en Sistemas' },
    { careerId: 'c2', careerName: 'Ing. Electrónica' },
  ],
};

afterEach(() => {
  document.body.innerHTML = '';
  resetPageContextCache();
});

function mountContext(content: string) {
  const script = document.createElement('script');
  script.type = 'application/json';
  script.id = STUDY_CONTEXT_ID;
  script.textContent = content;
  document.body.append(script);
}

describe('toStudyContext', () => {
  it('toma id y nombre de la materia y sus carreras sin repetir', () => {
    const context = toStudyContext({
      id: 's1',
      title: 'Cálculo II',
      careers: [
        { careerId: 'c1', careerName: 'Ing. en Sistemas' },
        { careerId: 'c1', careerName: 'Ing. en Sistemas' },
        { careerId: 'c2', careerName: 'Ing. Electrónica' },
      ],
    });

    expect(context).toEqual(CONTEXT);
  });
});

describe('serializeStudyContext', () => {
  it('escapa < para que el JSON no pueda cerrar el <script>', () => {
    const json = serializeStudyContext({ ...CONTEXT, subjectName: '</script><b>' });

    expect(json).not.toContain('</script>');
    expect(JSON.parse(json).subjectName).toBe('</script><b>');
  });
});

describe('readPageContext', () => {
  it('lee el JSON de la página', () => {
    mountContext(serializeStudyContext(CONTEXT));

    expect(readPageContext()).toEqual(CONTEXT);
  });

  it('sin script o con JSON inválido devuelve null', () => {
    expect(readPageContext()).toBeNull();

    resetPageContextCache();
    mountContext('{roto');
    expect(readPageContext()).toBeNull();

    resetPageContextCache();
    document.body.innerHTML = '';
    mountContext(JSON.stringify({ subjectId: 's1' }));
    expect(readPageContext()).toBeNull();
  });
});

describe('resolveContextSubject', () => {
  it('usa la última carrera si la materia pertenece a ella', () => {
    expect(resolveContextSubject(CONTEXT, { careerId: 'c2', careerName: 'x' })).toEqual({
      subjectId: 's1',
      subjectName: 'Cálculo II',
      careerId: 'c2',
      careerName: 'Ing. Electrónica',
    });
  });

  it('si no, la primera carrera de la materia', () => {
    expect(resolveContextSubject(CONTEXT, { careerId: 'c9', careerName: 'x' })).toMatchObject({
      careerId: 'c1',
    });
    expect(resolveContextSubject(CONTEXT, null)).toMatchObject({ careerId: 'c1' });
  });

  it('una materia sin carreras no se puede resolver', () => {
    expect(resolveContextSubject({ ...CONTEXT, careers: [] }, null)).toBeNull();
  });
});
