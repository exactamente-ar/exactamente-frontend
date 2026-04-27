import type { TIPOS_MATERIA } from '@/features/home/constants/correlatives';

export type SubjectCareer = {
  careerId: string;
  planId: string;
  year: number;
  quadmester: number;
};

export type Subject = {
  id: string;
  title: string;
  description: string;
  url: string;
  urlMoodle: string;
  urlPrograma: string;
  correlatives: string[];
  required: string[];
  quadmester: number;
  year: number;
  careers: SubjectCareer[];
};

export type TipoMateria = (typeof TIPOS_MATERIA)[keyof typeof TIPOS_MATERIA];
