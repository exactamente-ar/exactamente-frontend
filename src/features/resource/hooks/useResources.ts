import { useEffect, useState } from 'react';
import { getByIdResources } from '@/features/resource/services/resource';
import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';

export interface InitialResources {
  /** Recursos ya obtenidos en el servidor. `null` si el pedido falló. */
  initialData?: ResourceFetch[] | null;
  /** Error del pedido en el servidor. Se reintenta en el cliente. */
  initialError?: string | null;
}

export const useResources = (
  id: string,
  type: StringResource,
  { initialData = null, initialError = null }: InitialResources = {},
) => {
  // Con datos del servidor el primer render ya muestra la lista: así llega en
  // el HTML y la hidratación no lo pisa con el esqueleto de carga.
  const hasInitialData = initialData !== null;
  const [data, setData] = useState<ResourceFetch[] | null>(initialData);
  const [error, setError] = useState<string | null>(hasInitialData ? null : initialError);
  const [loading, setLoading] = useState<boolean>(!hasInitialData);

  useEffect(() => {
    if (hasInitialData) return;

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

        if (error) {
          setError(error);
          setData(null);
        } else {
          setData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type, hasInitialData]);

  return { data, error, loading };
};
