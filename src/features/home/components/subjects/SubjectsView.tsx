import ListOfSubjects from './ListOfSubjects';
import FilterBar from './FilterBar';
import { useSubjects } from '@/features/home/hooks/useSubjects';

function SubjectsView() {
  const { filters, setFilters, careers, plans, filteredSubjects, loading, hasMore, showMore } = useSubjects();

  return (
    <>
      <FilterBar setFilters={setFilters} filters={filters} careers={careers} plans={plans} />
      <ListOfSubjects
        subjects={filteredSubjects}
        setFilters={setFilters}
        hasMore={hasMore}
        showMore={showMore}
        loading={loading}
        careerId={filters.careerId}
      />
    </>
  );
}

export default SubjectsView;
