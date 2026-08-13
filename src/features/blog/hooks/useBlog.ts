import { useCallback, useEffect, useState } from 'react';
import { getBlog } from '@/shared/services/api';
import type { Blog } from '../types/blog';

const MIN_LOADING_MS = 400;

export function useBlog(
  subjectId: string,
  token: string | null,
  authLoading: boolean,
): { blog: Blog | null; loading: boolean; refresh: () => Promise<void> } {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = useCallback(async () => {
    const result = await getBlog(subjectId, token);
    setBlog(result);
  }, [subjectId, token]);

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
        setBlog(result);
        setLoading(false);
      }, remaining);
    });

    return () => {
      cancelled = true;
    };
  }, [subjectId, token, authLoading]);

  return { blog, loading, refresh: fetchBlog };
}
