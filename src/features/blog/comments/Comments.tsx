import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { voteComment, deleteComment } from '@/shared/services/api';
import { useReplyContext } from '../context/ReplyContext';
import { THREAD_LINE_ML, getLineColor, getLineStyle } from '../constants/comments';
import { formatDateTime } from '../utils/format';
import VoteControl from '../shared/VoteControl';
import ImageGallery from '../shared/ImageGallery';
import type { BlogComment } from '../types/blog';

import CommentLines from './CommentLines';

interface Props {
  subjectId: string;
  postId: string;
  comments: BlogComment[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onDeleted?: (commentId: string) => void;
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

interface ItemProps {
  subjectId: string;
  postId: string;
  comment: BlogComment;
  tree: CommentTree;
  onSubmitted: (commentId: string) => void;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  isLast: boolean;
  activePath: Set<string>;
  isDownwardLineActive: boolean;
}

function CommentItem({
  subjectId,
  postId,
  comment,
  tree,
  onSubmitted,
  hoveredId,
  onHover,
  isLast,
  activePath,
  isDownwardLineActive,
}: ItemProps) {
  const { token } = useAuth();
  const { setReplyTarget } = useReplyContext();
  const [netScore, setNetScore] = useState(comment.netScore);
  const [myVote, setMyVote] = useState(comment.myVote);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const children = tree.get(comment.id) ?? [];
  const hasChildren = children.length > 0;

  const votable = !!token && !comment.mine && comment.status !== 'deleted';

  const descendantsCount = useMemo(() => {
    function countDescendants(cId: string): number {
      const childs = tree.get(cId) ?? [];
      let count = childs.length;
      for (const child of childs) {
        count += countDescendants(child.id);
      }
      return count;
    }
    return countDescendants(comment.id);
  }, [comment.id, tree]);

  async function vote(value: 1 | -1) {
    if (!votable) return;
    const result = await voteComment(subjectId, postId, comment.id, value, token);
    if (result.error !== null) return;
    setNetScore(result.data.netScore);
    setMyVote(result.data.myVote);
  }

  async function remove() {
    if (!token) return;
    const result = await deleteComment(subjectId, postId, comment.id, token);
    if (result.error !== null) return;
    onSubmitted(comment.id);
  }

  const isThreadActive = activePath.has(comment.id);
  const activeChildIndex = children.findIndex((c) => activePath.has(c.id));
  const isInnerLineActive = activeChildIndex !== -1;

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
        isActive={isThreadActive}
        isDownwardLineActive={isDownwardLineActive}
        isLast={isLast}
        isRoot={!comment.parentId}
        onClick={(e) => {
          e.stopPropagation();
          setIsCollapsed((prev) => !prev);
        }}
      />

      <div className='flex gap-3 relative z-10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400'>
        <div className='flex w-7 shrink-0 flex-col items-center pt-1'>
          <VoteControl netScore={netScore} myVote={myVote} canVote={votable} onVote={vote} />
          {hasChildren && !isCollapsed && (
            <div
              className={`mt-2 self-start ${THREAD_LINE_ML} flex-1 border-l-[1.5px] ${getLineColor(isInnerLineActive)} transition-all relative after:content-[''] after:absolute after:-left-[15px] after:-right-[15px] after:-top-[5px] after:-bottom-[5px] cursor-pointer`}
              style={getLineStyle(isInnerLineActive)}
              role='button'
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCollapsed((prev) => !prev);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed((prev) => !prev);
              }}
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
          {comment.images && <ImageGallery images={comment.images} />}
          <div className='flex items-center gap-3 text-xs text-zinc-500 mt-1'>
            {token && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setReplyTarget({ postId, parentId: comment.id, snippet: comment.body });
                }}
                className='font-semibold text-zinc-400 hover:text-zinc-200'
              >
                Responder
              </button>
            )}
            {comment.mine && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  remove();
                }}
                className='text-red-400/80 hover:text-red-300'
              >
                Borrar
              </button>
            )}
            {hasChildren && !isCollapsed && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(true);
                }}
                className='ml-auto font-semibold text-zinc-400 hover:text-zinc-200'
              >
                Ocultar comentarios
              </button>
            )}
          </div>
        </div>
      </div>

      {hasChildren && !isCollapsed && (
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
                onHover={onHover}
                isLast={index === children.length - 1}
                activePath={activePath}
                isDownwardLineActive={activeChildIndex > index}
              />
            ))}
          </div>
        </div>
      )}

      {isCollapsed && descendantsCount > 0 && (
        <div className={`${THREAD_LINE_ML}`}>
          <div className='flex flex-col pl-[29px] pt-1 pb-2'>
            <button
              type='button'
              className='text-xs font-semibold text-zinc-500 hover:text-zinc-300 text-left transition-colors self-start'
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(false);
              }}
            >
              +{descendantsCount} comentario{descendantsCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Comments({
  subjectId,
  postId,
  comments,
  hoveredId,
  onHover,
  onDeleted,
}: Props) {
  const tree = useMemo(() => buildTree(comments), [comments]);
  const roots = tree.get(null) ?? [];

  const activePath = useMemo(() => {
    const set = new Set<string>();
    if (!hoveredId) return set;
    const parentMap = new Map<string, string | null>();
    for (const comment of comments) {
      parentMap.set(comment.id, comment.parentId);
    }
    let curr: string | null = hoveredId;
    while (curr) {
      set.add(curr);
      curr = parentMap.get(curr) ?? null;
    }
    return set;
  }, [comments, hoveredId]);

  const activeRootIndex = roots.findIndex((r) => activePath.has(r.id));

  function handleDeleted(commentId: string) {
    if (onDeleted) onDeleted(commentId);
  }

  if (roots.length === 0) return null;

  return (
    <div className={`${THREAD_LINE_ML} relative`}>
      <div
        className={`absolute left-0 top-0 h-2 border-l-[1.5px] pointer-events-none transition-all ${getLineColor(hoveredId !== null)}`}
        style={getLineStyle(hoveredId !== null)}
      />
      <div className='flex flex-col gap-1 pl-[29px] pt-2'>
        {roots.map((root, index) => (
          <CommentItem
            key={root.id}
            subjectId={subjectId}
            postId={postId}
            comment={root}
            tree={tree}
            onSubmitted={handleDeleted}
            hoveredId={hoveredId}
            onHover={onHover}
            isLast={index === roots.length - 1}
            activePath={activePath}
            isDownwardLineActive={activeRootIndex > index}
          />
        ))}
      </div>
    </div>
  );
}
