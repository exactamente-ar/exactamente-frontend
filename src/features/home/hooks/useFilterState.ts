import { useCallback, useEffect, useRef, useState } from 'react';
import type { DraftFilters, AppliedFilters, ResolvedDefaultScope } from '@/features/home/types/filter';

const EMPTY_DRAFT: DraftFilters = {
  universityId: '',
  facultyId: '',
  careerId: '',
  planId: '',
  year: 0,
  quadmester: 0,
};

const EMPTY_APPLIED: AppliedFilters = { ...EMPTY_DRAFT, search: '' };

const CASCADE_CHILDREN: Record<keyof DraftFilters, Array<keyof DraftFilters>> = {
  universityId: ['facultyId', 'careerId', 'planId', 'year', 'quadmester'],
  facultyId: ['careerId', 'planId', 'year', 'quadmester'],
  careerId: ['planId', 'year', 'quadmester'],
  planId: [],
  year: [],
  quadmester: [],
};

function applyCascade<K extends keyof DraftFilters>(
  prev: AppliedFilters,
  key: K,
  value: DraftFilters[K]
): AppliedFilters {
  const next = { ...prev, [key]: value } as AppliedFilters;
  for (const child of CASCADE_CHILDREN[key]) {
    (next as Record<string, unknown>)[child] = EMPTY_DRAFT[child];
  }
  return next;
}

function readInitialFilters(defaultScope: ResolvedDefaultScope | null): {
  applied: AppliedFilters;
  urlHadUniversity: boolean;
} {
  if (typeof window === 'undefined') {
    if (defaultScope) {
      return {
        applied: { ...EMPTY_DRAFT, universityId: defaultScope.universityId, facultyId: defaultScope.facultyId, search: '' },
        urlHadUniversity: false,
      };
    }
    return { applied: { ...EMPTY_APPLIED }, urlHadUniversity: false };
  }

  const params = new URLSearchParams(window.location.search);
  const urlHadUniversity = Boolean(params.get('university'));
  const search = params.get('q') ?? '';

  if (urlHadUniversity) {
    const universityId = params.get('university') ?? '';
    const facultyId = universityId ? (params.get('faculty') ?? '') : '';
    const careerId = facultyId ? (params.get('career') ?? '') : '';
    const planId = careerId ? (params.get('plan') ?? '') : '';
    const rawYear = careerId ? Number(params.get('year') ?? 0) : 0;
    const year = Number.isFinite(rawYear) ? rawYear : 0;
    const rawQuadmester = careerId ? Number(params.get('quadmester') ?? 0) : 0;
    const quadmester = Number.isFinite(rawQuadmester) ? rawQuadmester : 0;
    return {
      applied: { universityId, facultyId, careerId, planId, year, quadmester, search },
      urlHadUniversity: true,
    };
  }

  if (defaultScope) {
    return {
      applied: { ...EMPTY_DRAFT, universityId: defaultScope.universityId, facultyId: defaultScope.facultyId, search },
      urlHadUniversity: false,
    };
  }

  return { applied: { ...EMPTY_APPLIED, search }, urlHadUniversity: false };
}

export const useFilterState = (defaultScope: ResolvedDefaultScope | null) => {
  const urlHadUniversityRef = useRef(false);
  const defaultScopeRef = useRef(defaultScope);
  defaultScopeRef.current = defaultScope;

  const [applied, setApplied] = useState<AppliedFilters>(() => {
    const { applied, urlHadUniversity } = readInitialFilters(defaultScope);
    urlHadUniversityRef.current = urlHadUniversity;
    return applied;
  });

  // Apply default scope when it resolves (no-cache case: scope was null on mount)
  useEffect(() => {
    if (!defaultScope || urlHadUniversityRef.current) return;
    setApplied((prev) => {
      if (prev.universityId || prev.facultyId) return prev;
      return {
        ...prev,
        universityId: defaultScope.universityId,
        facultyId: defaultScope.facultyId,
      };
    });
  }, [defaultScope?.universityId, defaultScope?.facultyId]);

  // Sync URL when applied changes (debounced so rapid search keystrokes don't spam replaceState)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (applied.search) params.set('q', applied.search);
      if (applied.universityId) params.set('university', applied.universityId);
      if (applied.facultyId) params.set('faculty', applied.facultyId);
      if (applied.careerId) params.set('career', applied.careerId);
      if (applied.planId) params.set('plan', applied.planId);
      if (applied.year) params.set('year', String(applied.year));
      if (applied.quadmester) params.set('quadmester', String(applied.quadmester));
      const qs = params.toString();
      history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
    }, 300);
    return () => clearTimeout(timer);
  }, [applied]);

  const commitFilter = useCallback(
    <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => {
      setApplied((prev) => applyCascade(prev, key, value));
    },
    []
  );

  const setSearch = useCallback((search: string) => {
    setApplied((prev) => ({ ...prev, search }));
  }, []);

  const clearAll = useCallback(() => {
    const ds = defaultScopeRef.current;
    if (ds) {
      setApplied({
        ...EMPTY_DRAFT,
        universityId: ds.universityId,
        facultyId: ds.facultyId,
        search: '',
      });
    } else {
      setApplied(EMPTY_APPLIED);
    }
  }, []);

  return {
    applied,
    commitFilter,
    setSearch,
    clearAll,
  };
};
