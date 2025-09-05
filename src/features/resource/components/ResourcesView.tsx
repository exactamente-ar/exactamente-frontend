import HeaderResources from '@/features/resource/components/HeaderResources';
import { MATERIAS_SISTEMAS } from '@/shared/data/materias';
import { useResources } from '@/features/resource/hooks/useResources';
import type { StringResource } from '@/features/resource/types/resource';
import ListOfResources from './ListOfResources';
import type { Subject } from '@/features/home/types/subjects';

interface Props {
  subject: Subject;
  type: StringResource;
}

function ResourcesView({ subject, type }: Props) {
  const { data, loading, error } = useResources(subject.id, type);
  return (
    <>
      <HeaderResources
        loading={loading}
        subject={subject.title}
        cantResource={data ? data.length : 0}
        title={type}
        urlImg='/images/materia-2.webp'
      />
      <ListOfResources error={error} loading={loading} resources={data} type={type} />
    </>
  );
}

export default ResourcesView;
