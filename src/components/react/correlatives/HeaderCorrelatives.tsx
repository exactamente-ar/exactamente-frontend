import type { Subject } from '@/types/subjects';

interface Props {
  title: string;
  subjectCurrent: Subject | undefined;
}

export default function HeaderCorrelative({ title, subjectCurrent }: Props) {
  return (
    <div className='mb-12'>
      <h2 className='text-3xl font-bold text-white mb-4'>
        {title}
        {` (Plan 2024)`}
      </h2>
      <p className='text-gray-300 mb-8'>
        Diagrama completo de la carrera mostrando las correlativas de{' '}
        <span className='text-yellow-400 font-semibold'>{subjectCurrent?.title}</span>
      </p>

      {/* Leyenda */}
      <div className='flex flex-wrap gap-6 p-6  rounded-xl border border-primary/50 bg-gradient-to-br from-zinc-900/90 to-zinc-950/95'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/40 rounded'></div>
          <span className='text-gray-300 text-sm'>
            Requiere para cursar la materia seleccionada
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/40 rounded'></div>
          <span className='text-gray-300 text-sm'>
            La materia seleccionada es correlativa de esta
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 border border-yellow-500/60 rounded'></div>
          <span className='text-gray-300 text-sm'>Materia seleccionada</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded'></div>
          <span className='text-gray-300 text-sm'>Otras materias</span>
        </div>
      </div>
    </div>
  );
}
