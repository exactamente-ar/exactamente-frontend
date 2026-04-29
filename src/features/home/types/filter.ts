import type { Subject } from './subjects';

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
};

export type PropsFilterBar = {
  draft: DraftFilters;
  applied: AppliedFilters;
  setDraftFilter: <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => void;
  applyDraft: () => void;
  cancelDraft: () => void;
  setSearch: (search: string) => void;
  clearAll: () => void;
  removeFilter: (key: keyof DraftFilters) => void;
  activeCount: number;
  options: FilterOptions;
};

export type PropsListOfSubjects = {
  subjects: Subject[];
  onClearAll: () => void;
  loading: boolean;
  hasMore: boolean;
  showMore: () => void;
  careerId: string;
};
