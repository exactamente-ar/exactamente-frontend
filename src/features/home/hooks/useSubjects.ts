import { useEffect, useState } from 'react';
import { INITIAL_FILTERS } from '@/features/home/constants/filter';
import { getCareers, getSubjects } from '@/shared/services/api';
import { normalizeText } from '@/features/home/utils/normalizeText';
import type { Career } from '@/shared/services/api';
import type { Subject } from '@/features/home/types/subjects';
import type { FilterT } from '../types/filter';

const PAGE_SIZE = 9;

export const useSubjects = () => {
  const [filters, setFilters] = useState<FilterT>(INITIAL_FILTERS);
  const [careers, setCareers] = useState<Career[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCareers().then((result) => {
      if (!result.error && result.data.length > 0) {
        setCareers(result.data);
        setFilters((prev) => ({ ...prev, careerId: result.data[0].id }));
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!filters.careerId) return;
    setLoading(true);
    getSubjects({ careerId: filters.careerId }).then((result) => {
      setAllSubjects(result.error ? [] : result.data);
      setLoading(false);
    });
  }, [filters.careerId]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const result = allSubjects
        .filter((s) => normalizeText(s.title).includes(normalizeText(filters.search)))
        .filter((s) => (filters.year === 0 ? true : s.year === filters.year))
        .filter((s) => (filters.quadmester === 0 ? true : s.quadmester === filters.quadmester))
        .sort((a, b) => a.title.localeCompare(b.title));

      setFilteredSubjects(result);
      setVisibleCount(PAGE_SIZE);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search, filters.year, filters.quadmester, allSubjects]);

  const visibleSubjects = filteredSubjects.slice(0, visibleCount);

  const showMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const hasMore = visibleCount < filteredSubjects.length;

  return {
    filters,
    setFilters,
    careers,
    filteredSubjects: visibleSubjects,
    loading,
    showMore,
    hasMore,
  };
};
