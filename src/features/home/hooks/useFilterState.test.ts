import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { buildFilterSearchParams, readInitialFilters, useFilterState } from './useFilterState';
import type { AppliedFilters } from '@/features/home/types/filter';

function setUrl(search: string) {
  window.history.replaceState(null, '', search || '/');
}

const EMPTY: AppliedFilters = {
  universityId: '',
  facultyId: '',
  careerId: '',
  planId: '',
  year: 0,
  quadmester: 0,
  search: '',
};

beforeEach(() => {
  setUrl('/');
});

afterEach(() => {
  setUrl('/');
});

describe('readInitialFilters — prioridad de origen', () => {
  it('la URL con ?university= gana sobre todo', () => {
    setUrl('?university=uUrl&faculty=fUrl&career=cUrl');
    const { applied, urlHadUniversity } = readInitialFilters(
      { universityId: 'uDef', facultyId: 'fDef', careerId: 'cDef' },
      { universityId: 'uStored', facultyId: 'fStored' },
    );
    expect(urlHadUniversity).toBe(true);
    expect(applied.universityId).toBe('uUrl');
    expect(applied.facultyId).toBe('fUrl');
    expect(applied.careerId).toBe('cUrl');
  });

  it('sin URL, usa la facultad guardada (carrera vacía)', () => {
    const { applied } = readInitialFilters(
      { universityId: 'uDef', facultyId: 'fDef', careerId: 'cDef' },
      { universityId: 'uStored', facultyId: 'fStored' },
    );
    expect(applied.universityId).toBe('uStored');
    expect(applied.facultyId).toBe('fStored');
    expect(applied.careerId).toBe('');
  });

  it('sin URL ni guardada, cae en el default scope', () => {
    const { applied } = readInitialFilters(
      { universityId: 'uDef', facultyId: 'fDef', careerId: 'cDef' },
      null,
    );
    expect(applied.universityId).toBe('uDef');
    expect(applied.facultyId).toBe('fDef');
    expect(applied.careerId).toBe('cDef');
  });

  it('sin nada, arranca vacío', () => {
    const { applied } = readInitialFilters(null, null);
    expect(applied).toEqual(EMPTY);
  });
});

describe('buildFilterSearchParams', () => {
  it('solo serializa lo que tiene valor', () => {
    const qs = buildFilterSearchParams({
      ...EMPTY,
      facultyId: 'f1',
      careerId: 'c1',
    }).toString();
    expect(qs).toBe('faculty=f1&career=c1');
  });
});

describe('useFilterState', () => {
  it('cambiar de facultad limpia carrera/plan/año en cascada', () => {
    const { result } = renderHook(() => useFilterState(null));

    act(() => {
      result.current.commitFilter('facultyId', 'f1');
      result.current.commitFilter('careerId', 'c1');
      result.current.commitFilter('year', 3);
    });
    expect(result.current.applied.careerId).toBe('c1');

    act(() => {
      result.current.commitFilter('facultyId', 'f2');
    });
    expect(result.current.applied.facultyId).toBe('f2');
    expect(result.current.applied.careerId).toBe('');
    expect(result.current.applied.year).toBe(0);
  });

  it('clearAll conserva la facultad y limpia el resto', () => {
    const { result } = renderHook(() => useFilterState(null));

    act(() => {
      result.current.commitFilter('facultyId', 'f9');
      result.current.commitFilter('careerId', 'c9');
      result.current.setSearch('algo');
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.applied.facultyId).toBe('f9');
    expect(result.current.applied.careerId).toBe('');
    expect(result.current.applied.search).toBe('');
  });
});
