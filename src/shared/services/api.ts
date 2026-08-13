import type { Subject } from '@/features/home/types/subjects';
import type { ResourceFetch, StringResource } from '@/features/resource/types/resource';
import type { PublicUser } from '@/features/auth/types/auth';
import type { Blog, BlogComment, BlogPost } from '@/features/blog/types/blog';

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
  careers: Array<{
    careerId: string;
    planId: string;
    year: number;
    quadmester: number;
    careerName: string;
    facultyName: string;
    universityName: string;
  }>;
  prerequisites: string[];
  correlatives: string[];
  resourceCounts: { resumen: number; parcial: number; final: number };
};

type BackendResource = {
  id: string;
  subjectId: string;
  title: string;
  type: 'resumen' | 'parcial' | 'final';
  subtype: 'parcial' | 'recuperatorio' | 'prefinal' | 'parcialito' | null;
  examYear: number | null;
  examMonth: number | null;
  topic: number | null;
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

export function withCache<T>(
  key: string,
  fetcher: () => Promise<ApiResult<T>>,
): Promise<ApiResult<T>> {
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

export const RESOURCE_TYPE_MAP: Record<StringResource, BackendResource['type']> = {
  Resumenes: 'resumen',
  Parciales: 'parcial',
  Finales: 'final',
};

export function mapSubject(backend: BackendSubject): Subject {
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

export function mapResource(backend: BackendResource): ResourceFetch {
  return {
    id: backend.id,
    title: backend.title,
    fileUrl: backend.fileUrl,
    type: backend.type,
    subtype: backend.subtype ?? null,
    examYear: backend.examYear ?? null,
    examMonth: backend.examMonth ?? null,
    topic: backend.topic ?? null,
  };
}

/**
 * La respuesta de `GET /blogs/:subjectId` ya viene con la forma que consume el
 * frontend, así que el mapeo es identidad. Se mantiene como función para no
 * exponer el tipo de backend en los componentes y por si el contrato evoluciona.
 */
export function mapBlog(backend: Blog): Blog {
  return backend;
}

/**
 * URL para **bajar** un recurso. Distinta de `fileUrl`, que es para **verlo**.
 *
 * `fileUrl` apunta directo a R2 y no pasa por la API, así que bajar desde ahí
 * no incrementa `downloadCount`. Este endpoint cuenta la descarga y después
 * redirige (302) al archivo, con el nombre del recurso en vez del uuid.
 *
 * Vive acá y no en el componente porque `BASE_URL` es privado del módulo y la
 * regla del repo es que ninguna URL de la API se arme afuera de este archivo.
 */
export function getResourceDownloadUrl(id: string): string {
  return `${BASE_URL}/api/v1/resources/${id}/download`;
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
      return {
        data: json.data.map(({ id, name, shortName }) => ({ id, name, shortName })),
        error: null,
      };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error fetching careers',
      };
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
      return {
        data: json.data.map(({ id, name, shortName }) => ({ id, name, shortName })),
        error: null,
      };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error fetching universities',
      };
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
      return {
        data: json.data.map(({ id, name, shortName }) => ({ id, name, shortName })),
        error: null,
      };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error fetching faculties',
      };
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
      const json: {
        data: Array<{
          id: string;
          careerId: string;
          name: string;
          year: number;
          createdAt: string;
        }>;
      } = await response.json();
      return {
        data: json.data.map(({ id, careerId, name, year }) => ({ id, careerId, name, year })),
        error: null,
      };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error fetching career plans',
      };
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
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error fetching subjects',
      };
    }
  });
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/subjects/${id}`);
    if (!response.ok) return null;
    const json: { subject: BackendSubject } = await response.json();
    return mapSubject(json.subject);
  } catch {
    return null;
  }
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  // Si el backend soporta filtro `slug`, devuelve sólo la materia buscada.
  // Si no lo soporta, ignora el param y trae el set completo: el find() local
  // sigue resolviendo el caso. Trade-off: peor cache compartido si no soporta.
  const result = await getSubjects({ slug });
  if (result.error) return null;
  return result.data.find((s) => s.url === '/' + slug) ?? null;
}

export async function getBlog(subjectId: string, token?: string | null): Promise<Blog | null> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${BASE_URL}/api/v1/blogs/${subjectId}`, { headers });
    if (!response.ok) return null;
    const json: Blog = await response.json();
    return mapBlog(json);
  } catch {
    return null;
  }
}

export async function createPost(
  subjectId: string,
  data: {
    subtopicId: string;
    body: string;
    authority: 'visible' | 'anonymous';
    images?: File[];
  },
  token: string,
): Promise<ApiResult<BlogPost>> {
  try {
    const form = new FormData();
    form.append('subtopicId', data.subtopicId);
    form.append('body', data.body);
    form.append('authority', data.authority);
    for (const image of data.images ?? []) form.append('images', image);

    const response = await fetch(`${BASE_URL}/api/v1/blogs/${subjectId}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!response.ok) {
      const json: { error?: string } = await response.json().catch(() => ({}));
      return { data: [], error: json.error ?? `Request failed with status ${response.status}` };
    }
    const json: BlogPost = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error creating post',
    };
  }
}

export type BlogVoteResult = { netScore: number; myVote: number };

async function postVote(
  url: string,
  value: 1 | -1,
  token: string,
): Promise<ApiResult<BlogVoteResult>> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ value }),
    });
    if (!response.ok) {
      const json: { error?: string } = await response.json().catch(() => ({}));
      return { data: [], error: json.error ?? `Request failed with status ${response.status}` };
    }
    const json: BlogVoteResult = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error voting',
    };
  }
}

export function votePost(
  subjectId: string,
  postId: string,
  value: 1 | -1,
  token: string,
): Promise<ApiResult<BlogVoteResult>> {
  return postVote(`${BASE_URL}/api/v1/blogs/${subjectId}/posts/${postId}/vote`, value, token);
}

export function voteComment(
  subjectId: string,
  postId: string,
  commentId: string,
  value: 1 | -1,
  token: string,
): Promise<ApiResult<BlogVoteResult>> {
  return postVote(
    `${BASE_URL}/api/v1/blogs/${subjectId}/posts/${postId}/comments/${commentId}/vote`,
    value,
    token,
  );
}

export async function createComment(
  subjectId: string,
  postId: string,
  data: {
    parentId?: string | null;
    body: string;
    authority: 'visible' | 'anonymous';
    images?: File[];
  },
  token: string,
): Promise<ApiResult<BlogComment>> {
  try {
    const form = new FormData();
    if (data.parentId) form.append('parentId', data.parentId);
    form.append('body', data.body);
    form.append('authority', data.authority);
    for (const image of data.images ?? []) form.append('images', image);

    const response = await fetch(`${BASE_URL}/api/v1/blogs/${subjectId}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!response.ok) {
      const json: { error?: string } = await response.json().catch(() => ({}));
      return { data: [], error: json.error ?? `Request failed with status ${response.status}` };
    }
    const json: BlogComment = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error creating comment',
    };
  }
}

async function deleteResource(url: string, token: string): Promise<ApiResult<null>> {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const json: { error?: string } = await response.json().catch(() => ({}));
      return { data: [], error: json.error ?? `Request failed with status ${response.status}` };
    }
    return { data: null, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error deleting',
    };
  }
}

export function deletePost(
  subjectId: string,
  postId: string,
  token: string,
): Promise<ApiResult<null>> {
  return deleteResource(`${BASE_URL}/api/v1/blogs/${subjectId}/posts/${postId}`, token);
}

export function deleteComment(
  subjectId: string,
  postId: string,
  commentId: string,
  token: string,
): Promise<ApiResult<null>> {
  return deleteResource(
    `${BASE_URL}/api/v1/blogs/${subjectId}/posts/${postId}/comments/${commentId}`,
    token,
  );
}

export async function getResources(
  subjectId: string,
  type: StringResource,
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
    title?: string;
    subtype?: string;
    examYear?: number;
    examMonth?: number;
    examDay?: number;
    topic?: number;
    notes?: string;
  },
  token: string,
): Promise<ApiResult<Resource>> {
  try {
    const form = new FormData();
    form.append('file', data.file);
    form.append('subjectId', data.subjectId);
    form.append('type', data.type);
    form.append('examYear', String(data.examYear));
    form.append('examMonth', String(data.examMonth));
    if (data.title) form.append('title', data.title);
    if (data.subtype) form.append('subtype', data.subtype);
    if (data.examDay != null) form.append('examDay', String(data.examDay));
    if (data.topic != null) form.append('topic', String(data.topic));
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
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error uploading resource',
    };
  }
}

export async function checkDuplicate(
  data: {
    subjectId: string;
    type: 'resumen' | 'parcial' | 'final';
    subtype?: string;
    examYear?: number;
    examMonth?: number;
    topic?: number;
  },
  token: string,
): Promise<
  ApiResult<{ hasSimilar: boolean; similar: Array<{ id: string; title: string; status: string }> }>
> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/resources/check-duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
    const json = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error checking duplicate',
    };
  }
}
