import ListOfSubjects from './ListOfSubjects';
import FilterBar from './FilterBar';
import { useSubjects } from '@/hooks/useSubjects';

function SubjectsView() {
  const { filters, setFilters, filteredSubjects, loading, hasMore, showMore } = useSubjects();

  return (
    <>
      <FilterBar setFilters={setFilters} filters={filters} />
      <ListOfSubjects
        subjects={filteredSubjects}
        setFilters={setFilters}
        hasMore={hasMore}
        showMore={showMore}
        loading={loading}
      />
    </>
  );
}

export default SubjectsView;
