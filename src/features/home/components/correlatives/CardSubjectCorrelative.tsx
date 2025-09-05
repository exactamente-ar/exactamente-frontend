import { TIPOS_MATERIA } from '@/features/home/constants/correlatives';
import type { StyleSubjects, SubjectMapped } from '../../types/correlative';

interface Props {
  styles: StyleSubjects;
  clickeable: boolean;
  subject: SubjectMapped;
  handleSubjectClick: (id: string) => void;
}

export default function CardSubjectCorrelative({
  styles,
  clickeable,
  subject,
  handleSubjectClick,
}: Props) {
  return (
    <div
      className={`${styles.bg} ${styles.border} ${
        clickeable
          ? 'transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer'
          : 'pointer-events-none'
      } border-2 rounded-xl p-4 `}
      onClick={() => handleSubjectClick(subject.id)}
    >
      <div className='flex items-start justify-between mb-3'>
        <h5 className={`font-semibold ${styles.text} leading-tight`}>{subject.title}</h5>
      </div>

      {/* Indicador de materia actual */}
      {subject.type == TIPOS_MATERIA.ACTUAL && (
        <div className='mt-3 flex items-center gap-2'>
          <div className='w-2 h-2 bg-yellow-400 rounded-full animate-pulse' />
          <span className='text-xs font-semibold text-yellow-200'>Materia actual</span>
        </div>
      )}
    </div>
  );
}
