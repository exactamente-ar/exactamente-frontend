import { MATERIAS_SISTEMAS } from '@/data/materias';
import type { Subject } from '@/types/subjects';

interface Props {
  subjectCurrent: Subject | undefined;
  correlatives: string[];
}

export default function InfoSubjectSelect({ subjectCurrent, correlatives }: Props) {
  return (
    <div className='mt-12 p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl'>
      <h3 className='text-yellow-400 font-bold text-lg mb-4'>Materia Seleccionada</h3>
      <div className='grid md:grid-cols-2 gap-6'>
        <div>
          <h4 className='text-yellow-300 font-semibold mb-2'>Información General</h4>
          <p className='text-gray-300 mb-2'>
            <strong>Nombre:</strong> {subjectCurrent?.title}
          </p>
          <p className='text-gray-300 mb-2'>
            <strong>Año:</strong> {subjectCurrent?.year}°
          </p>
          <p className='text-gray-300 mb-2'>
            <strong>Cuatrimestre:</strong> {subjectCurrent?.quadmester}°
          </p>
        </div>
        <div>
          <h4 className='text-yellow-300 font-semibold mb-2'>Correlativas</h4>
          <div className='space-y-2'>
            <div>
              <p className='text-orange-300 font-medium'>Requiere para cursar:</p>
              {subjectCurrent && subjectCurrent.required.length > 0 ? (
                <ul className='text-gray-300 text-sm ml-4'>
                  {subjectCurrent?.required.map((reqId) => {
                    const reqMateria = MATERIAS_SISTEMAS.find((m) => m.id === reqId);
                    return <li key={reqId}>• {reqMateria?.title || reqId}</li>;
                  })}
                </ul>
              ) : (
                <p className='text-gray-400 text-sm ml-4'>No requiere materias previas</p>
              )}
            </div>
            <div>
              <p className='text-red-300 font-medium'>Es correlativa de:</p>
              {correlatives.length > 0 ? (
                <ul className='text-gray-300 text-sm ml-4'>
                  {correlatives.map((corrId) => {
                    const corrMateria = MATERIAS_SISTEMAS.find((m) => m.id === corrId);
                    return <li key={corrId}>• {corrMateria?.title || corrId}</li>;
                  })}
                </ul>
              ) : (
                <p className='text-gray-400 text-sm ml-4'>No es correlativa de ninguna materia</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
