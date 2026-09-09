import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useBlog } from './useBlog';
import { getBlog } from '@/shared/services/api';
import type { Blog, BlogComment, BlogPost } from '../types/blog';

vi.mock('@/shared/services/api', () => ({
  getBlog: vi.fn(),
}));

const getBlogMock = vi.mocked(getBlog);

const emptyBlog: Blog = { subjectId: 's1', subtopics: [], posts: [] };

function post(id: string, overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id,
    subtopicId: 'sub-general',
    body: `body ${id}`,
    authority: 'visible',
    status: 'published',
    netScore: 0,
    createdAt: '2026-01-01T00:00:00Z',
    author: null,
    images: [],
    comments: [],
    mine: false,
    myVote: 0,
    ...overrides,
  };
}

function comment(id: string, postId: string, overrides: Partial<BlogComment> = {}): BlogComment {
  return {
    id,
    postId,
    parentId: null,
    body: `body ${id}`,
    authority: 'visible',
    status: 'published',
    netScore: 0,
    depth: 1,
    createdAt: '2026-01-01T00:00:00Z',
    author: null,
    images: [],
    mine: false,
    myVote: 0,
    ...overrides,
  };
}

type HookProps = { token: string | null; loading: boolean };

describe('useBlog', () => {
  beforeEach(() => {
    getBlogMock.mockReset();
    getBlogMock.mockResolvedValue({ data: emptyBlog, error: null });
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

  it('captura el error cuando la API falla', async () => {
    getBlogMock.mockResolvedValue({ data: [], error: 'Error del servidor' });
    const hook = renderHook(() => useBlog('s1', null, false));

    await waitFor(() => expect(hook.result.current.loading).toBe(false));

    expect(hook.result.current.error).toBe('Error del servidor');
    expect(hook.result.current.blog).toBeNull();
  });

  it('permite reintentar con retry', async () => {
    getBlogMock
      .mockResolvedValueOnce({ data: [], error: 'Error del servidor' })
      .mockResolvedValueOnce({ data: emptyBlog, error: null });

    const hook = renderHook(() => useBlog('s1', null, false));
    await waitFor(() => expect(hook.result.current.error).toBe('Error del servidor'));

    act(() => {
      hook.result.current.retry();
    });

    await waitFor(() => expect(hook.result.current.error).toBeNull());
    expect(hook.result.current.blog).toEqual(emptyBlog);
  });

  describe('mutadores locales', () => {
    const blogWithPosts: Blog = {
      subjectId: 's1',
      subtopics: [{ id: 'sub-general', name: 'General', slug: 'general', isDefault: true }],
      posts: [
        post('p1', {
          netScore: 5,
          comments: [comment('c1', 'p1')],
        }),
      ],
    };

    async function renderLoaded(blog: Blog = blogWithPosts) {
      getBlogMock.mockResolvedValue({ data: blog, error: null });
      const hook = renderHook(() => useBlog('s1', 'token-123', false));
      await waitFor(() => expect(hook.result.current.loading).toBe(false));
      return hook;
    }

    it('addPost inserta el post sin volver a fetchear', async () => {
      const hook = await renderLoaded();
      getBlogMock.mockClear();

      act(() => hook.result.current.addPost(post('p2')));

      expect(hook.result.current.blog?.posts.map((p) => p.id)).toEqual(['p1', 'p2']);
      expect(getBlogMock).not.toHaveBeenCalled();
    });

    it('addComment inserta el comentario en el post correcto', async () => {
      const hook = await renderLoaded();

      act(() => hook.result.current.addComment('p1', comment('c2', 'p1')));

      const comments = hook.result.current.blog?.posts[0].comments;
      expect(comments?.map((c) => c.id)).toEqual(['c1', 'c2']);
    });

    it('removePost elimina el post localmente', async () => {
      const hook = await renderLoaded({ subjectId: 's1', subtopics: [], posts: [post('p1')] });

      act(() => hook.result.current.removePost('p1'));

      expect(hook.result.current.blog?.posts).toEqual([]);
    });

    it('removeComment elimina el comentario localmente', async () => {
      const hook = await renderLoaded();

      act(() => hook.result.current.removeComment('p1', 'c1'));

      expect(hook.result.current.blog?.posts[0].comments).toEqual([]);
    });

    it('updatePostVote actualiza netScore y myVote del post', async () => {
      const hook = await renderLoaded();

      act(() => hook.result.current.updatePostVote('p1', { netScore: 6, myVote: 1 }));

      const post = hook.result.current.blog?.posts.find((p) => p.id === 'p1');
      expect(post?.netScore).toBe(6);
      expect(post?.myVote).toBe(1);
    });

    it('updateCommentVote actualiza netScore y myVote del comentario', async () => {
      const hook = await renderLoaded();

      act(() => hook.result.current.updateCommentVote('p1', 'c1', { netScore: 3, myVote: 1 }));

      const comment = hook.result.current.blog?.posts[0].comments.find((c) => c.id === 'c1');
      expect(comment?.netScore).toBe(3);
      expect(comment?.myVote).toBe(1);
    });
  });
});
