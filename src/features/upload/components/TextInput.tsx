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
    <Input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(error && 'border-red-300 bg-red-900/10')}
    />
    <ErrorMessage message={error} />
  </>
);

export default TextInput;
