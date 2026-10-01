import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFacultyTheme } from './useFacultyTheme';
import { STORED_FACULTY_KEY } from '@/features/home/utils/storedFaculty';

const faculties = [
  { id: 'f1', name: 'Exactas', shortName: 'EXACTAS', slug: 'exactas' },
  { id: 'f2', name: 'Humanas', shortName: 'HUMANAS', slug: 'humanas' },
];

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  document.documentElement.removeAttribute('data-faculty');
});

describe('useFacultyTheme', () => {
  it('aplica el tema de la facultad activa', () => {
    renderHook(() => useFacultyTheme('f2', faculties));
    expect(document.documentElement.dataset.faculty).toBe('humanas');
  });

  it('cambia el tema cuando cambia la facultad activa', () => {
    const { rerender } = renderHook(({ id }) => useFacultyTheme(id, faculties), {
      initialProps: { id: 'f1' },
    });
    expect(document.documentElement.dataset.faculty).toBe('exactas');
    rerender({ id: 'f2' });
    expect(document.documentElement.dataset.faculty).toBe('humanas');
  });

  it('no toca el tema mientras las facultades no cargaron', () => {
    document.documentElement.dataset.faculty = 'humanas';
    renderHook(() => useFacultyTheme('f1', []));
    expect(document.documentElement.dataset.faculty).toBe('humanas');
  });

  it('completa el slug de un valor guardado viejo sin slug', () => {
    localStorage.setItem(
      STORED_FACULTY_KEY,
      JSON.stringify({ universityId: 'u1', facultyId: 'f2' }),
    );
    renderHook(() => useFacultyTheme('f2', faculties));
    expect(JSON.parse(localStorage.getItem(STORED_FACULTY_KEY)!)).toEqual({
      universityId: 'u1',
      facultyId: 'f2',
      slug: 'humanas',
    });
  });

  it('no inventa un valor guardado si el usuario nunca eligió facultad', () => {
    renderHook(() => useFacultyTheme('f1', faculties));
    expect(localStorage.getItem(STORED_FACULTY_KEY)).toBeNull();
  });
});
