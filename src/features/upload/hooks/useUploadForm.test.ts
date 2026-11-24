import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type React from 'react';

vi.mock('@/shared/services/api', () => ({
  uploadResource: vi.fn(),
  checkDuplicate: vi.fn(),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ token: 'token-de-prueba', logout: vi.fn() }),
}));

import { uploadResource } from '@/shared/services/api';
import { useUploadForm } from './useUploadForm';

const mockUploadResource = vi.mocked(uploadResource);

const submitEvent = { preventDefault: () => {} } as React.FormEvent;

let gtag: ReturnType<typeof vi.fn<NonNullable<Window['gtag']>>>;

beforeEach(() => {
  vi.clearAllMocks();
  gtag = vi.fn<NonNullable<Window['gtag']>>();
  window.gtag = gtag;
});

afterEach(() => {
  delete window.gtag;
});

function renderFilledForm() {
  const { result } = renderHook(() =>
    useUploadForm({
      careerId: 'career-1',
      subjectId: 'subject-1',
      type: 'resumen',
      title: 'Resumen de Álgebra',
      examYear: '2024',
      examMonth: '6',
    }),
  );
  act(() => {
    result.current.onFileChange(new File(['%PDF'], 'resumen.pdf', { type: 'application/pdf' }));
  });
  return result;
}

describe('useUploadForm — eventos de analítica', () => {
  it('registra la subida exitosa con la materia y el tipo', async () => {
    mockUploadResource.mockResolvedValue({ data: {}, error: null } as never);
    const result = renderFilledForm();

    await act(() => result.current.handleSubmit(submitEvent));

    expect(result.current.showSuccess).toBe(true);
    expect(gtag).toHaveBeenCalledWith('event', 'resource_upload', {
      subject_id: 'subject-1',
      type: 'resumen',
    });
  });

  it('no registra nada si la subida falla', async () => {
    mockUploadResource.mockResolvedValue({ data: [], error: 'Error del servidor' });
    const result = renderFilledForm();

    await act(() => result.current.handleSubmit(submitEvent));

    expect(gtag).not.toHaveBeenCalled();
  });
});
