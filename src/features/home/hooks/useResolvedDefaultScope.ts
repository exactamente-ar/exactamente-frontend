import { useEffect, useState } from 'react';
import { getUniversities, getFaculties, getCareers } from '@/shared/services/api';
import { DEFAULT_FACULTY_SHORT, DEFAULT_UNIVERSITY_SHORT, DEFAULT_CAREER_SHORT } from '@/features/home/constants/filter';
import type { ResolvedDefaultScope } from '@/features/home/types/filter';

const matchShort = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

const CACHE_KEY = 'exactamente:defaultScope:v2';
const CACHE_TTL = 24 * 60 * 60 * 1000;

function readCache(): ResolvedDefaultScope | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResolvedDefaultScope & { savedAt: number };
    if (Date.now() - parsed.savedAt > CACHE_TTL) return null;
    if (!parsed.universityId || !parsed.facultyId || !parsed.careerId) return null;
    return { universityId: parsed.universityId, facultyId: parsed.facultyId, careerId: parsed.careerId };
  } catch {
    return null;
  }
}

function writeCache(scope: ResolvedDefaultScope) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...scope, savedAt: Date.now() })
    );
  } catch {}
}

export function useResolvedDefaultScope() {
  const [defaultScope, setDefaultScope] = useState<ResolvedDefaultScope | null>(null);
  const [scopeError, setScopeError] = useState<string | null>(null);
  const [scopeReady, setScopeReady] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const cached = readCache();
    if (cached) {
      setDefaultScope(cached);
      setScopeReady(true);
    }

    (async () => {
      const uniRes = await getUniversities();
      if (cancelled) return;
      if (uniRes.error) {
        if (!cached) { setScopeError(uniRes.error); setScopeReady(true); }
        return;
      }
      const university = uniRes.data.find((u) => matchShort(u.shortName, DEFAULT_UNIVERSITY_SHORT));
      if (!university) {
        if (!cached) { setScopeError('No se encontró la universidad UNICEN en la API.'); setScopeReady(true); }
        return;
      }
      const facRes = await getFaculties({ universityId: university.id });
      if (cancelled) return;
      if (facRes.error) {
        if (!cached) { setScopeError(facRes.error); setScopeReady(true); }
        return;
      }
      const faculty = facRes.data.find((f) => matchShort(f.shortName, DEFAULT_FACULTY_SHORT));
      if (!faculty) {
        if (!cached) { setScopeError('No se encontró la facultad EXACTAS en la API.'); setScopeReady(true); }
        return;
      }
      const carRes = await getCareers({ facultyId: faculty.id });
      if (cancelled) return;
      if (carRes.error) {
        if (!cached) { setScopeError(carRes.error); setScopeReady(true); }
        return;
      }
      const career = carRes.data.find((c) => matchShort(c.shortName, DEFAULT_CAREER_SHORT));
      if (!career) {
        if (!cached) { setScopeError(`No se encontró la carrera ${DEFAULT_CAREER_SHORT} en la API.`); setScopeReady(true); }
        return;
      }
      const scope: ResolvedDefaultScope = { universityId: university.id, facultyId: faculty.id, careerId: career.id };
      writeCache(scope);
      if (
        !cached ||
        cached.universityId !== scope.universityId ||
        cached.facultyId !== scope.facultyId ||
        cached.careerId !== scope.careerId
      ) {
        setDefaultScope(scope);
      }
      setScopeError(null);
      setScopeReady(true);
    })();

    return () => { cancelled = true; };
  }, []);

  return { defaultScope, scopeError, scopeReady };
}
