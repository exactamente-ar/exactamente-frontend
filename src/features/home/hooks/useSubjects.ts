import { useEffect, useMemo, useState } from 'react';
import { getSubjects } from '@/shared/services/api';
import type { Subject } from '@/features/home/types/subjects';
import type { AppliedFilters, FilterOption } from '@/features/home/types/filter';

const PAGE_SIZE = 9;

export const useSubjects = (appliedFilters: AppliedFilters) => {
  const [fetchedSubjects, setFetchedSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  // Fetch from API whenever any backend-supported filter changes.
  // Debounced 300ms so fast search keystrokes don't flood the API.
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (appliedFilters.careerId) params.careerId = appliedFilters.careerId;
    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.year !== 0) params.year = String(appliedFilters.year);
    if (appliedFilters.quadmester !== 0) params.quadmester = String(appliedFilters.quadmester);

    const timer = setTimeout(() => {
      getSubjects(Object.keys(params).length ? params : undefined).then((result) => {
        setFetchedSubjects(result.error ? [] : result.data);
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [appliedFilters.careerId, appliedFilters.search, appliedFilters.year, appliedFilters.quadmester]);

  // Client-side filter: planId only (backend does not support it).
  useEffect(() => {
    const result = fetchedSubjects
      .filter((s) =>
        !appliedFilters.planId
          ? true
          : s.careers.some(
              (c) => c.careerId === appliedFilters.careerId && c.planId === appliedFilters.planId
            )
      )
      .sort((a, b) => a.title.localeCompare(b.title));

    setFilteredSubjects(result);
    setVisibleCount(PAGE_SIZE);
  }, [appliedFilters.planId, appliedFilters.careerId, fetchedSubjects]);

  const planOptions = useMemo((): FilterOption[] => {
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

  const visibleSubjects = filteredSubjects.slice(0, visibleCount);
  const showMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);
  const hasMore = visibleCount < filteredSubjects.length;

  return {
    filteredSubjects: visibleSubjects,
    loading,
    showMore,
    hasMore,
    planOptions,
  };
};
