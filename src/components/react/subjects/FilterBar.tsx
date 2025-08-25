import { CARRERS_FILTER, QUADMESTERS_FILTER, YEARS_FILTER } from '@/constants/Filter';
import type { PropsFilterBar } from '@/types/filter';
import React from 'react';

const FilterBar: React.FC<PropsFilterBar> = ({ filters, setFilters }) => {
  return (
    <div className='flex flex-col gap-8 mb-4 lg:mb-8 w-full rounded-xl p-4 bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-border/60'>
      <div className='p-[2px] rounded-xl from-primary  to-accent bg-gradient-to-l'>
        <div
          className='relative w-full bg-zinc-900 flex justify-between items-center gap-2 border border-zinc-700 rounded-xl  transition-all duration-200'
          tabIndex={0}
        >
          <div className='px-4 py-2 flex items-center w-full'>
            <svg width='20' height='20' className='mr-2' viewBox='0 0 24 24'>
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
              placeholder='Ingresa una materia'
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }));
              }}
              className='w-full font-bold text-foreground placeholder-foreground-muted focus:outline-none'
            />
          </div>
          <div className='bg-gradient-to-l from-primary  to-accent  py-2.5 px-4 rounded-xl h-full'>
            <svg className='text-primary-foreground' width='20' height='20' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M16.175 13H4v-2h12.175l-5.6-5.6L12 4l8 8l-8 8l-1.425-1.4z'
              />
            </svg>
          </div>
        </div>
      </div>
      <div className='flex gap-6 items-start sm:items-center flex-col sm:flex-row text-foreground-muted'>
        <div className='flex items-start gap-2'>
          <span className='text-sm'>Carrera</span>
          <div className='flex gap-2 flex-wrap'>
            {CARRERS_FILTER.map((carrer, i) => (
              <div
                key={carrer + i}
                className={`cursor-pointer rounded-full px-4 font-medium flex gap-1 items-center border border-zinc-700 hover:ring-1 hover:ring-yellow-400 ${
                  filters.carrer == carrer ? 'bg-yellow-400 text-zinc-950 border-yellow-400' : ''
                }`}
                onClick={() => setFilters((prev) => ({ ...prev, carrer: carrer }))}
              >
                {carrer}
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-start gap-2'>
          <span className='text-sm'>Cuatrimestre</span>
          <div className='flex gap-2 flex-wrap'>
            {QUADMESTERS_FILTER.map(({ label, value }) => (
              <div
                key={value}
                className={`cursor-pointer rounded-full px-4 font-medium flex gap-1 items-center border border-zinc-700 hover:ring-1 hover:ring-yellow-400 ${
                  filters.quadmester === value
                    ? 'bg-yellow-400 text-zinc-950 border-yellow-400'
                    : ''
                }`}
                onClick={() => setFilters((prev) => ({ ...prev, quadmester: value }))}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-start gap-2'>
          <span className='text-sm'>Año</span>
          <div className='flex gap-2 flex-wrap'>
            {YEARS_FILTER.map(({ label, value }) => (
              <div
                key={value}
                className={`cursor-pointer rounded-full px-4 font-medium flex gap-1 items-center border border-zinc-700 hover:ring-1 hover:ring-yellow-400 ${
                  filters.year === value ? 'bg-yellow-400 text-zinc-950 border-yellow-400' : ''
                }`}
                onClick={() => setFilters((prev) => ({ ...prev, year: value }))}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
