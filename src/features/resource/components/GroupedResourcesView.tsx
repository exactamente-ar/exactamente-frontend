import type { ResourceFetch } from '@/features/resource/types/resource';
import type { SubjectGroup } from '@/features/home/types/subjects';
import CardResource from './CardResource';
import CardResourceLoading from './CardResourceLoading';

interface Props {
  resources: ResourceFetch[] | null;
  type: string;
  group: SubjectGroup;
  error: string | null;
  loading: boolean;
}

const GroupedResourcesView = ({ resources, type, group, error, loading }: Props) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardResourceLoading key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center mt-6 text-center text-red-400">
        <h2 className="text-xl font-bold mb-2">Error al cargar los recursos</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!resources) return null;

  // Group resources by subjectId
  const bySubject = new Map<string, ResourceFetch[]>();
  for (const r of resources) {
    const list = bySubject.get(r.subjectId) || [];
    list.push(r);
    bySubject.set(r.subjectId, list);
  }

  // Sort each subject's resources by date
  for (const list of bySubject.values()) {
    list.sort((a, b) => {
      const yearDiff = (b.examYear ?? 0) - (a.examYear ?? 0);
      if (yearDiff !== 0) return yearDiff;
      return (b.examMonth ?? 0) - (a.examMonth ?? 0);
    });
  }

  return (
    <div className="mt-4 space-y-8">
      {group.members.map(member => {
        const memberResources = bySubject.get(member.id) || [];
        return (
          <div key={member.id}>
            {/* Section header */}
            <div className="mb-3 pb-2 border-b border-zinc-700/50">
              <h3 className="text-base font-semibold text-zinc-200">
                {member.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {memberResources.length} {memberResources.length === 1 ? 'recurso' : 'recursos'}
              </p>
            </div>

            {/* Resources list */}
            {memberResources.length === 0 ? (
              <p className="text-sm text-zinc-500 italic py-3">Sin {type.toLowerCase()} disponibles para esta materia.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {memberResources.map((r, i) => (
                  <CardResource
                    key={r.id}
                    title={r.title}
                    fileUrl={r.fileUrl}
                    type={type}
                    subtype={r.subtype}
                    examYear={r.examYear}
                    examMonth={r.examMonth}
                    topic={r.topic}
                    mostRecent={i === 0}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupedResourcesView;
