import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import { fetchSheet } from '@/features/resource/utils/fetchSheet';

const RESOURCE_URL = 'https://api.sheetbest.com/sheets/13b4f0d7-e711-4897-afc0-e8bb6fff8759/tabs';

export async function getAllResources(type: StringResource) {
  const url = `${RESOURCE_URL}/${type}`;
  return fetchSheet(url);
}

export async function getByIdResources(id: string, type: StringResource) {
  const url = `${RESOURCE_URL}/${type}/idMateria/${id}`;
  return fetchSheet<ResourceFetch>(url);
}
