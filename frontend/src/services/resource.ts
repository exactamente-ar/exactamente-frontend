import type { ResourceFetch, StringResource } from '@/types/resource';
import { fetchSheet } from '@/utils/fetchSheet';

const RESOURCE_URL = 'https://api.sheetbest.com/sheets/d5c1863f-2069-485c-8254-3883cadbaf3e/tabs';

export async function getAllResources(type: StringResource) {
  const url = `${RESOURCE_URL}/${type}`;
  return fetchSheet(url);
}

export async function getByIdResources(id: string, type: StringResource) {
  const url = `${RESOURCE_URL}/${type}/idMateria/${id}`;
  return fetchSheet<ResourceFetch>(url);
}
