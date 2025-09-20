import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import { fetchSheet } from '@/features/resource/utils/fetchSheet';

const RESOURCE_URL = 'https://api.sheetbest.com/sheets/a5216cb3-393a-4c77-bbb9-4b86ab833a7b/tabs';

export async function getAllResources(type: StringResource) {
  const url = `${RESOURCE_URL}/${type}`;
  return fetchSheet(url);
}

export async function getByIdResources(id: string, type: StringResource) {
  const url = `${RESOURCE_URL}/${type}/idMateria/${id}`;
  return fetchSheet<ResourceFetch>(url);
}
