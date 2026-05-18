import React, { useCallback, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import type { FilterOption } from '@/features/home/types/filter';

interface FilterComboboxProps {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'pill';
}

const FilterCombobox: React.FC<FilterComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  isLoading = false,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = useMemo(
    () => options.find((o) => o.id === value)?.label ?? '',
    [options, value]
  );
  const isPill = variant === 'pill';
  const hasSelection = Boolean(selectedLabel);

  const triggerClassName = isPill
    ? cn(
        'flex items-center justify-between gap-2 px-4 py-2 text-sm rounded-full border transition-colors min-w-[10rem] max-w-[min(100vw-3rem,20rem)] h-auto font-medium',
        hasSelection
          ? 'bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-700'
          : 'bg-transparent border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:bg-transparent'
      )
    : 'flex items-center justify-between gap-2 px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg h-auto hover:border-zinc-500 hover:bg-zinc-800 font-normal';

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (disabled) return;
      setIsOpen(open);
    },
    [disabled]
  );

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      setIsOpen(false);
    },
    [onChange]
  );

  return (
    <Popover open={isOpen && !disabled} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={isOpen}
          disabled={disabled}
          className={cn(triggerClassName, 'w-full')}
        >
          <span className={cn('truncate', !hasSelection && 'text-zinc-400')}>
            {isLoading && !hasSelection ? 'Cargando...' : selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className='shrink-0 text-zinc-400 opacity-70' size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'p-0 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg',
          isPill ? 'w-[min(100vw-2rem,20rem)]' : 'w-full'
        )}
        align='start'
      >
        <Command className='bg-transparent'>
          <CommandInput
            placeholder='Buscar...'
            className='text-white placeholder:text-zinc-400 border-b border-zinc-700'
          />
          <CommandList>
            {isLoading && (
              <div className='flex items-center justify-center gap-2 py-6 text-sm text-zinc-400'>
                <Loader2 className='animate-spin' size={16} />
                Cargando...
              </div>
            )}
            {!isLoading && (
              <CommandEmpty className='text-zinc-400 text-sm px-3 py-2'>
                Sin resultados
              </CommandEmpty>
            )}
            {!isLoading && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    onSelect={() => handleSelect(option.id)}
                    className='text-zinc-200 hover:bg-zinc-700 cursor-pointer aria-selected:bg-zinc-700/80 aria-selected:text-white'
                  >
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto',
                        value === option.id ? 'opacity-100 text-white' : 'opacity-0'
                      )}
                      size={14}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(FilterCombobox);
