import React, { useEffect, useRef, useState } from 'react';
import FilterPanel from './FilterPanel';
import ActiveTags from './ActiveTags';
import type { PropsFilterBar, DraftFilters } from '@/features/home/types/filter';

const FilterBar: React.FC<PropsFilterBar> = ({
  draft,
  applied,
  setDraftFilter,
  applyDraft,
  cancelDraft,
  setSearch,
  clearAll,
  removeFilter,
  activeCount,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelWrapperRef = useRef<HTMLDivElement>(null);

  // Return focus to button when panel closes
  useEffect(() => {
    if (!isOpen) buttonRef.current?.focus();
  }, [isOpen]);

  // Close desktop dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelWrapperRef.current && !panelWrapperRef.current.contains(e.target as Node)) {
        cancelDraft();
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, cancelDraft]);

  const handleApply = () => {
    applyDraft();
    setIsOpen(false);
  };

  const handleCancel = () => {
    cancelDraft();
    setIsOpen(false);
  };

  const displayedFilters: DraftFilters = isOpen
    ? draft
    : {
        universityId: applied.universityId,
        facultyId: applied.facultyId,
        careerId: applied.careerId,
        planId: applied.planId,
        year: applied.year,
        quadmester: applied.quadmester,
      };

  return (
    <div className='flex flex-col mb-4 lg:mb-8 w-full'>
      {/* Search bar row */}
      <div className='relative flex items-center gap-2'>
        <div className='flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 focus-within:border-zinc-500 transition-colors'>
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
            placeholder='Ingresá una materia'
            value={applied.search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full text-sm font-medium text-foreground placeholder-foreground-muted focus:outline-none bg-transparent'
          />
        </div>

        {/* Filtros button + desktop dropdown wrapper */}
        <div ref={panelWrapperRef} className='relative'>
          <button
            ref={buttonRef}
            type='button'
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls='filter-panel'
            className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-zinc-900 border border-zinc-700 rounded-xl hover:border-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
              <path
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                d='M3 6h18M7 12h10M11 18h2'
              />
            </svg>
            <span>Filtros</span>
            {activeCount > 0 && (
              <span className='flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full gradient-bg text-white'>
                {activeCount}
              </span>
            )}
          </button>

          {isOpen && (
            <FilterPanel
              draft={draft}
              setDraftFilter={setDraftFilter}
              options={options}
              onApply={handleApply}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>

      {/* Active tags */}
      <ActiveTags
        displayedFilters={displayedFilters}
        options={options}
        onRemove={removeFilter}
        onClearAll={clearAll}
      />
    </div>
  );
};

export default FilterBar;
