import type { TIPOS_MATERIA } from '@/features/home/constants/correlatives';

import type { ApiSubjectCareer, ApiResourceCounts } from '@/shared/types/contract';

/**
 * Vienen del contrato. `ApiSubjectCareer` trae además `facultyId` y
 * `universityId`, que la UI no usa pero llegan igual.
 */
export type SubjectCareer = Pick<
  ApiSubjectCareer,
  'careerId' | 'planId' | 'year' | 'quadmester' | 'careerName' | 'facultyName' | 'universityName'
>;

export type ResourceCounts = ApiResourceCounts;

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
};

export type TipoMateria = (typeof TIPOS_MATERIA)[keyof typeof TIPOS_MATERIA];
