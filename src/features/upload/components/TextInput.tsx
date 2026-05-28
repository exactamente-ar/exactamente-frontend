import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import ErrorMessage from './ErrorMessage';

interface TextInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({ name, value, onChange, placeholder, error }) => (
  <>
    <div className='search-gradient-border rounded-xl'>
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn('placeholder:text-muted-foreground', error && 'border-red-300 bg-red-900/10')}
      />
    </div>
    <ErrorMessage message={error} />
  </>
);

export default TextInput;
