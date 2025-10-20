import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import { fetchSheet } from '@/features/resource/utils/fetchSheet';

const RESOURCE_URL = 'https://api.sheetbest.com/sheets/060a9502-f4b7-41c3-83a6-f3353bdb5c8e/tabs';

export async function getAllResources(type: StringResource) {
  const url = `${RESOURCE_URL}/${type}`;
  return fetchSheet(url);
}

export async function getByIdResources(id: string, type: StringResource) {
  const url = `${RESOURCE_URL}/${type}/idMateria/${id}`;
  return fetchSheet<ResourceFetch>(url);
}
