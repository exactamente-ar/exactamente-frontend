import type { TIPOS_MATERIA } from '@/features/home/constants/correlatives';

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
};

export type TipoMateria = (typeof TIPOS_MATERIA)[keyof typeof TIPOS_MATERIA];
