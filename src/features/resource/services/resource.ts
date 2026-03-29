import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import { getResources } from '@/shared/services/api';

export async function getByIdResources(
  id: string,
  type: StringResource
): Promise<{ data: ResourceFetch[]; error: string | null }> {
  const result = await getResources(id, type);
  if (result.error) {
    return { data: [], error: result.error };
  }
  return { data: result.data, error: null };
}
