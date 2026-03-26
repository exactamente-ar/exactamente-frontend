import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import { fetchSheet } from '@/features/resource/utils/fetchSheet';

const RESOURCE_URL = 'https://api.sheetbest.com/sheets/a94d19d0-0262-42e0-a431-1157a9352575/tabs';

export async function getAllResources(type: StringResource) {
  const url = `${RESOURCE_URL}/${type}`;
  return fetchSheet(url);
}

export async function getByIdResources(id: string, type: StringResource) {
  const url = `${RESOURCE_URL}/${type}/idMateria/${id}`;
  return fetchSheet<ResourceFetch>(url);
}
