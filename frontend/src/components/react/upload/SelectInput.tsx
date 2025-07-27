import ErrorMessage from './ErrorMessage';

interface SelectInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  error?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
}) => (
  <>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full text-foreground-secondary font-bold cursor-pointer px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:border-[#FFDD00] transition-all duration-200 ${
        error ? 'border-red-300 bg-red-900/10' : 'border-primary/30 bg-black/20'
      }`}
    >
      <option value=''>{placeholder}</option>
      {options.map((option) => (
        <option
          key={option}
          value={option}
          style={{ backgroundColor: 'black', color: 'white', fontWeight: 'bold' }}
        >
          {option}
        </option>
      ))}
    </select>
    <ErrorMessage message={error} />
  </>
);

export default SelectInput;
