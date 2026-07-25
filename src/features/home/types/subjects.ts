import type { TIPOS_MATERIA } from '@/features/home/constants/correlatives';

export type SubjectCareer = {
  careerId: string;
  planId: string;
  year: number;
  quadmester: number;
  careerName: string;
  facultyName: string;
  universityName: string;
};

export type ResourceCounts = { resumen: number; parcial: number; final: number };

export type SubjectGroupMember = {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
  careerName: string | null;
  planYear: number | null;
};

export type SubjectGroup = {
  id: string;
  name: string;
  members: SubjectGroupMember[];
};

export type Subject = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  url: string;
  urlMoodle: string;
  urlPrograma: string;
  correlatives: string[];
  required: string[];
  quadmester: number;
  year: number;
  careers: SubjectCareer[];
  resourceCounts: ResourceCounts;
  group?: SubjectGroup;
};

export type TipoMateria = (typeof TIPOS_MATERIA)[keyof typeof TIPOS_MATERIA];
