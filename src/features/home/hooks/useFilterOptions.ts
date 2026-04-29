import { useEffect, useState } from 'react';
import { getCareers, getFaculties, getUniversities } from '@/shared/services/api';
import type { University, Faculty, Career } from '@/shared/services/api';
import type { DraftFilters, FilterOption } from '@/features/home/types/filter';

const toOption = (item: { id: string; name: string }): FilterOption => ({
  id: item.id,
  label: item.name,
});

export const useFilterOptions = (draft: DraftFilters) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingCareers, setLoadingCareers] = useState(false);

  useEffect(() => {
    setLoadingUniversities(true);
    getUniversities().then((r) => {
      setUniversities(r.error ? [] : r.data);
      setLoadingUniversities(false);
    });
  }, []);

  useEffect(() => {
    if (!draft.universityId) {
      setFaculties([]);
      return;
    }
    setLoadingFaculties(true);
    getFaculties({ universityId: draft.universityId }).then((r) => {
      setFaculties(r.error ? [] : r.data);
      setLoadingFaculties(false);
    });
  }, [draft.universityId]);

  useEffect(() => {
    if (!draft.facultyId) {
      setCareers([]);
      return;
    }
    setLoadingCareers(true);
    getCareers({ facultyId: draft.facultyId }).then((r) => {
      setCareers(r.error ? [] : r.data);
      setLoadingCareers(false);
    });
  }, [draft.facultyId]);

  return {
    universityOptions: universities.map(toOption),
    facultyOptions: faculties.map(toOption),
    careerOptions: careers.map(toOption),
    loadingUniversities,
    loadingFaculties,
    loadingCareers,
  };
};
