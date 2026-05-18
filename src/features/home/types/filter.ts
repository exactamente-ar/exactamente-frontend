import type { Subject } from './subjects';

/** Default UNICEN + EXACTAS scope once resolved from the API. */
export type ResolvedDefaultScope = {
  universityId: string;
  facultyId: string;
};

export type DraftFilters = {
  universityId: string;
  facultyId: string;
  careerId: string;
  planId: string;
  year: number;
  quadmester: number;
};

export type AppliedFilters = DraftFilters & {
  search: string;
};

export type FilterOption = { id: string; label: string };

export type FilterOptions = {
  universities: FilterOption[];
  faculties: FilterOption[];
  careers: FilterOption[];
  plans: FilterOption[];
  loadingUniversities: boolean;
  loadingFaculties: boolean;
  loadingCareers: boolean;
  loadingPlans: boolean;
};

export type PropsFilterBar = {
  applied: AppliedFilters;
  commitFilter: <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => void;
  setSearch: (search: string) => void;
  clearAll: () => void;
  options: FilterOptions;
  scopeError: string | null;
  scopeReady: boolean;
};

export type PropsListOfSubjects = {
  subjects: Subject[];
  onClearAll: () => void;
  loading: boolean;
  hasMore: boolean;
  showMore: () => void;
  activeCareerId: string;
};
