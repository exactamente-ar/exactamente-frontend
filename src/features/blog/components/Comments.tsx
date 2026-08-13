import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { voteComment, deleteComment } from '@/shared/services/api';
import { useReplyContext } from '../context/ReplyContext';
import { THREAD_LINE_ML } from '../constants/comments';
import { formatDateTime } from '../utils/format';
import VoteControl from './VoteControl';
import type { BlogComment } from '../types/blog';

import CommentLines from './CommentLines';

interface Props {
  subjectId: string;
  postId: string;
  comments: BlogComment[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}

type CommentTree = Map<string | null, BlogComment[]>;

function buildTree(comments: BlogComment[]): CommentTree {
  const map: CommentTree = new Map();
  for (const comment of comments) {
    const key = comment.parentId;
    const list = map.get(key) ?? [];
    list.push(comment);
    map.set(key, list);
  }
  return map;
}

function buildParentMap(comments: BlogComment[]): Map<string, string | null> {
  const map = new Map<string, string | null>();
  for (const c of comments) map.set(c.id, c.parentId);
  return map;
}

function lineColor(active: boolean): string {
  return active ? 'border-zinc-300' : 'border-zinc-600';
}

interface ItemProps {
  subjectId: string;
  postId: string;
  comment: BlogComment;
  tree: CommentTree;
  onSubmitted: () => void;
  hoveredId: string | null;
  ancestorIds: Set<string>;
  onHover: (id: string | null) => void;
  isLast: boolean;
  isDownwardLineActive: boolean;
}

function CommentItem({
  subjectId,
  postId,
  comment,
  tree,
  onSubmitted,
  hoveredId,
  ancestorIds,
  onHover,
  isLast,
  isDownwardLineActive,
}: ItemProps) {
  const { token } = useAuth();
  const { setReplyTarget } = useReplyContext();
  const [netScore, setNetScore] = useState(comment.netScore);
  const [myVote, setMyVote] = useState(0);
  const children = tree.get(comment.id) ?? [];
  const hasChildren = children.length > 0;
  const isActive = comment.id === hoveredId || ancestorIds.has(comment.id);
  const isChildActive = ancestorIds.has(comment.id);
  const activeChildIndex = children.findIndex((c) => c.id === hoveredId || ancestorIds.has(c.id));

  async function vote(value: 1 | -1) {
    if (!token) return;
    const result = await voteComment(subjectId, postId, comment.id, value, token);
    if (result.error !== null) return;
    setNetScore(result.data.netScore);
    setMyVote(result.data.myVote);
  }

  async function remove() {
    if (!token) return;
    const result = await deleteComment(subjectId, postId, comment.id, token);
    if (result.error !== null) return;
    onSubmitted();
  }

  return (
    <div
      className='flex flex-col relative'
      onMouseOver={(e) => {
        e.stopPropagation();
        onHover(comment.id);
      }}
      onFocus={(e) => {
        e.stopPropagation();
        onHover(comment.id);
      }}
    >
      <CommentLines
        isActive={isActive}
        isDownwardLineActive={isDownwardLineActive}
        isLast={isLast}
        isRoot={!comment.parentId}
      />

      <div className='flex gap-3 relative z-10'>
        <div className='flex w-7 shrink-0 flex-col items-center pt-1'>
          <VoteControl
            netScore={netScore}
            myVote={myVote}
            canVote={!!token && !comment.mine}
            onVote={vote}
          />
          {hasChildren && (
            <div
              className={`mt-2 self-start ${THREAD_LINE_ML} flex-1 border-l-2 ${lineColor(isChildActive)} transition-colors`}
            />
          )}
        </div>
        <div className='flex min-w-0 mt-2 flex-1 flex-col gap-1 pb-1 pr-1'>
          <div className='flex items-baseline justify-between gap-3'>
            <span className='text-xs font-semibold text-zinc-300 mt-1'>
              {comment.author?.name ?? 'Anónimo'}
            </span>
            <time className='shrink-0 text-xs text-zinc-500' dateTime={comment.createdAt}>
              {formatDateTime(comment.createdAt)}
            </time>
          </div>
          <p className='text-sm text-zinc-200 mt-1'>{comment.body}</p>
          <div className='flex items-center gap-3 text-xs text-zinc-500 mt-1'>
            {token && (
              <button
                type='button'
                onClick={() =>
                  setReplyTarget({ postId, parentId: comment.id, snippet: comment.body })
                }
                className='font-semibold text-zinc-400 hover:text-zinc-200'
              >
                Responder
              </button>
            )}
            {comment.mine && (
              <button type='button' onClick={remove} className='text-red-400 hover:text-red-300'>
                Borrar
              </button>
            )}
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className={`${THREAD_LINE_ML}`}>
          <div className='flex flex-col gap-3 pl-[29px]'>
            {children.map((child, index) => (
              <CommentItem
                key={child.id}
                subjectId={subjectId}
                postId={postId}
                comment={child}
                tree={tree}
                onSubmitted={onSubmitted}
                hoveredId={hoveredId}
                ancestorIds={ancestorIds}
                onHover={onHover}
                isLast={index === children.length - 1}
                isDownwardLineActive={activeChildIndex > index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Comments({ subjectId, postId, comments, hoveredId, onHover }: Props) {
  const tree = useMemo(() => buildTree(comments), [comments]);
  const roots = tree.get(null) ?? [];
  const parentById = useMemo(() => buildParentMap(comments), [comments]);

  const ancestorIds = useMemo(() => {
    const set = new Set<string>();
    let cur = hoveredId;
    while (cur) {
      const parent = parentById.get(cur);
      if (!parent) break;
      set.add(parent);
      cur = parent;
    }
    return set;
  }, [hoveredId, parentById]);

  const activeRootIndex = roots.findIndex((r) => r.id === hoveredId || ancestorIds.has(r.id));

  function refresh() {
    window.location.reload();
  }

  if (roots.length === 0) return null;

  return (
    <div className={`${THREAD_LINE_ML} relative`}>
      {/* Pequeño segmento superior para conectar con el primer root, compensando el pt-2 (8px) */}
      <div
        className={`absolute left-0 top-0 h-2 border-l-2 pointer-events-none transition-colors ${lineColor(hoveredId !== null)}`}
      />
      <div className='flex flex-col gap-1 pl-[29px] pt-2'>
        {roots.map((root, index) => (
          <CommentItem
            key={root.id}
            subjectId={subjectId}
            postId={postId}
            comment={root}
            tree={tree}
            onSubmitted={refresh}
            hoveredId={hoveredId}
            ancestorIds={ancestorIds}
            onHover={onHover}
            isLast={index === roots.length - 1}
            isDownwardLineActive={activeRootIndex > index}
          />
        ))}
      </div>
    </div>
  );
}
