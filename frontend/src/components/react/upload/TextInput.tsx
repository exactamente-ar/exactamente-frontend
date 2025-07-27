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
    <input
      type='text'
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full text-foreground-secondary font-bold px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:border-[#FFDD00] transition-all duration-200 ${
        error ? 'border-red-300 bg-red-900/10' : 'border-primary/30 bg-black/20'
      }`}
    />
    <ErrorMessage message={error} />
  </>
);
export default TextInput;
