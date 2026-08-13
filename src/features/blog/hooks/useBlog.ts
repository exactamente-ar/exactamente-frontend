import { useEffect, useState } from 'react';
import { getBlog } from '@/shared/services/api';
import type { Blog } from '../types/blog';

const MIN_LOADING_MS = 400;

export function useBlog(subjectId: string): { blog: Blog | null; loading: boolean } {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const startedAt = Date.now();

    getBlog(subjectId).then((result) => {
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
  }, [subjectId]);

  return { blog, loading };
}
