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
  options: string[];
  placeholder: string;
  error?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  value,
  onValueChange,
  options,
  placeholder,
  error,
}) => (
  <>
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger
        className={cn(
          'w-full rounded-xl border border-primary/30 bg-black/20 px-4 py-3 h-auto font-bold text-foreground-secondary focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff] transition-all duration-200',
          error && 'border-red-300 bg-red-900/10'
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className='bg-zinc-900 border border-zinc-700 rounded-xl'>
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className='text-white font-bold focus:bg-zinc-700 cursor-pointer'
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <ErrorMessage message={error} />
  </>
);

export default SelectInput;
