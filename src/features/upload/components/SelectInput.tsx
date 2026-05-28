import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';
import ErrorMessage from './ErrorMessage';

interface SelectInputProps {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  error?: string;
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  disabled,
}) => (
  <>
    <Select value={value} onValueChange={onValueChange} name={name} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'search-gradient-border w-full rounded-xl border border-primary/30 bg-black/20 px-4 py-3 h-auto font-bold text-foreground-secondary transition-all duration-200 cursor-pointer focus:ring-0 focus:ring-offset-0 focus:outline-none',
          error && 'border-red-300 bg-red-900/10'
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className='bg-zinc-900 border border-zinc-700 rounded-xl max-h-60 overflow-y-auto'>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className='text-white font-bold focus:bg-zinc-700 focus:text-white cursor-pointer'
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <ErrorMessage message={error} />
  </>
);

export default SelectInput;
