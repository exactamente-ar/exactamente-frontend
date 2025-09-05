import IconDocument from '@/shared/components/icons/react/IconDocument';
import ErrorMessage from './ErrorMessage';

interface FileInputProps {
  name: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  error?: string;
}

const FileInput: React.FC<FileInputProps> = ({ name, file, onChange, accept, error }) => (
  <>
    <div
      className={`relative text-foreground-secondary font-bold border border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
        error
          ? 'border-red-300 bg-red-900/10'
          : 'border-primary/30 bg-black/20 hover:border-[#FFDD00] hover:bg-[#FFDD00]/5'
      }`}
    >
      <input
        type='file'
        name={name}
        onChange={onChange}
        accept={accept}
        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
      />
      <div className='flex flex-col items-center'>
        <div className='w-12 h-12 bg-yellow-900/35 border border-yellow-500 rounded-xl flex items-center justify-center mb-4'>
          <IconDocument size={24} className='fill-yellow-500' />
        </div>
        {file ? (
          <div>
            <p className='text-sm font-medium text-foreground mb-1'>{file.name}</p>
            <p className='text-xs text-gray-500'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <p className='text-sm font-medium text-foreground mb-1'>
              Arrastrá tu archivo aquí o hacé clic para seleccionar
            </p>
            <p className='text-xs text-gray-500'>PDF, JPG, PNG (máx. 10MB)</p>
          </div>
        )}
      </div>
    </div>
    <ErrorMessage message={error} />
  </>
);

export default FileInput;
