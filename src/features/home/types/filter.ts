import type { Career } from '@/shared/services/api';
import type { Subject } from "./subjects";

export type FilterT = {
  search: string;
  year: number;
  quadmester: number;
  careerId: string;
};

export interface PropsFilterBar {
  setFilters: React.Dispatch<React.SetStateAction<FilterT>>;
  filters: FilterT;
  careers: Career[];
}

export type PropsListOfSubjects = {
  subjects: Subject[];
  setFilters: React.Dispatch<React.SetStateAction<FilterT>>;
  loading: boolean;
  hasMore: boolean;
  showMore: () => void;
};
