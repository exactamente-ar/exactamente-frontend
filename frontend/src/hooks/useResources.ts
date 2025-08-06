import { useEffect, useState } from 'react';
import { getByIdResources } from '@/services/resource';
import type { StringResource } from '@/types/resource';

export const useResources = (id: string, type: StringResource) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) {
      setError('ID no proporcionado');
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await getByIdResources(id, type);
        const sortedResources = [...data].sort((a, b) => {
          const yearA = parseInt(a.title.split(' ')[1], 10);
          const yearB = parseInt(b.title.split(' ')[1], 10);
          return yearB - yearA; // mayor a menor
        });

        if (error) {
          setError(error);
          setData(null);
        } else {
          setData(sortedResources);
        }
      } catch (err) {
        setError(error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, error, loading };
};
