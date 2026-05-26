import React, { useEffect, useRef, useState } from 'react';
import IconDocument from '@/shared/components/icons/react/IconDocument';
import ErrorMessage from './ErrorMessage';

interface FileInputProps {
  fileMode: 'pdf' | 'images';
  onFileModeChange: (mode: 'pdf' | 'images') => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  imageFiles: File[];
  onImagesChange: (files: File[]) => void;
  error?: string;
}

const MAX_SIZE = 20 * 1024 * 1024;
const MAX_IMAGES = 10;

const FileInput: React.FC<FileInputProps> = ({
  fileMode,
  onFileModeChange,
  file,
  onFileChange,
  imageFiles,
  onImagesChange,
  error,
}) => {
  const [thumbUrls, setThumbUrls] = useState<string[]>([]);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    setThumbUrls(urls);
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [imageFiles]);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > MAX_SIZE) {
      onFileChange(null);
      return;
    }
    onFileChange(selected);
  };

  const handleImagesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).filter(
      (f) => f.type === 'image/jpeg' || f.type === 'image/png'
    );
    onImagesChange([...imageFiles, ...selected].slice(0, MAX_IMAGES));
    if (imgInputRef.current) imgInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    onImagesChange(imageFiles.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    const updated = [...imageFiles];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onImagesChange(updated);
  };

  return (
    <div className='space-y-3'>
      {/* Mode toggle */}
      <div className='flex rounded-xl border border-primary/30 overflow-hidden w-fit'>
        {(['pdf', 'images'] as const).map((mode) => (
          <button
            key={mode}
            type='button'
            onClick={() => onFileModeChange(mode)}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              fileMode === mode
                ? 'gradient-bg-dark text-white'
                : 'bg-black/20 text-foreground-secondary hover:bg-black/40'
            }`}
          >
            {mode === 'pdf' ? 'PDF' : 'Imágenes'}
          </button>
        ))}
      </div>

      {fileMode === 'pdf' && (
        <div
          className={`dashed-gradient-hover relative border border-dashed rounded-xl p-8 h-44 text-center transition-all duration-200 ${
            error
              ? 'border-red-300 bg-red-900/10'
              : 'border-primary/30 bg-black/20'
          }`}
        >
          <input
            type='file'
            accept='.pdf'
            onChange={handlePdfChange}
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
          />
          <div className='flex flex-col items-center justify-center h-full pointer-events-none'>
            <div className='w-12 h-12 bg-zinc-800 border border-zinc-600 rounded-xl flex items-center justify-center mb-4'>
              <IconDocument size={24} className='fill-zinc-400' />
            </div>
            {file ? (
              <>
                <p className='text-sm font-medium text-foreground mb-1'>{file.name}</p>
                <p className='text-xs text-gray-500'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <p className='text-sm font-medium text-foreground mb-1'>
                  Arrastrá tu PDF aquí o hacé clic para seleccionar
                </p>
                <p className='text-xs text-gray-500'>Solo PDF · máx. 20 MB</p>
              </>
            )}
          </div>
        </div>
      )}

      {fileMode === 'images' && (
        <div className='space-y-3'>
          <div
            className={`dashed-gradient-hover relative border border-dashed rounded-xl p-6 h-44 flex flex-col items-center justify-center text-center transition-all duration-200 ${
              error
                ? 'border-red-300 bg-red-900/10'
                : 'border-primary/30 bg-black/20'
            }`}
          >
            <input
              ref={imgInputRef}
              type='file'
              accept='.jpg,.jpeg,.png'
              multiple
              onChange={handleImagesAdd}
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            />
            <p className='text-sm font-medium text-foreground pointer-events-none'>
              Hacé clic para agregar imágenes
            </p>
            <p className='text-xs text-gray-500 pointer-events-none'>
              JPG, PNG · máx. {MAX_IMAGES} imágenes · Se convertirán a PDF
            </p>
          </div>

          {imageFiles.length > 0 && (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
              {thumbUrls.map((url, i) => (
                <div
                  key={i}
                  className='relative group rounded-lg overflow-hidden border border-primary/30 bg-black/20'
                >
                  <img src={url} alt={`Imagen ${i + 1}`} className='w-full h-24 object-cover' />
                  <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1'>
                    {i > 0 && (
                      <button
                        type='button'
                        onClick={() => moveImage(i, i - 1)}
                        className='w-7 h-7 bg-zinc-800 rounded-full text-white text-xs flex items-center justify-center hover:bg-zinc-700'
                      >
                        ←
                      </button>
                    )}
                    <button
                      type='button'
                      onClick={() => removeImage(i)}
                      className='w-7 h-7 bg-red-900 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-800'
                    >
                      ×
                    </button>
                    {i < imageFiles.length - 1 && (
                      <button
                        type='button'
                        onClick={() => moveImage(i, i + 1)}
                        className='w-7 h-7 bg-zinc-800 rounded-full text-white text-xs flex items-center justify-center hover:bg-zinc-700'
                      >
                        →
                      </button>
                    )}
                  </div>
                  <span className='absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded'>
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ErrorMessage message={error} />
    </div>
  );
};

export default FileInput;
