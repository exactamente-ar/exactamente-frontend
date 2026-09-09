import { useCallback, useEffect, useState } from 'react';
import { getBlog } from '@/shared/services/api';
import type { Blog, BlogComment, BlogPost } from '../types/blog';
import {
  insertComment,
  insertPost,
  removeComment as removeCommentFromFeed,
  removePost as removePostFromFeed,
} from '../utils/feed';

const MIN_LOADING_MS = 400;

export function useBlog(
  subjectId: string,
  token: string | null,
  authLoading: boolean,
): {
  blog: Blog | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  addPost: (post: BlogPost) => void;
  addComment: (postId: string, comment: BlogComment) => void;
  removePost: (postId: string) => void;
  removeComment: (postId: string, commentId: string) => void;
  updatePostVote: (postId: string, vote: { netScore: number; myVote: number }) => void;
  updateCommentVote: (
    postId: string,
    commentId: string,
    vote: { netScore: number; myVote: number },
  ) => void;
} {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchIndex, setFetchIndex] = useState(0);

  const retry = useCallback(() => {
    setFetchIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setLoading(true);
    const startedAt = Date.now();

    getBlog(subjectId, token).then((result) => {
      if (cancelled) return;
      const remaining = Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt));
      setTimeout(() => {
        if (cancelled) return;
        if (result.error === null) {
          setBlog(result.data);
          setError(null);
        } else {
          setBlog(null);
          setError(result.error);
        }
        setLoading(false);
      }, remaining);
    });

    return () => {
      cancelled = true;
    };
  }, [subjectId, token, authLoading, fetchIndex]);

  const addPost = useCallback((post: BlogPost) => {
    setBlog((prev) => (prev ? { ...prev, posts: insertPost(prev.posts, post) } : prev));
  }, []);

  const addComment = useCallback((postId: string, comment: BlogComment) => {
    setBlog((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts.map((p) =>
          p.id === postId ? { ...p, comments: insertComment(p.comments, comment) } : p,
        ),
      };
    });
  }, []);

  const removePost = useCallback((postId: string) => {
    setBlog((prev) => (prev ? { ...prev, posts: removePostFromFeed(prev.posts, postId) } : prev));
  }, []);

  const removeComment = useCallback((postId: string, commentId: string) => {
    setBlog((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts.map((p) =>
          p.id === postId ? { ...p, comments: removeCommentFromFeed(p.comments, commentId) } : p,
        ),
      };
    });
  }, []);

  const updatePostVote = useCallback(
    (postId: string, vote: { netScore: number; myVote: number }) => {
      setBlog((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === postId ? { ...p, netScore: vote.netScore, myVote: vote.myVote } : p,
          ),
        };
      });
    },
    [],
  );

  const updateCommentVote = useCallback(
    (postId: string, commentId: string, vote: { netScore: number; myVote: number }) => {
      setBlog((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments.map((c) =>
                    c.id === commentId ? { ...c, netScore: vote.netScore, myVote: vote.myVote } : c,
                  ),
                }
              : p,
          ),
        };
      });
    },
    [],
  );

  return {
    blog,
    loading,
    error,
    retry,
    addPost,
    addComment,
    removePost,
    removeComment,
    updatePostVote,
    updateCommentVote,
  };
}
