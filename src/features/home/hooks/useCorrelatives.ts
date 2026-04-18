import { useState, useMemo, useEffect } from 'react';
import { getSubjects } from '@/shared/services/api';
import { TIPOS_MATERIA } from '@/features/home/constants/correlatives';
import type { Subject, TipoMateria } from '@/features/home/types/subjects';
import type { PlanEstudiosMapeado } from '../types/correlative';

export function useCorrelatives(initialSelectedId: string) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMateriaId, setSelectedMateriaId] = useState(initialSelectedId);

  useEffect(() => {
    getSubjects().then((result) => {
      if (!result.error) {
        setSubjects(result.data);
        if (initialSelectedId === '') {
          setSelectedMateriaId(result.data[0]?.id ?? '');
        }
      }
      setLoading(false);
    });
  }, []);

  const subjectCurrent = useMemo(
    () => subjects.find((m) => m.id === selectedMateriaId),
    [subjects, selectedMateriaId]
  );

  const correlatives = useMemo(() => {
    return subjects.filter((m) => m.required.includes(selectedMateriaId)).map((m) => m.id);
  }, [subjects, selectedMateriaId]);

  const PLAN_ESTUDIOS_MAPEADO: PlanEstudiosMapeado = useMemo(() => {
    const plan: PlanEstudiosMapeado = {};

    subjects.forEach((subject) => {
      const year = subject.year;
      const quad = subject.quadmester;

      if (!plan[year]) plan[year] = {};
      if (!plan[year][quad]) plan[year][quad] = [];

      let type: TipoMateria = TIPOS_MATERIA.OTRA;
      if (subject.id === selectedMateriaId) {
        type = TIPOS_MATERIA.ACTUAL;
      } else if (subjectCurrent?.correlatives.includes(subject.id)) {
        type = TIPOS_MATERIA.CORRELATIVA;
      } else if (subjectCurrent?.required.includes(subject.id)) {
        type = TIPOS_MATERIA.REQUERIDA;
      }

      plan[year][quad].push({
        ...subject,
        type,
      });
    });

    return plan;
  }, [subjects, selectedMateriaId]);

  const getStyleSubject = (tipo: string) => {
    switch (tipo) {
      case TIPOS_MATERIA.REQUERIDA:
        return {
          bg: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10',
          border: 'border-orange-500/40',
          text: 'text-orange-200',
          dot: 'bg-orange-400',
        };
      case TIPOS_MATERIA.CORRELATIVA:
        return {
          bg: 'bg-gradient-to-br from-red-500/20 to-red-600/10',
          border: 'border-red-500/40',
          text: 'text-red-200',
          dot: 'bg-red-400',
        };
      case TIPOS_MATERIA.ACTUAL:
        return {
          bg: 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/20',
          border: 'border-yellow-500/60',
          text: 'text-yellow-100',
          dot: 'bg-yellow-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 ',
          border: 'border-zinc-800/60',
          text: 'text-gray-300',
          dot: 'bg-gray-500',
        };
    }
  };

  return {
    selectedMateriaId,
    setSelectedMateriaId,
    subjects,
    subjectCurrent,
    correlatives,
    PLAN_ESTUDIOS_MAPEADO,
    getStyleSubject,
    loading,
  };
}
