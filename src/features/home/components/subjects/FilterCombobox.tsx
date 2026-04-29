import React, { useEffect, useId, useRef, useState } from 'react';
import type { FilterOption } from '@/features/home/types/filter';

interface FilterComboboxProps {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const FilterCombobox: React.FC<FilterComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const listId = `combobox-list-${uid}`;

  const selectedLabel = options.find((o) => o.id === value)?.label ?? '';
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (!prev) {
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      return !prev;
    });
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-w-40${disabled ? ' opacity-40 pointer-events-none' : ''}`}
      aria-disabled={disabled || undefined}
    >
      <button
        type='button'
        onClick={handleTriggerClick}
        className='w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-left hover:border-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500'
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        aria-controls={isOpen ? listId : undefined}
      >
        <span className={selectedLabel ? 'text-white truncate' : 'text-zinc-400 truncate'}>
          {isLoading ? 'Cargando...' : selectedLabel || placeholder}
        </span>
        <svg
          className={`shrink-0 text-zinc-400 transition-transform${isOpen ? ' rotate-180' : ''}`}
          width='16'
          height='16'
          viewBox='0 0 24 24'
        >
          <path fill='currentColor' d='M7 10l5 5 5-5z' />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden'>
          <div className='p-2 border-b border-zinc-700'>
            <input
              ref={inputRef}
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Buscar...'
              className='w-full bg-zinc-900 text-sm text-white placeholder-zinc-400 px-2 py-1 rounded outline-none'
              aria-autocomplete='list'
              aria-expanded={isOpen}
              aria-controls={listId}
            />
          </div>
          <ul
            id={listId}
            role='listbox'
            className='max-h-52 overflow-y-auto py-1'
          >
            {filtered.length === 0 ? (
              <li className='px-3 py-2 text-sm text-zinc-400'>Sin resultados</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.id}
                  role='option'
                  aria-selected={option.id === value}
                  onClick={() => handleSelect(option.id)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-zinc-700 ${
                    option.id === value ? 'text-white bg-zinc-700/80' : 'text-zinc-200'
                  }`}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterCombobox;
