import { afterEach, describe, expect, it } from 'vitest';
import { applyFacultyTheme } from './applyFacultyTheme';

afterEach(() => {
  document.documentElement.removeAttribute('data-faculty');
});

describe('applyFacultyTheme', () => {
  it('setea data-faculty en <html>', () => {
    applyFacultyTheme('humanas');
    expect(document.documentElement.dataset.faculty).toBe('humanas');
  });

  it('cambia el tema sin recargar al aplicar otra facultad', () => {
    applyFacultyTheme('humanas');
    applyFacultyTheme('veterinarias');
    expect(document.documentElement.dataset.faculty).toBe('veterinarias');
  });

  it('cae en exactas con un slug desconocido o ausente', () => {
    applyFacultyTheme('inexistente');
    expect(document.documentElement.dataset.faculty).toBe('exactas');
    applyFacultyTheme(undefined);
    expect(document.documentElement.dataset.faculty).toBe('exactas');
  });
});
