import type { Subject } from '@/features/home/types/subjects';
import type { StringResource } from '@/features/resource/types/resource';

// Backend types
type BackendSubject = {
  id: string;
  facultyId: string;
  title: string;
  slug: string;
  description: string;
  urlMoodle: string;
  urlPrograma: string;
  year: number;
  quadmester: number;
  careers: Array<{ careerId: string; year: number; quadmester: number }>;
  prerequisites: string[];
  correlatives: string[];
};

type BackendResource = {
  id: string;
  subjectId: string;
  title: string;
  type: 'resumen' | 'parcial' | 'final';
  status: 'published';
  driveFileId: string;
  driveSize: number;
  downloadCount: number;
  publishedAt: string;
  createdAt: string;
  previewUrl: string;
  downloadUrl: string;
};

type BackendPaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};

// Mapped resource type (forward-compatible with Task 2 ResourceFetch update)
export type MappedResource = {
  id: string;
  title: string;
  previewUrl: string;
  downloadUrl: string;
};

type ApiSuccess<T> = { data: T; error: null };
type ApiError = { data: []; error: string };
type ApiResult<T> = ApiSuccess<T> | ApiError;

const BASE_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';

const RESOURCE_TYPE_MAP: Record<StringResource, BackendResource['type']> = {
  Resumenes: 'resumen',
  Parciales: 'parcial',
  Finales: 'final',
};

function mapSubject(backend: BackendSubject): Subject {
  return {
    id: backend.id,
    title: backend.title,
    description: backend.description,
    url: '/' + backend.slug,
    urlMoodle: backend.urlMoodle,
    urlPrograma: backend.urlPrograma,
    year: backend.year,
    quadmester: backend.quadmester,
    required: backend.prerequisites,
    correlatives: backend.correlatives,
  };
}

function mapResource(backend: BackendResource): MappedResource {
  return {
    id: backend.id,
    title: backend.title,
    previewUrl: backend.previewUrl,
    downloadUrl: backend.downloadUrl,
  };
}

export async function getSubjects(params?: Record<string, string>): Promise<ApiResult<Subject[]>> {
  try {
    const url = new URL(`${BASE_URL}/api/v1/subjects`);
    url.searchParams.set('limit', '100');
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      return { data: [], error: `Request failed with status ${response.status}` };
    }

    const json: BackendPaginatedResponse<BackendSubject> = await response.json();
    return { data: json.data.map(mapSubject), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching subjects';
    return { data: [], error: message };
  }
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const result = await getSubjects();
  if (result.error) return null;
  return result.data.find((s) => s.url === '/' + slug) ?? null;
}

export async function getResources(
  subjectId: string,
  type: StringResource
): Promise<ApiResult<MappedResource[]>> {
  try {
    const url = new URL(`${BASE_URL}/api/v1/resources`);
    url.searchParams.set('subjectId', subjectId);
    url.searchParams.set('type', RESOURCE_TYPE_MAP[type]);

    const response = await fetch(url.toString());
    if (!response.ok) {
      return { data: [], error: `Request failed with status ${response.status}` };
    }

    const json: BackendPaginatedResponse<BackendResource> = await response.json();
    return { data: json.data.map(mapResource), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching resources';
    return { data: [], error: message };
  }
}
