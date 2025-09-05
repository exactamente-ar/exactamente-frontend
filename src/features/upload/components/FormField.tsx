interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, children }) => (
  <div>
    <label className='block text-sm font-semibold text-foreground mb-3'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    {children}
  </div>
);

export default FormField;
