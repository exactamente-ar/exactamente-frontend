import { useCorrelatives } from '@/hooks/useCorrelatives';
import { INITIAL_SELECTED_SUBJECT } from '@/constants/correlatives';
import ListOfYears from './ListOfYears';
import HeaderCorrelative from './HeaderCorrelatives';
import ExplanatoryNote from './ExplanatoryNote';
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
  } = useCorrelatives(INITIAL_SELECTED_SUBJECT);

  const handleMateriaClick = (materiaId: string) => {
    if (clickeable) {
      setSelectedMateriaId(materiaId);
    }
  };

  return (
    <div className=' text-white'>
      <span id='correlatives' className='absolute -top-20'></span>

      <div className='max-w-7xl mx-auto'>
        <div className='rounded-xl mt-10 lg:mt-20'>
          <HeaderCorrelative subjectCurrent={subjectCurrent} title={title} />

          <ListOfYears
            PLAN_ESTUDIOS_MAPEADO={PLAN_ESTUDIOS_MAPEADO}
            clickeable={clickeable}
            getStyleSubject={getStyleSubject}
            handleSubjectClick={handleMateriaClick}
          />

          <InfoSubjectSelect correlatives={correlatives} subjectCurrent={subjectCurrent} />

          <ExplanatoryNote subjectCurrent={subjectCurrent} />
        </div>
      </div>
    </div>
  );
};

export default CorrelativesComponent;
