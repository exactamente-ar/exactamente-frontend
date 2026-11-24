import HeaderResources from '@/features/resource/components/HeaderResources';
import { useResources, type InitialResources } from '@/features/resource/hooks/useResources';
import type { StringResource } from '@/features/resource/types/resource';
import ListOfResources from './ListOfResources';
import type { Subject } from '@/features/home/types/subjects';

interface Props extends InitialResources {
  subject: Subject;
  type: StringResource;
}

function ResourcesView({ subject, type, initialData, initialError }: Props) {
  const { data, loading, error } = useResources(subject.id, type, { initialData, initialError });
  return (
    <>
      <HeaderResources
        loading={loading}
        subject={subject.title}
        career={subject.careers[0]?.careerName ?? ''}
        cantResource={data ? data.length : 0}
        title={type}
        urlImg='/images/materia-2.webp'
      />
      <ListOfResources error={error} loading={loading} resources={data} type={type} />
    </>
  );
}

export default ResourcesView;
