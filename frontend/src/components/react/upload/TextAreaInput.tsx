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
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className='w-full text-foreground-secondary font-bold px-4 py-3 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:border-[#FFDD00] transition-all duration-200 bg-black/20 resize-none'
  />
);
export default TextAreaInput;
