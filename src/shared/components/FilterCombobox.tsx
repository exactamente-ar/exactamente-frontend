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
import type { FilterOption } from '@/shared/types/filter';

interface FilterComboboxProps {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'pill' | 'form';
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
  const isForm = variant === 'form';
  const hasSelection = Boolean(selectedLabel);

  const triggerClassName = isPill
    ? cn(
        'flex items-center justify-between gap-2 px-4 py-2 text-sm rounded-full border transition-colors min-w-[10rem] max-w-[min(100vw-3rem,20rem)] h-auto font-medium cursor-pointer',
        hasSelection
          ? 'bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600 hover:text-white'
          : 'bg-transparent border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-700/40 hover:text-zinc-300'
      )
    : isForm
    ? 'flex items-center justify-between gap-2 w-full rounded-xl border border-primary/30 bg-black/20 px-4 py-3 text-sm h-auto font-bold text-foreground-secondary transition-all duration-200 cursor-pointer hover:bg-black/30 hover:text-foreground-secondary focus:ring-0 focus:ring-offset-0 focus:outline-none'
    : 'flex items-center justify-between gap-2 px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg h-auto hover:border-zinc-500 hover:bg-zinc-700 font-normal cursor-pointer';

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
          disabled={disabled || undefined}
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
          'p-0 border border-zinc-700 shadow-lg',
          isForm ? 'bg-zinc-900 rounded-xl w-[var(--radix-popover-trigger-width)]' : 'bg-zinc-800 rounded-lg',
          isPill && 'w-[min(100vw-2rem,20rem)]',
          !isPill && !isForm && 'w-full'
        )}
        align='start'
      >
        <Command className='bg-transparent'>
          {isForm ? (
            <div className='search-gradient-border m-2 rounded-xl border border-primary/30 bg-black/20 [&_[cmdk-input-wrapper]]:after:hidden'>
              <CommandInput
                placeholder='Buscar...'
                className='text-white placeholder:text-zinc-400'
              />
            </div>
          ) : (
            <CommandInput
              placeholder='Buscar...'
              className='text-white placeholder:text-zinc-400 border-b border-zinc-700'
            />
          )}
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
                {options.map((option) => {
                  const isSelected = value === option.id;
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.label}
                      onSelect={() => handleSelect(option.id)}
                      className={cn(
                        'text-zinc-200 cursor-pointer',
                        isSelected
                          ? 'bg-zinc-700 text-white data-[selected=true]:bg-zinc-600 data-[selected=true]:text-white'
                          : 'data-[selected=true]:bg-zinc-700/60 data-[selected=true]:text-zinc-100'
                      )}
                    >
                      {option.label}
                      <Check
                        className={cn(
                          'ml-auto',
                          isSelected ? 'opacity-100 text-white' : 'opacity-0'
                        )}
                        size={14}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(FilterCombobox);
