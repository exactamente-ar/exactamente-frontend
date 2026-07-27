import type { Subject, TipoMateria } from './subjects';

export interface SubjectMapped extends Subject {
  type: TipoMateria;
}

export type PlanEstudiosMapeado = {
  [year: number]: {
    [quadmester: number]: SubjectMapped[];
  };
};

export interface StyleSubjects {
  bg: string;
  border: string;
  text: string;
  dot: string;
}
