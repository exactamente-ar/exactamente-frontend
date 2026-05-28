import type { Subject } from '@/features/home/types/subjects';
import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import type { PublicUser } from '@/features/auth/types/auth';

// Backend types
type BackendCareer = {
  id: string;
  facultyId: string;
  name: string;
  shortName: string;
  slug: string;
  createdAt: string;
};

type BackendUniversity = {
  id: string;
  name: string;
  shortName: string;
  createdAt: string;
};

type BackendFaculty = {
  id: string;
  universityId: string;
  name: string;
  shortName: string;
  createdAt: string;
};

export type Career = {
  id: string;
  name: string;
  shortName: string;
};

export type University = {
  id: string;
  name: string;
  shortName: string;
};

export type Faculty = {
  id: string;
  name: string;
  shortName: string;
};

export type CareerPlan = {
  id: string;
  careerId: string;
  name: string;
  year: number;
};

type BackendSubject = {
  id: string;
  facultyId: string;
  title: string;
  shortName: string;
  slug: string;
  description: string;
  urlMoodle: string;
  urlPrograma: string;
  year: number;
  quadmester: number;
  careers: Array<{ careerId: string; planId: string; year: number; quadmester: number; careerName: string; facultyName: string; universityName: string }>;
  prerequisites: string[];
  correlatives: string[];
  resourceCounts: { resumen: number; parcial: number; final: number };
};

type BackendResource = {
  id: string;
  subjectId: string;
  title: string;
  type: 'resumen' | 'parcial' | 'final';
  status: 'published' | 'pending' | 'rejected';
  downloadCount: number;
  publishedAt: string;
  createdAt: string;
  fileUrl: string;
};

export type Resource = {
  id: string;
  subjectId: string;
  title: string;
  type: 'resumen' | 'parcial' | 'final';
  status: 'pending' | 'published' | 'rejected';
  examDate: string | null;
  period: string | null;
  notes: string | null;
  downloadCount: number;
  publishedAt: string | null;
  createdAt: string;
  fileUrl: string | null;
};

type BackendPaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};


type ApiSuccess<T> = { data: T; error: null };
type ApiError = { data: []; error: string };
type ApiResult<T> = ApiSuccess<T> | ApiError;

const BASE_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Request cache ────────────────────────────────────────────────────────────
// Deduplicates concurrent requests for the same URL and caches successful
// responses for CACHE_TTL ms so rapid re-mounts don't refetch.
type CacheEntry = { promise: Promise<unknown>; resolvedAt: number };
const _cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60_000; // 60 seconds

function withCache<T>(key: string, fetcher: () => Promise<ApiResult<T>>): Promise<ApiResult<T>> {
  const now = Date.now();
  const entry = _cache.get(key);
  if (entry && (entry.resolvedAt === 0 || now - entry.resolvedAt < CACHE_TTL)) {
    return entry.promise as Promise<ApiResult<T>>;
  }
  const promise = fetcher().then((result) => {
    if (result.error) {
      _cache.delete(key); // don't persist error responses
    } else {
      const e = _cache.get(key);
      if (e) e.resolvedAt = Date.now();
    }
    return result;
  });
  _cache.set(key, { promise: promise as Promise<unknown>, resolvedAt: 0 });
  return promise;
}
// ─────────────────────────────────────────────────────────────────────────────

const RESOURCE_TYPE_MAP: Record<StringResource, BackendResource['type']> = {
  Resumenes: 'resumen',
  Parciales: 'parcial',
  Finales: 'final',
};

function mapSubject(backend: BackendSubject): Subject {
  return {
    id: backend.id,
    title: backend.title,
    shortName: backend.shortName,
    description: backend.description,
    url: '/' + backend.slug,
    urlMoodle: backend.urlMoodle,
    urlPrograma: backend.urlPrograma,
    year: backend.year,
    quadmester: backend.quadmester,
    required: backend.prerequisites,
    correlatives: backend.correlatives,
    careers: backend.careers,
    resourceCounts: backend.resourceCounts ?? { resumen: 0, parcial: 0, final: 0 },
  };
}

function mapResource(backend: BackendResource): ResourceFetch {
  return {
    id: backend.id,
    title: backend.title,
    fileUrl: backend.fileUrl,
  };
}

export function getCareers(params?: { facultyId?: string }): Promise<ApiResult<Career[]>> {
  const url = new URL(`${BASE_URL}/api/v1/careers`);
  if (params?.facultyId) url.searchParams.set('facultyId', params.facultyId);
  const key = url.toString();
  return withCache(key, async () => {
    try {
      const response = await fetch(key);
      if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
      const json: { data: BackendCareer[] } = await response.json();
      return { data: json.data.map(({ id, name, shortName }) => ({ id, name, shortName })), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error fetching careers' };
    }
  });
}

export function getUniversities(): Promise<ApiResult<University[]>> {
  const key = `${BASE_URL}/api/v1/universities`;
  return withCache(key, async () => {
    try {
      const response = await fetch(key);
      if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
      const json: { data: BackendUniversity[] } = await response.json();
      return { data: json.data.map(({ id, name, shortName }) => ({ id, name, shortName })), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error fetching universities' };
    }
  });
}

export function getFaculties(params: { universityId: string }): Promise<ApiResult<Faculty[]>> {
  const url = new URL(`${BASE_URL}/api/v1/faculties`);
  url.searchParams.set('universityId', params.universityId);
  const key = url.toString();
  return withCache(key, async () => {
    try {
      const response = await fetch(key);
      if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
      const json: { data: BackendFaculty[] } = await response.json();
      return { data: json.data.map(({ id, name, shortName }) => ({ id, name, shortName })), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error fetching faculties' };
    }
  });
}

export function getCareerPlans(careerId: string): Promise<ApiResult<CareerPlan[]>> {
  const url = new URL(`${BASE_URL}/api/v1/career-plans`);
  url.searchParams.set('careerId', careerId);
  const key = url.toString();
  return withCache(key, async () => {
    try {
      const response = await fetch(key);
      if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
      const json: { data: Array<{ id: string; careerId: string; name: string; year: number; createdAt: string }> } = await response.json();
      return { data: json.data.map(({ id, careerId, name, year }) => ({ id, careerId, name, year })), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error fetching career plans' };
    }
  });
}

export function getSubjects(params?: Record<string, string>): Promise<ApiResult<Subject[]>> {
  const url = new URL(`${BASE_URL}/api/v1/subjects`);
  url.searchParams.set('limit', '100');
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const key = url.toString();
  return withCache(key, async () => {
    try {
      const response = await fetch(key);
      if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
      const json: BackendPaginatedResponse<BackendSubject> = await response.json();
      return { data: json.data.map(mapSubject), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error fetching subjects' };
    }
  });
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  // Si el backend soporta filtro `slug`, devuelve sólo la materia buscada.
  // Si no lo soporta, ignora el param y trae el set completo: el find() local
  // sigue resolviendo el caso. Trade-off: peor cache compartido si no soporta.
  const result = await getSubjects({ slug });
  if (result.error) return null;
  return result.data.find((s) => s.url === '/' + slug) ?? null;
}

export async function getResources(
  subjectId: string,
  type: StringResource
): Promise<ApiResult<ResourceFetch[]>> {
  try {
    const url = new URL(`${BASE_URL}/api/v1/resources`);
    url.searchParams.set('subjectId', subjectId);
    url.searchParams.set('type', RESOURCE_TYPE_MAP[type]);
    url.searchParams.set('limit', '100');

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

export async function getMe(token: string): Promise<ApiResult<PublicUser>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
    const json: { user: PublicUser } = await response.json();
    return { data: json.user, error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : 'Unknown error fetching user' };
  }
}

export async function uploadResource(
  data: {
    subjectId: string;
    type: string;
    file: File;
    period?: string;
    notes?: string;
  },
  token: string
): Promise<ApiResult<Resource>> {
  try {
    const form = new FormData();
    form.append('file', data.file);
    form.append('subjectId', data.subjectId);
    form.append('type', data.type);
    if (data.period) form.append('period', data.period);
    if (data.notes) form.append('notes', data.notes);

    const response = await fetch(`${BASE_URL}/api/v1/resources`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
    const json: Resource = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : 'Unknown error uploading resource' };
  }
}
