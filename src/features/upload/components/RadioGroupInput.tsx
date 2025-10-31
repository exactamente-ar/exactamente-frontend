import ErrorMessage from './ErrorMessage';

interface RadioGroupInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
}

const RadioGroupInput: React.FC<RadioGroupInputProps> = ({
  name,
  value,
  onChange,
  options,
  error,
}) => (
  <>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      {options.map((tipo) => (
        <label
          key={tipo.value}
          className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
            value === tipo.value
              ? 'border-[#0084ff] bg-[#0084ff]/10'
              : 'border-primary/30 bg-black/20 hover:border-gray-400'
          }`}
        >
          <input
            type='radio'
            name={name}
            value={tipo.value}
            checked={value == tipo.value}
            onChange={onChange}
            className='sr-only'
          />
          <div
            className={`w-5 h-5 text-foreground-secondary font-bold rounded-full border mr-3 flex items-center justify-center ${
              value === tipo.value ? 'border-[#0084ff] bg-[#0084ff]' : 'border-primary/30'
            }`}
          >
            {value === tipo.value && <div className='w-2 h-2 bg-black rounded-full'></div>}
          </div>
          <span className='font-medium text-foreground'>{tipo.label}</span>
        </label>
      ))}
    </div>
    <ErrorMessage message={error} />
  </>
);

export default RadioGroupInput;
