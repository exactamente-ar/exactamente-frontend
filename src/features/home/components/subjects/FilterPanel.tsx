import React, { useEffect, useRef } from 'react';
import FilterCombobox from './FilterCombobox';
import type { DraftFilters, FilterOptions } from '@/features/home/types/filter';
import { YEARS_FILTER, QUADMESTERS_FILTER } from '@/features/home/constants/filter';

interface FilterPanelProps {
  draft: DraftFilters;
  setDraftFilter: <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => void;
  options: FilterOptions;
  onApply: () => void;
  onCancel: () => void;
}

const yearOptions = YEARS_FILTER.filter((f) => f.value !== 0).map((f) => ({
  id: String(f.value),
  label: f.label,
}));

const quadmesterOptions = QUADMESTERS_FILTER.filter((f) => f.value !== 0).map((f) => ({
  id: String(f.value),
  label: f.label,
}));

const FilterPanel: React.FC<FilterPanelProps> = ({
  draft,
  setDraftFilter,
  options,
  onApply,
  onCancel,
}) => {
  const firstComboboxRef = useRef<HTMLDivElement>(null);

  // Move focus to panel on open
  useEffect(() => {
    const firstButton = firstComboboxRef.current?.querySelector('button');
    firstButton?.focus();
  }, []);

  const rows: Array<{
    label: string;
    key: keyof DraftFilters;
    opts: { id: string; label: string }[];
    disabled: boolean;
    loading: boolean;
    isNumeric?: boolean;
  }> = [
    {
      label: 'Universidad',
      key: 'universityId',
      opts: options.universities,
      disabled: false,
      loading: options.loadingUniversities,
    },
    {
      label: 'Facultad',
      key: 'facultyId',
      opts: options.faculties,
      disabled: !draft.universityId,
      loading: options.loadingFaculties,
    },
    {
      label: 'Carrera',
      key: 'careerId',
      opts: options.careers,
      disabled: !draft.facultyId,
      loading: options.loadingCareers,
    },
    {
      label: 'Plan',
      key: 'planId',
      opts: options.plans,
      disabled: !draft.careerId,
      loading: false,
    },
    {
      label: 'Año',
      key: 'year',
      opts: yearOptions,
      disabled: !draft.careerId,
      loading: false,
      isNumeric: true,
    },
    {
      label: 'Cuatrimestre',
      key: 'quadmester',
      opts: quadmesterOptions,
      disabled: !draft.careerId,
      loading: false,
      isNumeric: true,
    },
  ];

  const handleChange = (key: keyof DraftFilters, id: string, isNumeric: boolean) => {
    if (isNumeric) {
      (setDraftFilter as (key: 'year' | 'quadmester', value: number) => void)(
        key as 'year' | 'quadmester',
        id ? Number(id) : 0
      );
    } else {
      (setDraftFilter as (key: 'universityId' | 'facultyId' | 'careerId' | 'planId', value: string) => void)(
        key as 'universityId' | 'facultyId' | 'careerId' | 'planId',
        id
      );
    }
  };

  const panelContent = (
    <>
      {/* Filter rows */}
      <div className='flex flex-col gap-4 p-4'>
        {rows.map((row, i) => (
          <div
            key={row.key}
            ref={i === 0 ? firstComboboxRef : undefined}
            className='flex items-center justify-between gap-4'
          >
            <span className={`text-sm shrink-0 w-28 ${row.disabled ? 'text-zinc-500' : 'text-zinc-300'}`}>
              {row.label}
            </span>
            <FilterCombobox
              options={row.opts}
              value={row.isNumeric ? (draft[row.key] !== 0 ? String(draft[row.key]) : '') : String(draft[row.key])}
              onChange={(id) => handleChange(row.key, id, row.isNumeric ?? false)}
              placeholder={`Seleccionar ${row.label.toLowerCase()}`}
              disabled={row.disabled}
              isLoading={row.loading}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-end gap-3 px-4 py-3 border-t border-zinc-700'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-zinc-700'
        >
          Cancelar
        </button>
        <button
          type='button'
          onClick={onApply}
          className='px-4 py-2 text-sm font-semibold text-white rounded-lg gradient-bg hover:opacity-90 transition-opacity'
        >
          Aplicar
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop dropdown */}
      <div
        id='filter-panel'
        role='region'
        aria-label='Filtros'
        className='hidden lg:block absolute right-0 top-full mt-2 w-[480px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50'
      >
        {panelContent}
      </div>

      {/* Mobile bottom sheet */}
      <>
        {/* Backdrop */}
        <div
          className='lg:hidden fixed inset-0 bg-black/60 z-40'
          onClick={onCancel}
          aria-hidden='true'
        />
        <div
          id='filter-panel-mobile'
          role='dialog'
          aria-label='Filtros'
          aria-modal='true'
          className='lg:hidden fixed inset-x-0 bottom-0 z-50 bg-zinc-900 border-t border-zinc-700 rounded-t-2xl max-h-[90dvh] flex flex-col'
        >
          {/* Handle */}
          <div className='flex justify-center pt-3 pb-1'>
            <div className='w-10 h-1 rounded-full bg-zinc-600' />
          </div>
          <div className='flex-1 overflow-y-auto'>
            <div className='flex flex-col gap-4 p-4'>
              {rows.map((row) => (
                <div key={row.key} className='flex flex-col gap-1.5'>
                  <span className={`text-sm font-medium ${row.disabled ? 'text-zinc-500' : 'text-zinc-300'}`}>
                    {row.label}
                  </span>
                  <FilterCombobox
                    options={row.opts}
                    value={row.isNumeric ? (draft[row.key] !== 0 ? String(draft[row.key]) : '') : String(draft[row.key])}
                    onChange={(id) => handleChange(row.key, id, row.isNumeric ?? false)}
                    placeholder={`Seleccionar ${row.label.toLowerCase()}`}
                    disabled={row.disabled}
                    isLoading={row.loading}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Mobile footer */}
          <div className='flex items-center gap-3 px-4 py-4 border-t border-zinc-700 shrink-0'>
            <button
              type='button'
              onClick={onCancel}
              className='flex-1 px-4 py-2.5 text-sm text-zinc-300 hover:text-white border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={onApply}
              className='flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl gradient-bg hover:opacity-90 transition-opacity'
            >
              Aplicar
            </button>
          </div>
        </div>
      </>
    </>
  );
};

export default FilterPanel;
