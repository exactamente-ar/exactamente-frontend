import { Textarea } from '@/shared/components/ui/textarea';

interface TextAreaInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}) => (
  <Textarea
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
  />
);

export default TextAreaInput;
