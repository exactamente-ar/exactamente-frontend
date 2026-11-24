import type { ResourceCounts } from '@/features/home/types/subjects';

export type IndexedSubject = {
  id: string;
  title: string;
  quadmester: number;
  resourceCounts: ResourceCounts;
};

export type IndexYear = {
  year: number;
  subjects: IndexedSubject[];
};

export type IndexCareer = {
  careerId: string;
  name: string;
  years: IndexYear[];
};

export type IndexFaculty = {
  name: string;
  careers: IndexCareer[];
};

export type IndexUniversity = {
  name: string;
  faculties: IndexFaculty[];
};
