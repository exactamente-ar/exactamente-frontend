import { useEffect, useMemo } from 'react';
import FilterBar from './FilterBar';
import ListOfSubjects from './ListOfSubjects';
import { useFilterState, buildFilterSearchParams } from '@/features/home/hooks/useFilterState';
import { useFilterOptions } from '@/features/home/hooks/useFilterOptions';
import { useResolvedDefaultScope } from '@/features/home/hooks/useResolvedDefaultScope';
import { useSubjects } from '@/features/home/hooks/useSubjects';
import type { FilterOptions } from '@/features/home/types/filter';
import { DEFAULT_PLAN_YEAR } from '@/features/home/constants/filter';

function SubjectsView() {
  const { defaultScope, scopeError, scopeReady } = useResolvedDefaultScope();
  const filterState = useFilterState(defaultScope);

  const { universityId, facultyId, careerId, planId, year, quadmester, search } = filterState.applied;
  const filtersForOptions = useMemo(
    () => ({ universityId, facultyId, careerId, planId, year, quadmester }),
    [universityId, facultyId, careerId, planId, year, quadmester]
  );

  const { universityOptions, facultyOptions, careerOptions, loadingUniversities, loadingFaculties, loadingCareers } =
    useFilterOptions(filtersForOptions);

  const { filteredSubjects, loading, showMore, hasMore, planOptions } = useSubjects(filterState.applied, scopeReady);

  useEffect(() => {
    if (planOptions.length === 1 && filterState.applied.planId !== planOptions[0].id) {
      filterState.commitFilter('planId', planOptions[0].id);
      return;
    }
    if (planOptions.length > 1 && !filterState.applied.planId) {
      const defaultPlan = planOptions.find((p) => p.id.match(/\d+$/)?.[0] === String(DEFAULT_PLAN_YEAR));
      if (defaultPlan) filterState.commitFilter('planId', defaultPlan.id);
    }
  }, [planOptions]);

  const homeQuery = useMemo(() => buildFilterSearchParams(filterState.applied).toString(), [filterState.applied]);

  const options = useMemo<FilterOptions>(
    () => ({
      universities: universityOptions,
      faculties: facultyOptions,
      careers: careerOptions,
      plans: planOptions,
      loadingUniversities,
      loadingFaculties,
      loadingCareers,
      loadingPlans: loading,
    }),
    [universityOptions, facultyOptions, careerOptions, planOptions, loadingUniversities, loadingFaculties, loadingCareers, loading]
  );

  return (
    <>
      <FilterBar
        applied={filterState.applied}
        commitFilter={filterState.commitFilter}
        setSearch={filterState.setSearch}
        clearAll={filterState.clearAll}
        options={options}
        scopeError={scopeError}
        scopeReady={scopeReady}
      />
      <ListOfSubjects
        subjects={filteredSubjects}
        onClearAll={filterState.clearAll}
        hasMore={hasMore}
        showMore={showMore}
        loading={loading}
        activeCareerId={filterState.applied.careerId}
        homeQuery={homeQuery}
      />
    </>
  );
}

export default SubjectsView;
