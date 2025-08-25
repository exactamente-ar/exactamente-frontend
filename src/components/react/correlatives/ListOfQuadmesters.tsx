import { ListOfSubjects } from './ListOfSubjects';
import { CUATRIMESTRES_POR_AÑO } from '@/constants/correlatives';
import type { PlanEstudiosMapeado } from '@/types/correlative';

interface Props {
  clickeable: boolean;
  handleSubjectClick: (id: string) => void;
  getStyleSubject: (type: string) => void;
  PLAN_ESTUDIOS_MAPEADO: PlanEstudiosMapeado;
  año: number;
}

export default function ListOfQuadmesters({
  clickeable,
  getStyleSubject,
  handleSubjectClick,
  PLAN_ESTUDIOS_MAPEADO,
  año,
}: Props) {
  return (
    <div className='space-y-8'>
      {Array.from({ length: CUATRIMESTRES_POR_AÑO }, (_, cuatrimestreIndex) => {
        const cuatrimestre = cuatrimestreIndex + 1;
        const subjects = PLAN_ESTUDIOS_MAPEADO[año]?.[cuatrimestre] || [];

        return (
          <div key={cuatrimestre} className='space-y-4'>
            <h4 className='text-gray-400 font-semibold text-lg'>{cuatrimestre}° Cuatrimestre</h4>

            <ListOfSubjects
              clickeable={clickeable}
              getStyleSubject={getStyleSubject}
              handleSubjectClick={handleSubjectClick}
              subjects={subjects}
              key={cuatrimestre + cuatrimestreIndex}
            />
          </div>
        );
      })}
    </div>
  );
}
