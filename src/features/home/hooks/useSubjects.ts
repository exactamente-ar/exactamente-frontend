import { useEffect, useMemo, useState } from 'react';
import { getSubjects } from '@/shared/services/api';
import { normalizeText } from '@/features/home/utils/normalizeText';
import type { Subject } from '@/features/home/types/subjects';
import type { AppliedFilters, FilterOption } from '@/features/home/types/filter';

const PAGE_SIZE = 9;

export const useSubjects = (appliedFilters: AppliedFilters) => {
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appliedFilters.careerId) {
      setAllSubjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getSubjects({ careerId: appliedFilters.careerId }).then((result) => {
      setAllSubjects(result.error ? [] : result.data);
      setLoading(false);
    });
  }, [appliedFilters.careerId]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const result = allSubjects
        .filter((s) => normalizeText(s.title).includes(normalizeText(appliedFilters.search)))
        .filter((s) => (appliedFilters.year === 0 ? true : s.year === appliedFilters.year))
        .filter((s) => (appliedFilters.quadmester === 0 ? true : s.quadmester === appliedFilters.quadmester))
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
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    appliedFilters.search,
    appliedFilters.year,
    appliedFilters.quadmester,
    appliedFilters.planId,
    appliedFilters.careerId,
    allSubjects,
  ]);

  const planOptions = useMemo((): FilterOption[] => {
    if (!appliedFilters.careerId) return [];
    const planSet = new Set<string>();
    allSubjects.forEach((s) => {
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
  }, [allSubjects, appliedFilters.careerId]);

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
