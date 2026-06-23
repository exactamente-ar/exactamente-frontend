import HeaderResources from '@/features/resource/components/HeaderResources';
import { useResources } from '@/features/resource/hooks/useResources';
import type { StringResource } from '@/features/resource/types/resource';
import ListOfResources from './ListOfResources';
import GroupedResourcesView from './GroupedResourcesView';
import type { Subject } from '@/features/home/types/subjects';

interface Props {
  subject: Subject;
  type: StringResource;
}

function ResourcesView({ subject, type }: Props) {
  const { data, loading, error } = useResources(subject.id, type);
  const careerName = subject.careers[0]?.careerName ?? '';

  // If subject belongs to a group, show grouped view
  if (subject.group) {
    return (
      <>
        <HeaderResources
          loading={loading}
          subject={subject.group.name}
          career={careerName}
          cantResource={data ? data.length : 0}
          title={type}
          urlImg="/images/materia-2.webp"
        />
        <GroupedResourcesView
          resources={data}
          type={type}
          group={subject.group}
          error={error}
          loading={loading}
        />
      </>
    );
  }

  // Original flat view
  return (
    <>
      <HeaderResources
        loading={loading}
        subject={subject.title}
        career={careerName}
        cantResource={data ? data.length : 0}
        title={type}
        urlImg="/images/materia-2.webp"
      />
      <ListOfResources error={error} loading={loading} resources={data} type={type} />
    </>
  );
}

export default ResourcesView;
