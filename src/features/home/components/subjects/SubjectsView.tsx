import FilterBar from './FilterBar';
import ListOfSubjects from './ListOfSubjects';
import { useFilterState } from '@/features/home/hooks/useFilterState';
import { useFilterOptions } from '@/features/home/hooks/useFilterOptions';
import { useSubjects } from '@/features/home/hooks/useSubjects';
import type { FilterOptions } from '@/features/home/types/filter';

function SubjectsView() {
  const filterState = useFilterState();
  const { universityOptions, facultyOptions, careerOptions, loadingUniversities, loadingFaculties, loadingCareers } =
    useFilterOptions(filterState.draft);
  const { filteredSubjects, loading, showMore, hasMore, planOptions } = useSubjects(filterState.applied);

  const options: FilterOptions = {
    universities: universityOptions,
    faculties: facultyOptions,
    careers: careerOptions,
    plans: planOptions,
    loadingUniversities,
    loadingFaculties,
    loadingCareers,
  };

  return (
    <>
      <FilterBar
        draft={filterState.draft}
        applied={filterState.applied}
        setDraftFilter={filterState.setDraftFilter}
        applyDraft={filterState.applyDraft}
        cancelDraft={filterState.cancelDraft}
        setSearch={filterState.setSearch}
        clearAll={filterState.clearAll}
        removeFilter={filterState.removeFilter}
        activeCount={filterState.activeCount}
        options={options}
      />
      <ListOfSubjects
        subjects={filteredSubjects}
        onClearAll={filterState.clearAll}
        hasMore={hasMore}
        showMore={showMore}
        loading={loading}
        careerId={filterState.applied.careerId}
      />
    </>
  );
}

export default SubjectsView;
