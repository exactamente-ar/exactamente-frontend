import { useEffect, useState } from 'react';
import FilterCombobox from '@/shared/components/FilterCombobox';
import { getCareers, getSubjects, type Career } from '@/shared/services/api';
import { readStoredFaculty } from '@/features/home/utils/storedFaculty';
import type { Subject } from '@/features/home/types/subjects';
import type { StudySubject } from '@/features/study/domain/timer';
import { FOCUS_RING, LAYER_POPOVER } from '@/features/study/constants/styles';
import { cn } from '@/shared/lib/utils';

type Props = {
  value: StudySubject | null;
  onChange: (subject: StudySubject | null) => void;
  /** Called when a career is picked, before a subject; used to remember the last career. */
  onCareerChange?: (career: { careerId: string; careerName: string }) => void;
  /** Career to preselect when there is no subject yet (FR-3). */
  preferredCareerId?: string | null;
  disabled?: boolean;
};

type Load<T> = { status: 'loading' | 'ready' | 'error'; items: T[] };

export default function SubjectPicker({
  value,
  onChange,
  onCareerChange,
  preferredCareerId = null,
  disabled = false,
}: Props) {
  const [careers, setCareers] = useState<Load<Career>>({ status: 'loading', items: [] });
  const [subjects, setSubjects] = useState<Load<Subject>>({ status: 'ready', items: [] });
  const [careerId, setCareerId] = useState(value?.careerId ?? preferredCareerId ?? '');
  const [attempt, setAttempt] = useState(0);

  // Keep the local career in sync when another tab picks a different subject.
  useEffect(() => {
    if (value?.careerId) setCareerId(value.careerId);
  }, [value?.careerId]);

  useEffect(() => {
    let cancelled = false;
    setCareers((c) => ({ ...c, status: 'loading' }));
    // Without a faculty chosen on the home page, list every career.
    const faculty = readStoredFaculty();
    getCareers(faculty ? { facultyId: faculty.facultyId } : undefined).then((result) => {
      if (cancelled) return;
      setCareers(
        result.error === null
          ? { status: 'ready', items: result.data }
          : { status: 'error', items: [] },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    if (!careerId) {
      setSubjects({ status: 'ready', items: [] });
      return;
    }
    let cancelled = false;
    setSubjects({ status: 'loading', items: [] });
    getSubjects({ careerId }).then((result) => {
      if (cancelled) return;
      setSubjects(
        result.error === null
          ? { status: 'ready', items: result.data }
          : { status: 'error', items: [] },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [careerId, attempt]);

  const careerOptions = careers.items.map((c) => ({ id: c.id, label: c.name }));
  // Until careers load, show the stored names so the panel never looks empty.
  if (value && !careerOptions.some((c) => c.id === value.careerId)) {
    careerOptions.push({ id: value.careerId, label: value.careerName });
  }
  const subjectOptions = subjects.items.map((s) => ({ id: s.id, label: s.title }));
  if (
    value &&
    value.careerId === careerId &&
    !subjectOptions.some((s) => s.id === value.subjectId)
  ) {
    subjectOptions.push({ id: value.subjectId, label: value.subjectName });
  }

  const handleCareer = (id: string) => {
    setCareerId(id);
    const label = careerOptions.find((c) => c.id === id)?.label;
    if (label) onCareerChange?.({ careerId: id, careerName: label });
    if (value && value.careerId !== id) onChange(null);
  };

  const handleSubject = (id: string) => {
    const careerName = careerOptions.find((c) => c.id === careerId)?.label;
    const subject = subjects.items.find((s) => s.id === id);
    if (!careerName || !subject) return;
    onChange({ careerId, careerName, subjectId: subject.id, subjectName: subject.title });
  };

  const careerLabel = careerOptions.find((c) => c.id === careerId)?.label;
  const subjectSelected = value?.careerId === careerId ? value : null;
  const failed = careers.status === 'error' || subjects.status === 'error';

  return (
    <div className='flex flex-col gap-2'>
      <div className='grid grid-cols-1 gap-2 min-[400px]:grid-cols-2'>
        <div className='flex min-w-0 flex-col gap-1 text-xs text-zinc-400'>
          <span aria-hidden='true'>Carrera</span>
          <FilterCombobox
            variant='form'
            options={careerOptions}
            value={careerId}
            onChange={handleCareer}
            placeholder='Elegí la carrera'
            ariaLabel={careerLabel ? `Carrera: ${careerLabel}` : 'Carrera'}
            isLoading={careers.status === 'loading'}
            disabled={disabled}
            popoverClassName={LAYER_POPOVER}
          />
        </div>
        <div className='flex min-w-0 flex-col gap-1 text-xs text-zinc-400'>
          <span aria-hidden='true'>Materia</span>
          <FilterCombobox
            variant='form'
            options={subjectOptions}
            value={subjectSelected?.subjectId ?? ''}
            onChange={handleSubject}
            placeholder='Elegí la materia'
            ariaLabel={subjectSelected ? `Materia: ${subjectSelected.subjectName}` : 'Materia'}
            isLoading={subjects.status === 'loading'}
            disabled={disabled || !careerId}
            popoverClassName={LAYER_POPOVER}
          />
        </div>
      </div>
      {failed && (
        <p role='alert' className='flex items-center gap-2 text-xs text-red-300'>
          No pudimos cargar las materias.
          <button
            type='button'
            onClick={() => setAttempt((n) => n + 1)}
            className={cn('cursor-pointer font-semibold underline underline-offset-2', FOCUS_RING)}
          >
            Reintentar
          </button>
        </p>
      )}
    </div>
  );
}
