import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/shared/services/api', () => ({
  getUniversities: vi.fn(),
  getFaculties: vi.fn(),
  getCareers: vi.fn(),
}));

import { getUniversities, getFaculties, getCareers } from '@/shared/services/api';
import { useResolvedDefaultScope } from './useResolvedDefaultScope';

const ok = <T>(data: T) => ({ data, error: null });
const fail = (error: string): { data: []; error: string } => ({ data: [], error });

const mockGetUniversities = vi.mocked(getUniversities);
const mockGetFaculties = vi.mocked(getFaculties);
const mockGetCareers = vi.mocked(getCareers);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('useResolvedDefaultScope', () => {
  it('resuelve el scope cuando todos los shortName matchean', async () => {
    mockGetUniversities.mockResolvedValue(ok([{ id: 'u1', name: 'UNICEN', shortName: 'UNICEN' }]));
    mockGetFaculties.mockResolvedValue(ok([{ id: 'f1', name: 'Exactas', shortName: 'EXACTAS' }]));
    mockGetCareers.mockResolvedValue(
      ok([{ id: 'c1', name: 'Sistemas', shortName: 'Ing. en Sistemas' }]),
    );

    const { result } = renderHook(() => useResolvedDefaultScope());
    await waitFor(() => expect(result.current.scopeReady).toBe(true));

    expect(result.current.scopeError).toBeNull();
    expect(result.current.defaultScope).toEqual({
      universityId: 'u1',
      facultyId: 'f1',
      careerId: 'c1',
    });
  });

  it('degrada a la primera facultad si el shortName EXACTAS no matchea (rename de catálogo)', async () => {
    mockGetUniversities.mockResolvedValue(ok([{ id: 'u1', name: 'UNICEN', shortName: 'UNICEN' }]));
    mockGetFaculties.mockResolvedValue(
      ok([
        { id: 'fA', name: 'Cs. Exactas', shortName: 'FCEyN' },
        { id: 'fB', name: 'Ingeniería', shortName: 'FI' },
      ]),
    );
    mockGetCareers.mockResolvedValue(ok([{ id: 'cA', name: 'Algo', shortName: 'Otra' }]));

    const { result } = renderHook(() => useResolvedDefaultScope());
    await waitFor(() => expect(result.current.scopeReady).toBe(true));

    expect(result.current.scopeError).toBeNull();
    expect(result.current.defaultScope).toEqual({
      universityId: 'u1',
      facultyId: 'fA',
      careerId: 'cA',
    });
  });

  it('marca scopeError solo si la lista de facultades viene vacía', async () => {
    mockGetUniversities.mockResolvedValue(ok([{ id: 'u1', name: 'UNICEN', shortName: 'UNICEN' }]));
    mockGetFaculties.mockResolvedValue(ok([]));

    const { result } = renderHook(() => useResolvedDefaultScope());
    await waitFor(() => expect(result.current.scopeReady).toBe(true));

    expect(result.current.scopeError).toBeTruthy();
    expect(result.current.defaultScope).toBeNull();
  });

  it('marca scopeError si la API de facultades falla', async () => {
    mockGetUniversities.mockResolvedValue(ok([{ id: 'u1', name: 'UNICEN', shortName: 'UNICEN' }]));
    mockGetFaculties.mockResolvedValue(fail('500'));

    const { result } = renderHook(() => useResolvedDefaultScope());
    await waitFor(() => expect(result.current.scopeReady).toBe(true));

    expect(result.current.scopeError).toBeTruthy();
  });

  it('resuelve sin carrera si la facultad todavía no tiene carreras cargadas', async () => {
    mockGetUniversities.mockResolvedValue(ok([{ id: 'u1', name: 'UNICEN', shortName: 'UNICEN' }]));
    mockGetFaculties.mockResolvedValue(ok([{ id: 'f1', name: 'Nueva', shortName: 'NUEVA' }]));
    mockGetCareers.mockResolvedValue(ok([]));

    const { result } = renderHook(() => useResolvedDefaultScope());
    await waitFor(() => expect(result.current.scopeReady).toBe(true));

    expect(result.current.scopeError).toBeNull();
    expect(result.current.defaultScope).toEqual({
      universityId: 'u1',
      facultyId: 'f1',
      careerId: '',
    });
  });
});
