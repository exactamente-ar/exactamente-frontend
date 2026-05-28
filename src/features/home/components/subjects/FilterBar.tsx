import React, { useCallback, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import FilterCombobox from './FilterCombobox';
import type { PropsFilterBar } from '@/features/home/types/filter';
import { YEARS_FILTER, QUADMESTERS_FILTER } from '@/features/home/constants/filter';

function FilterGroup ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-center gap-3 shrink-0 min-w-0'>
      <span className='text-sm text-zinc-400 whitespace-nowrap'>{label}</span>
      <div className='min-w-0'>{children}</div>
    </div>
  );
}

const PillToggleGroup = React.memo(function PillToggleGroup ({
  label,
  options,
  value,
  disabled,
  onChange,
}: {
  label: string;
  options: { label: string; value: number }[];
  value: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <FilterGroup label={label}>
      <div className='flex flex-wrap gap-1.5'>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type='button'
              disabled={disabled || undefined}
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none ${active
                ? 'bg-zinc-700 border-zinc-600 text-white'
                : 'bg-transparent border-zinc-600 text-zinc-400 hover:border-zinc-500'
                }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </FilterGroup>
  );
});

const FilterBar: React.FC<PropsFilterBar> = ({
  applied,
  commitFilter,
  setSearch,
  clearAll,
  options,
  scopeError,
  scopeReady,
}) => {
  const canReset = useMemo(
    () =>
      Boolean(
        applied.careerId ||
        applied.planId ||
        applied.year !== 0 ||
        applied.quadmester !== 0 ||
        applied.search
      ),
    [applied.careerId, applied.planId, applied.year, applied.quadmester, applied.search]
  );

  const filtersDisabled = Boolean(scopeError) || !applied.facultyId;

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [setSearch]
  );

  const handleCareerChange = useCallback(
    (id: string) => commitFilter('careerId', id),
    [commitFilter]
  );
  const handlePlanChange = useCallback(
    (id: string) => commitFilter('planId', id),
    [commitFilter]
  );
  const handleYearChange = useCallback(
    (v: number) => commitFilter('year', v),
    [commitFilter]
  );
  const handleQuadmesterChange = useCallback(
    (v: number) => commitFilter('quadmester', v),
    [commitFilter]
  );

  return (
    <div className='flex flex-col mb-4 lg:mb-8 w-full gap-2'>
      <div className='border border-zinc-700 rounded-xl bg-gradient-to-br from-zinc-900/50 to-zinc-950/95'>
        <div className='search-gradient-border rounded-t-xl flex items-center gap-2 px-4 py-4 bg-gradient-to-br from-zinc-800/40 to-zinc-900/60'>
          <svg width='18' height='18' viewBox='0 0 24 24' className='shrink-0'>
            <path
              className='stroke-foreground-muted'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314'
            />
          </svg>
          <input
            type='text'
            placeholder='Buscar una materia'
            value={applied.search}
            onChange={handleSearchChange}
className='w-full text-sm font-medium text-foreground placeholder-foreground-muted focus:outline-none bg-transparent'
          />
        </div>

        <div className='border-t border-zinc-700 px-3 py-3 flex flex-wrap items-center gap-x-6 gap-y-3 overflow-x-auto scrollbar-none lg:overflow-visible'>
          <FilterGroup label='Carrera'>
            <FilterCombobox
              variant='pill'
              options={options.careers}
              value={applied.careerId}
              onChange={handleCareerChange}
              placeholder='Seleccionar carrera'
              disabled={filtersDisabled}
              isLoading={options.loadingCareers}
            />
          </FilterGroup>

          <FilterGroup label='Plan'>
            <FilterCombobox
              variant='pill'
              options={options.plans}
              value={applied.planId}
              onChange={handlePlanChange}
              placeholder='Seleccionar plan'
              disabled={filtersDisabled || !applied.careerId}
              isLoading={options.loadingPlans}
            />
          </FilterGroup>

          <PillToggleGroup
            label='Año'
            options={YEARS_FILTER}
            value={applied.year}
            disabled={filtersDisabled}
            onChange={handleYearChange}
          />

          <PillToggleGroup
            label='Cuatrimestre'
            options={QUADMESTERS_FILTER}
            value={applied.quadmester}
            disabled={filtersDisabled}
            onChange={handleQuadmesterChange}
          />
        </div>

      </div>

      {scopeError && (
        <p className='text-sm text-red-400' role='alert'>
          {scopeError}
        </p>
      )}

      {canReset && (
        <button
          type='button'
          onClick={clearAll}
          className='self-start flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors cursor-pointer'
        >
          <RotateCcw size={11} />
          Restablecer filtros
        </button>
      )}
    </div>
  );
};

export default React.memo(FilterBar);
