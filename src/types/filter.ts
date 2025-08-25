import type { Subject } from './subjects';

export type Filter = {
  search: string;
  year: number;
  quadmester: number;
  carrer: string;
};

export interface PropsFilterBar {
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  filters: Filter;
}

export type PropsListOfSubjects = {
  subjects: Subject[];
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  loading: boolean;
  hasMore: boolean;
  showMore: () => void;
};
