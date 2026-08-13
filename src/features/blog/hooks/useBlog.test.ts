import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBlog } from './useBlog';
import { getBlog } from '@/shared/services/api';
import type { Blog } from '../types/blog';

vi.mock('@/shared/services/api', () => ({
  getBlog: vi.fn(),
}));

const getBlogMock = vi.mocked(getBlog);

const emptyBlog: Blog = { subjectId: 's1', subtopics: [], posts: [] };

type HookProps = { token: string | null; loading: boolean };

describe('useBlog', () => {
  beforeEach(() => {
    getBlogMock.mockReset();
    getBlogMock.mockResolvedValue(emptyBlog);
  });

  it('no fetchea mientras el auth está cargando', () => {
    const initialProps: HookProps = { token: null, loading: true };
    renderHook(({ token, loading }: HookProps) => useBlog('s1', token, loading), {
      initialProps,
    });
    expect(getBlogMock).not.toHaveBeenCalled();
  });

  it('fetchea con el token cuando el auth resuelve', async () => {
    const initialProps: HookProps = { token: null, loading: true };
    const { rerender } = renderHook(
      ({ token, loading }: HookProps) => useBlog('s1', token, loading),
      { initialProps },
    );

    rerender({ token: 'token-123', loading: false });

    await waitFor(() => expect(getBlogMock).toHaveBeenCalledWith('s1', 'token-123'));
  });
});
