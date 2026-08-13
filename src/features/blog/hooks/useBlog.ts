import { useEffect, useState } from 'react';
import { getBlog } from '@/shared/services/api';
import type { Blog } from '../types/blog';

export function useBlog(subjectId: string): { blog: Blog | null; loading: boolean } {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBlog(subjectId).then((result) => {
      if (cancelled) return;
      setBlog(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  return { blog, loading };
}
