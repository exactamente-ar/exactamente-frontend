import type { ResourceFetch, StringResource } from '@/types/resource';
import { fetchSheet } from '@/utils/fetchSheet';

const RESOURCE_URL = 'https://api.sheetbest.com/sheets/b6a51c1f-11e7-49aa-86c0-373d41fd3fbf/tabs';

export async function getAllResources(type: StringResource) {
  const url = `${RESOURCE_URL}/${type}`;
  return fetchSheet(url);
}

export async function getByIdResources(id: string, type: StringResource) {
  const url = `${RESOURCE_URL}/${type}/idMateria/${id}`;
  return fetchSheet<ResourceFetch>(url);
}
