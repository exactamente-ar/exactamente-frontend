import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResourceFetch } from '@/features/resource/types/resource';
import { useResources } from './useResources';

const getByIdResources = vi.hoisted(() => vi.fn());

vi.mock('@/features/resource/services/resource', () => ({ getByIdResources }));

const resource: ResourceFetch = {
  id: 'r1',
  title: 'Parcial 1',
  type: 'parcial',
  subtype: null,
  examYear: 2024,
  examMonth: 6,
  topic: null,
  fileUrl: 'https://files.example.com/r1.pdf',
};

beforeEach(() => {
  getByIdResources.mockReset();
});

describe('useResources', () => {
  it('sin datos iniciales arranca cargando y los pide en el cliente', async () => {
    getByIdResources.mockResolvedValue({ data: [resource], error: null });

    const { result } = renderHook(() => useResources('s1', 'Parciales'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getByIdResources).toHaveBeenCalledWith('s1', 'Parciales');
    expect(result.current.data).toEqual([resource]);
  });

  it('con datos iniciales del servidor no carga ni vuelve a pedirlos', () => {
    const { result } = renderHook(() =>
      useResources('s1', 'Parciales', { initialData: [resource] }),
    );

    expect(result.current).toEqual({ data: [resource], error: null, loading: false });
    expect(getByIdResources).not.toHaveBeenCalled();
  });

  it('una lista inicial vacía también cuenta como dato del servidor', () => {
    const { result } = renderHook(() => useResources('s1', 'Parciales', { initialData: [] }));

    expect(result.current).toEqual({ data: [], error: null, loading: false });
    expect(getByIdResources).not.toHaveBeenCalled();
  });

  it('si el servidor falló, reintenta en el cliente', async () => {
    getByIdResources.mockResolvedValue({ data: [resource], error: null });

    const { result } = renderHook(() =>
      useResources('s1', 'Parciales', { initialData: null, initialError: 'timeout' }),
    );

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ data: [resource], error: null, loading: false });
  });

  it('si el reintento también falla, muestra el error', async () => {
    getByIdResources.mockResolvedValue({ data: [], error: 'Request failed with status 500' });

    const { result } = renderHook(() =>
      useResources('s1', 'Parciales', { initialData: null, initialError: 'timeout' }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Request failed with status 500');
  });
});
