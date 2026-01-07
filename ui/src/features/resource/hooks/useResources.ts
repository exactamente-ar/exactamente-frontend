import { useEffect, useState } from 'react';
import { resourceService } from '@/features/resource/services/resource-service-factory';
import { ResourceType } from '../../../../../domain/resource/resource.types';
import type { ResourceDTO } from '../../../../../aplication/resource/resource.dto';

// Map UI string types to Domain enum
const mapStringResourceToType = (type: ResourceType): ResourceType => {
  const mapping: Record<ResourceType, ResourceType> = {
    'Parciales': ResourceType.Parciales,
    'Resumenes': ResourceType.Resumenes,
    'Finales': ResourceType.Finales,
  };
  return mapping[type];
};

export const useResources = (id: string, type: ResourceType) => {
  const [data, setData] = useState<ResourceDTO[] | null>(null);
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
        // Use Clean Architecture: UI → Service → Use Case → Repository → API
        const resources = await resourceService.listResources({
          subjectId: id,
          type: mapStringResourceToType(type),
        });

        // Sort by year (descending)
        const sortedResources = [...resources].sort((a, b) => {
          const yearA = parseInt(a.title.split(' ')[1], 10);
          const yearB = parseInt(b.title.split(' ')[1], 10);
          return yearB - yearA;
        });

        setData(sortedResources);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type]);

  return { data, error, loading };
};
