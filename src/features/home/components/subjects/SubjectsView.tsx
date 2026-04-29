import { useState } from 'react';
import ListOfSubjects from './ListOfSubjects';
import FilterBar from './FilterBar';
import { useSubjects } from '@/features/home/hooks/useSubjects';
import type { AppliedFilters } from '@/features/home/types/filter';

function SubjectsView() {
  const [appliedFilters] = useState<AppliedFilters>({
    universityId: '',
    facultyId: '',
    careerId: '',
    planId: '',
    year: 0,
    quadmester: 0,
    search: '',
  });

  const { filteredSubjects, loading, hasMore, showMore } = useSubjects(appliedFilters);

  return (
    <>
      {/* TODO: This component will be fully rewritten in Task 10 */}
      <FilterBar setFilters={() => {}} filters={appliedFilters} careers={[]} plans={[]} />
      <ListOfSubjects
        subjects={filteredSubjects}
        setFilters={() => {}}
        hasMore={hasMore}
        showMore={showMore}
        loading={loading}
        careerId={appliedFilters.careerId}
      />
    </>
  );
}

export default SubjectsView;
