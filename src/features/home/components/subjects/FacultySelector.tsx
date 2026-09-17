import React from 'react';
import FilterCombobox from '@/shared/components/FilterCombobox';
import type { FilterOption } from '@/features/home/types/filter';

type Props = {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
};

/**
 * Selector de facultad, arriba de la barra de filtros. Con una sola facultad
 * cargada no aporta nada, así que no se muestra: la home queda igual que hoy.
 */
function FacultySelector({ options, value, onChange, loading = false }: Props) {
  if (options.length < 2) return null;

  return (
    <div className='mb-3 flex items-center gap-3'>
      <span className='text-sm text-zinc-400 whitespace-nowrap'>Facultad</span>
      <FilterCombobox
        variant='pill'
        options={options}
        value={value}
        onChange={onChange}
        placeholder='Elegí tu facultad'
        isLoading={loading}
      />
    </div>
  );
}

export default React.memo(FacultySelector);
