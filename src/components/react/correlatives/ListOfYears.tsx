import { AÑOS_CARRERA } from '@/constants/correlatives';
import ListOfQuadmesters from './ListOfQuadmesters';
import type { PlanEstudiosMapeado } from '@/types/correlative';

interface Props {
  clickeable: boolean;
  handleSubjectClick: (id: string) => void;
  getStyleSubject: (type: string) => void;
  PLAN_ESTUDIOS_MAPEADO: PlanEstudiosMapeado;
}

export default function ListOfYears({
  PLAN_ESTUDIOS_MAPEADO,
  clickeable,
  handleSubjectClick,
  getStyleSubject,
}: Props) {
  return (
    <div className='space-y-12'>
      {Array.from({ length: AÑOS_CARRERA }, (_, añoIndex) => {
        const año = añoIndex + 1;
        return (
          <div key={año} className='space-y-6'>
            <div className='flex items-center gap-3'>
              <div className='bg-gradient-to-r from-primary to-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-lg shadow-lg'>
                {año}° Año
              </div>
              <div className='h-px bg-gradient-to-r from-yellow-500/50 to-transparent flex-1' />
            </div>
            <ListOfQuadmesters
              PLAN_ESTUDIOS_MAPEADO={PLAN_ESTUDIOS_MAPEADO}
              año={año}
              clickeable={clickeable}
              getStyleSubject={getStyleSubject}
              handleSubjectClick={handleSubjectClick}
              key={año}
            />
          </div>
        );
      })}
    </div>
  );
}
