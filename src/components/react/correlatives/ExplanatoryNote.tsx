import type { Subject } from '@/types/subjects';

interface Props {
  subjectCurrent: Subject | undefined;
}

export default function ExplanatoryNote({ subjectCurrent }: Props) {
  return (
    <div className='mt-12 p-6 bg-blue-900/20 border border-blue-500/30 rounded-2xl'>
      <p className='text-blue-200 text-sm leading-relaxed'>
        <span className='font-semibold text-blue-100'>Nota:</span> Hace click en cualquier materia
        para ver sus correlativas. Las materias marcadas en
        <span className='text-orange-300 font-medium'> naranja</span> son requisitos para cursar la
        materia seleccionada (
        <span className='text-yellow-400 font-semibold'>{subjectCurrent?.title}</span>), mientras
        que las marcadas en <span className='text-red-300 font-medium'> rojo </span>
        requieren tener aprobada la materia seleccionada para ser cursadas.
      </p>
    </div>
  );
}
