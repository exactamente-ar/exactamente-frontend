import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSubjects } from '@/shared/services/api';
import type { Subject } from '@/features/home/types/subjects';
import type { AppliedFilters, FilterOption } from '@/features/home/types/filter';

const PAGE_SIZE = 9;

export const useSubjects = (appliedFilters: AppliedFilters, scopeReady: boolean) => {
  const [fetchedSubjects, setFetchedSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  // Fetch from API whenever backend-supported filters change.
  useEffect(() => {
    if (!scopeReady) {
      setLoading(true);
      return;
    }
    setLoading(true);
    const params: Record<string, string> = {};
    if (appliedFilters.facultyId) params.facultyId = appliedFilters.facultyId;
    if (appliedFilters.careerId) params.careerId = appliedFilters.careerId;
    if (appliedFilters.year !== 0) params.year = String(appliedFilters.year);
    if (appliedFilters.quadmester !== 0) params.quadmester = String(appliedFilters.quadmester);
    const q = appliedFilters.search?.trim();
    if (q) params.search = q;

    let cancelled = false;
    getSubjects(Object.keys(params).length ? params : undefined).then((result) => {
      if (cancelled) return;
      setFetchedSubjects(result.error ? [] : result.data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    appliedFilters.facultyId,
    appliedFilters.careerId,
    appliedFilters.year,
    appliedFilters.quadmester,
    appliedFilters.search,
    scopeReady,
  ]);

  // Client-side: planId only + sort (backend does not filter by plan).
  useEffect(() => {
    const result = fetchedSubjects
      .filter((s) => {
        if (
          appliedFilters.planId &&
          !s.careers.some(
            (c) => c.careerId === appliedFilters.careerId && c.planId === appliedFilters.planId
          )
        )
          return false;
        return true;
      })
      .sort((a, b) => a.title.localeCompare(b.title));

    setFilteredSubjects(result);
    setVisibleCount(PAGE_SIZE);
  }, [appliedFilters.planId, appliedFilters.careerId, fetchedSubjects]);

  const visibleSubjects = useMemo(
    () => filteredSubjects.slice(0, visibleCount),
    [filteredSubjects, visibleCount]
  );
  const showMore = useCallback(() => setVisibleCount((prev) => prev + PAGE_SIZE), []);
  const hasMore = visibleCount < filteredSubjects.length;

  const planOptions = useMemo<FilterOption[]>(() => {
    if (!appliedFilters.careerId) return [];
    const planSet = new Set<string>();
    fetchedSubjects.forEach((s) => {
      s.careers.forEach((c) => {
        if (c.careerId === appliedFilters.careerId) planSet.add(c.planId);
      });
    });
    return Array.from(planSet)
      .sort()
      .map((planId) => {
        const year = planId.match(/\d+$/)?.[0];
        return { id: planId, label: year ? `Plan ${year}` : planId };
      });
  }, [fetchedSubjects, appliedFilters.careerId]);

  return {
    filteredSubjects: visibleSubjects,
    loading,
    showMore,
    hasMore,
    planOptions,
  };
};
