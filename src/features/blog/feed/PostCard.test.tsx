import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from './PostCard';
import { ReplyProvider } from '../context/ReplyContext';
import { deletePost, votePost } from '@/shared/services/api';
import type { BlogPost } from '../types/blog';

const authMock = vi.hoisted(() => ({ token: 'token-123', loading: false }));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => authMock,
}));

vi.mock('@/shared/services/api', () => ({
  votePost: vi.fn(),
  deletePost: vi.fn(),
  voteComment: vi.fn(),
  deleteComment: vi.fn(),
}));

const votePostMock = vi.mocked(votePost);
const deletePostMock = vi.mocked(deletePost);

function makePost(id: string, overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id,
    subtopicId: 'sub-general',
    body: `Cuerpo de ${id}`,
    authority: 'visible',
    status: 'published',
    netScore: 0,
    createdAt: '2026-01-01T00:00:00Z',
    author: { name: 'Lucas' },
    images: [],
    comments: [],
    mine: false,
    myVote: 0,
    ...overrides,
  };
}

describe('PostCard', () => {
  beforeEach(() => {
    authMock.token = 'token-123';
    votePostMock.mockReset();
    deletePostMock.mockReset();
  });

  it('notifica onVoteChanged con el postId y nuevo voto', async () => {
    const user = userEvent.setup();
    const onVoteChanged = vi.fn();
    votePostMock.mockResolvedValue({ data: { netScore: 1, myVote: 1 }, error: null });

    render(
      <ReplyProvider>
        <PostCard
          subjectId='s1'
          post={makePost('p1', { mine: false })}
          onVoteChanged={onVoteChanged}
        />
      </ReplyProvider>,
    );

    const upvote = screen.getByRole('button', { name: 'Votar a favor' });
    await user.click(upvote);

    await waitFor(() => expect(votePostMock).toHaveBeenCalledWith('s1', 'p1', 1, 'token-123'));
    expect(onVoteChanged).toHaveBeenCalledWith('p1', { netScore: 1, myVote: 1 });
  });

  it('deshabilita los botones de voto mientras la petición está en vuelo', async () => {
    const user = userEvent.setup();
    let resolveVote!: (val: { data: { netScore: 1; myVote: 1 }; error: null }) => void;
    votePostMock.mockImplementation(
      () =>
        new Promise((r) => {
          resolveVote = r;
        }),
    );

    render(
      <ReplyProvider>
        <PostCard subjectId='s1' post={makePost('p1', { mine: false })} />
      </ReplyProvider>,
    );

    const upvote = screen.getByRole('button', { name: 'Votar a favor' });
    await user.click(upvote);

    expect(upvote).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Votar en contra' })).toBeDisabled();

    resolveVote({ data: { netScore: 1, myVote: 1 }, error: null });
    await waitFor(() => expect(upvote).not.toBeDisabled());
  });

  it('notifica onDeleted al borrar el post con éxito', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    deletePostMock.mockResolvedValue({ data: null, error: null });

    render(
      <ReplyProvider>
        <PostCard subjectId='s1' post={makePost('p1', { mine: true })} onDeleted={onDeleted} />
      </ReplyProvider>,
    );

    const deleteBtn = screen.getByRole('button', { name: 'Borrar' });
    await user.click(deleteBtn);

    await waitFor(() => expect(deletePostMock).toHaveBeenCalledWith('s1', 'p1', 'token-123'));
    expect(onDeleted).toHaveBeenCalledWith('p1');
  });
});
