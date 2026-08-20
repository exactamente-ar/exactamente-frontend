import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { votePost, deletePost } from '@/shared/services/api';
import { useReplyContext } from '../context/ReplyContext';
import { THREAD_LINE_ML, getLineColor, getLineStyle } from '../constants/comments';
import VoteControl from '../shared/VoteControl';
import Comments from '../comments/Comments';
import ImageGallery from '../shared/ImageGallery';
import { formatDateTime } from '../utils/format';
import type { BlogPost } from '../types/blog';

interface Props {
  subjectId: string;
  post: BlogPost;
  onDeleted?: (postId: string) => void;
  onCommentDeleted?: (commentId: string) => void;
  onVoteChanged?: (postId: string, vote: { netScore: number; myVote: number }) => void;
  onCommentVoteChanged?: (
    postId: string,
    commentId: string,
    vote: { netScore: number; myVote: number },
  ) => void;
}

export default function PostCard({
  subjectId,
  post,
  onDeleted,
  onCommentDeleted,
  onVoteChanged,
  onCommentVoteChanged,
}: Props) {
  const { token } = useAuth();
  const { setReplyTarget } = useReplyContext();
  const [isVoting, setIsVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const votable = !!token && !post.mine && post.status !== 'deleted';

  async function vote(value: 1 | -1) {
    if (!votable || isVoting) return;
    setIsVoting(true);
    const result = await votePost(subjectId, post.id, value, token);
    setIsVoting(false);
    if (result.error !== null) return;
    onVoteChanged?.(post.id, result.data);
  }

  async function remove() {
    if (!token || deleting) return;
    setDeleting(true);
    const result = await deletePost(subjectId, post.id, token);
    if (result.error !== null) {
      setDeleting(false);
      return;
    }
    if (onDeleted) onDeleted(post.id);
  }

  return (
    <li
      className='flex flex-col rounded-2xl p-4 group/post'
      onMouseOver={() => setHoveredId(null)}
      onMouseLeave={() => setHoveredId(null)}
      onFocus={() => setHoveredId(null)}
    >
      <div className='flex gap-2'>
        <div className='flex w-8 shrink-0 flex-col items-center'>
          <VoteControl
            netScore={post.netScore}
            myVote={post.myVote}
            canVote={votable && !isVoting}
            onVote={vote}
          />
          {post.comments.length > 0 && (
            <div
              className={`mt-2 self-start ${THREAD_LINE_ML} flex-1 border-l-[1.5px] ${getLineColor(hoveredId !== null)} transition-all`}
              style={getLineStyle(hoveredId !== null)}
            />
          )}
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-2 mt-1.5'>
          <div className='flex items-baseline justify-between gap-2'>
            <span className='text-xs font-semibold text-zinc-300'>
              {post.author?.name ?? 'Anónimo'}
            </span>
            <time className='shrink-0 text-xs text-zinc-500' dateTime={post.createdAt}>
              {formatDateTime(post.createdAt)}
            </time>
          </div>

          <p className='text-zinc-200'>{post.body}</p>
          <ImageGallery images={post.images} />

          <div className='flex items-center text-xs text-zinc-500 gap-2'>
            {token && (
              <button
                type='button'
                onClick={() =>
                  setReplyTarget({ postId: post.id, parentId: null, snippet: post.body })
                }
                className='font-semibold text-zinc-400 hover:text-zinc-200'
              >
                Responder
              </button>
            )}
            {post.mine && (
              <button
                type='button'
                onClick={remove}
                disabled={deleting}
                className='text-red-400/80 hover:text-red-300 disabled:opacity-50'
              >
                {deleting ? 'Borrando...' : 'Borrar'}
              </button>
            )}
          </div>
        </div>
      </div>

      {post.comments.length > 0 && (
        <Comments
          subjectId={subjectId}
          postId={post.id}
          comments={post.comments}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onDeleted={onCommentDeleted}
          onVoteChanged={(commentId, vote) => onCommentVoteChanged?.(post.id, commentId, vote)}
        />
      )}
    </li>
  );
}
