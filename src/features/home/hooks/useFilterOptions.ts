import { useEffect, useMemo, useState } from 'react';
import { getCareers, getFaculties, getUniversities } from '@/shared/services/api';
import type { University, Faculty, Career } from '@/shared/services/api';
import type { DraftFilters, FilterOption } from '@/features/home/types/filter';

const toOption = (item: { id: string; shortName: string }): FilterOption => ({
  id: item.id,
  label: item.shortName,
});

export const useFilterOptions = (filters: DraftFilters) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingCareers, setLoadingCareers] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingUniversities(true);
    getUniversities().then((r) => {
      if (cancelled) return;
      setUniversities(r.error ? [] : r.data);
      setLoadingUniversities(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!filters.universityId) {
      setFaculties([]);
      setLoadingFaculties(false);
      return;
    }
    let cancelled = false;
    setLoadingFaculties(true);
    getFaculties({ universityId: filters.universityId }).then((r) => {
      if (cancelled) return;
      setFaculties(r.error ? [] : r.data);
      setLoadingFaculties(false);
    });
    return () => { cancelled = true; };
  }, [filters.universityId]);

  useEffect(() => {
    if (!filters.facultyId) {
      setCareers([]);
      setLoadingCareers(false);
      return;
    }
    let cancelled = false;
    setLoadingCareers(true);
    getCareers({ facultyId: filters.facultyId }).then((r) => {
      if (cancelled) return;
      setCareers(r.error ? [] : r.data);
      setLoadingCareers(false);
    });
    return () => { cancelled = true; };
  }, [filters.facultyId]);

  const universityOptions = useMemo(() => universities.map(toOption), [universities]);
  const facultyOptions = useMemo(() => faculties.map(toOption), [faculties]);
  const careerOptions = useMemo(() => careers.map(toOption), [careers]);

  return {
    universityOptions,
    facultyOptions,
    careerOptions,
    loadingUniversities,
    loadingFaculties,
    loadingCareers,
  };
};
