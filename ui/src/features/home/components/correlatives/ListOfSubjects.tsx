import type { StyleSubjects, SubjectMapped } from '../../types/correlative';
import CardSubjectCorrelative from './CardSubjectCorrelative';

interface Props {
  clickeable: boolean;
  handleSubjectClick: (id: string) => void;
  getStyleSubject: (type: string) => StyleSubjects;
  subjects: SubjectMapped[];
}
export function ListOfSubjects({
  subjects,
  clickeable,
  handleSubjectClick,
  getStyleSubject,
}: Props) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {subjects.map((subject) => {
        const styles = getStyleSubject(subject.type);
        return (
          <CardSubjectCorrelative
            key={subject.id}
            styles={styles}
            clickeable={clickeable}
            subject={subject}
            handleSubjectClick={handleSubjectClick}
          />
        );
      })}
    </div>
  );
}
