import type { Subject } from "./subjects";

export type FilterT = {
  search: string;
  year: number;
  quadmester: number;
  carrer: string;
};

export interface PropsFilterBar {
  setFilters: React.Dispatch<React.SetStateAction<FilterT>>;
  filters: FilterT;
}

export type PropsListOfSubjects = {
  subjects: Subject[];
  setFilters: React.Dispatch<React.SetStateAction<FilterT>>;
  loading: boolean;
  hasMore: boolean;
  showMore: () => void;
};
