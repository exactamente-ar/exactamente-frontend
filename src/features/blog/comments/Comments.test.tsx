import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comments from './Comments';
import { ReplyProvider } from '../context/ReplyContext';
import { deleteComment, voteComment } from '@/shared/services/api';
import type { BlogComment } from '../types/blog';

const authMock = vi.hoisted(() => ({ token: 'token-123', loading: false }));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => authMock,
}));

vi.mock('@/shared/services/api', () => ({
  voteComment: vi.fn(),
  deleteComment: vi.fn(),
}));

const voteCommentMock = vi.mocked(voteComment);
const deleteCommentMock = vi.mocked(deleteComment);

function makeComment(
  id: string,
  parentId: string | null = null,
  overrides: Partial<BlogComment> = {},
): BlogComment {
  return {
    id,
    postId: 'p1',
    parentId,
    body: `Cuerpo de ${id}`,
    authority: 'visible',
    status: 'published',
    netScore: 0,
    depth: parentId ? 2 : 1,
    createdAt: '2026-01-01T00:00:00Z',
    author: { name: 'Juan' },
    images: [],
    mine: false,
    myVote: 0,
    ...overrides,
  };
}

describe('Comments', () => {
  beforeEach(() => {
    authMock.token = 'token-123';
    voteCommentMock.mockReset();
    deleteCommentMock.mockReset();
  });

  it('muestra las respuestas visibles por defecto (no colapsadas)', () => {
    const comments = [makeComment('c1', null), makeComment('c2', 'c1')];

    render(
      <ReplyProvider>
        <Comments
          subjectId='s1'
          postId='p1'
          comments={comments}
          hoveredId={null}
          onHover={() => {}}
        />
      </ReplyProvider>,
    );

    expect(screen.getByText('Cuerpo de c1')).toBeTruthy();
    expect(screen.getByText('Cuerpo de c2')).toBeTruthy();
    expect(screen.queryByText('+1 comentario')).toBeNull();
  });

  it('permite colapsar y volver a expandir las respuestas', async () => {
    const user = userEvent.setup();
    const comments = [makeComment('c1', null), makeComment('c2', 'c1')];

    render(
      <ReplyProvider>
        <Comments
          subjectId='s1'
          postId='p1'
          comments={comments}
          hoveredId={null}
          onHover={() => {}}
        />
      </ReplyProvider>,
    );

    const hideBtn = screen.getByRole('button', { name: 'Ocultar comentarios' });
    await user.click(hideBtn);

    expect(screen.queryByText('Cuerpo de c2')).toBeNull();
    const expandBtn = screen.getByRole('button', { name: '+1 comentario' });
    expect(expandBtn).toBeTruthy();

    await user.click(expandBtn);
    expect(screen.getByText('Cuerpo de c2')).toBeTruthy();
  });

  it('notifica onVoteChanged al votar un comentario', async () => {
    const user = userEvent.setup();
    const onVoteChanged = vi.fn();
    voteCommentMock.mockResolvedValue({ data: { netScore: 1, myVote: 1 }, error: null });

    render(
      <ReplyProvider>
        <Comments
          subjectId='s1'
          postId='p1'
          comments={[makeComment('c1', null, { mine: false })]}
          hoveredId={null}
          onHover={() => {}}
          onVoteChanged={onVoteChanged}
        />
      </ReplyProvider>,
    );

    const upvote = screen.getByRole('button', { name: 'Votar a favor' });
    await user.click(upvote);

    await waitFor(() =>
      expect(voteCommentMock).toHaveBeenCalledWith('s1', 'p1', 'c1', 1, 'token-123'),
    );
    expect(onVoteChanged).toHaveBeenCalledWith('c1', { netScore: 1, myVote: 1 });
  });

  it('deshabilita el botón borrar mientras la eliminación está en curso', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    let resolveDelete!: (val: { data: null; error: null }) => void;
    deleteCommentMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        }),
    );

    render(
      <ReplyProvider>
        <Comments
          subjectId='s1'
          postId='p1'
          comments={[makeComment('c1', null, { mine: true })]}
          hoveredId={null}
          onHover={() => {}}
          onDeleted={onDeleted}
        />
      </ReplyProvider>,
    );

    const deleteBtn = screen.getByRole('button', { name: 'Borrar' });
    await user.click(deleteBtn);

    expect(deleteBtn).toBeDisabled();
    expect(deleteCommentMock).toHaveBeenCalledTimes(1);

    resolveDelete({ data: null, error: null });
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith('c1'));
  });
});
