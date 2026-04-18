import { useCorrelatives } from '@/features/home/hooks/useCorrelatives';
import ListOfYears from './ListOfYears';
import HeaderCorrelative from './HeaderCorrelatives';
import InfoSubjectSelect from './InfoSubjectSelect';

interface Props {
  clickeable: boolean;
  title: string;
}

const CorrelativesComponent = ({ clickeable, title }: Props) => {
  const {
    setSelectedMateriaId,
    subjectCurrent,
    correlatives,
    PLAN_ESTUDIOS_MAPEADO,
    getStyleSubject,
    subjects,
    loading,
  } = useCorrelatives('');

  const handleMateriaClick = (materiaId: string) => {
    if (clickeable) {
      setSelectedMateriaId(materiaId);
    }
  };

  return (
    <div className=' text-white'>

      <div className='max-w-7xl mx-auto'>
        <div className='rounded-xl mt-10 lg:mt-20'>
          <HeaderCorrelative subjectCurrent={subjectCurrent} title={title} />

          {loading ? (
            <div className='flex items-center justify-center py-16 text-zinc-400'>
              Cargando plan de estudios...
            </div>
          ) : (
            <ListOfYears
              PLAN_ESTUDIOS_MAPEADO={PLAN_ESTUDIOS_MAPEADO}
              clickeable={clickeable}
              getStyleSubject={getStyleSubject}
              handleSubjectClick={handleMateriaClick}
            />
          )}

          <InfoSubjectSelect correlatives={correlatives} subjectCurrent={subjectCurrent} subjects={subjects} />

        </div>
      </div>
    </div>
  );
};

export default CorrelativesComponent;
