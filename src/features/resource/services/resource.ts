import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import { fetchSheet } from '@/features/resource/utils/fetchSheet';

const RESOURCE_URL = 'https://api.sheetbest.com/sheets/186b9672-f516-4fcc-9ae6-acff56b8c61e/tabs';

export async function getAllResources(type: StringResource) {
  const url = `${RESOURCE_URL}/${type}`;
  return fetchSheet(url);
}

export async function getByIdResources(id: string, type: StringResource) {
  const url = `${RESOURCE_URL}/${type}/idMateria/${id}`;
  return fetchSheet<ResourceFetch>(url);
}
