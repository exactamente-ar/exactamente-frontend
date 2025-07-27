import IconDownload from '@/assets/icons/react/IconDownload';
import IconDocument from '@/assets/icons/react/IconDocument';
import IconAlertCircle from '@/assets/icons/react/IconAlertCircle';
import ReCAPTCHA from 'react-google-recaptcha';

const SITE_KEY_CAPTCHA = '6LfCHpArAAAAAMeI_zqp5XSn2IiGqklXaN4V2VEz';

interface UploadFormProps {
  formData: {
    materia: string;
    tipoAporte: string;
    titulo: string;
    descripcion: string;
    archivo: File | null;
    autor: string;
  };
  errors: {
    materia?: string;
    tipoAporte?: string;
    titulo?: string;
    archivo?: string;
    captcha?: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  subjects: string[];
  tiposAporte: { value: string; label: string; color: string }[];
  uploading: boolean;
  uploadError: string | null;
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
}

const UploadForm = ({
  formData,
  errors,
  handleInputChange,
  handleFileChange,
  handleSubmit,
  uploading,
  uploadError,
  subjects,
  tiposAporte,
  captchaToken,
  setCaptchaToken,
}: UploadFormProps) => (
  <div className='bg-gradient-to-br from-zinc-900/90 to-zinc-950/95  rounded-xl shadow-sm border border-border/60 p-6'>
    <form onSubmit={(e) => handleSubmit(() => {})(e)} className='space-y-8'>
      {/* Materia */}
      <div>
        <label className='block text-sm font-semibold text-foreground mb-3'>
          Materia <span className='text-red-500'>*</span>
        </label>
        <select
          name='materia'
          value={formData.materia}
          onChange={handleInputChange}
          className={`w-full text-foreground-secondary font-bold cursor-pointer px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:border-[#FFDD00] transition-all duration-200 ${
            errors.materia ? 'border-red-300 bg-red-900/10' : 'border-primary/30 bg-black/20'
          }`}
        >
          <option value=''>Selecciona una materia</option>
          {subjects.map((materia) => (
            <option
              key={materia}
              value={materia}
              style={{ backgroundColor: 'black', color: 'white', fontWeight: 'bold' }}
            >
              {materia}
            </option>
          ))}
        </select>
        {errors.materia && (
          <div className='flex items-center mt-2 text-red-600'>
            <IconAlertCircle size={16} className='fill-red-600 mr-2' />
            <span className='text-sm'>{errors.materia}</span>
          </div>
        )}
      </div>

      {/* Tipo de Aporte */}
      <div>
        <label className='block text-sm font-semibold text-foreground mb-3'>
          Tipo de aporte <span className='text-red-500'>*</span>
        </label>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {tiposAporte.map((tipo) => (
            <label
              key={tipo.value}
              className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.tipoAporte === tipo.value
                  ? 'border-[#FFDD00] bg-[#FFDD00]/10'
                  : 'border-primary/30 bg-black/20 hover:border-gray-400'
              }`}
            >
              <input
                type='radio'
                name='tipoAporte'
                value={tipo.value}
                checked={formData.tipoAporte === tipo.value}
                onChange={handleInputChange}
                className='sr-only'
              />
              <div
                className={`w-5 h-5 text-foreground-secondary font-bold rounded-full border mr-3 flex items-center justify-center ${
                  formData.tipoAporte === tipo.value
                    ? 'border-[#FFDD00] bg-[#FFDD00]'
                    : 'border-primary/30'
                }`}
              >
                {formData.tipoAporte === tipo.value && (
                  <div className='w-2 h-2 bg-black rounded-full'></div>
                )}
              </div>
              <span className='font-medium text-foreground'>{tipo.label}</span>
            </label>
          ))}
        </div>
        {errors.tipoAporte && (
          <div className='flex items-center mt-2 text-red-600'>
            <IconAlertCircle size={16} className='fill-red-600 mr-2' />
            <span className='text-sm'>{errors.tipoAporte}</span>
          </div>
        )}
      </div>

      {/* Título */}
      <div>
        <label className='block text-sm font-semibold text-foreground mb-3'>
          Título del aporte <span className='text-red-500'>*</span>
        </label>
        <input
          type='text'
          name='titulo'
          value={formData.titulo}
          onChange={handleInputChange}
          placeholder='Ej: Resumen completo de límites y continuidad'
          className={`w-full text-foreground-secondary font-bold px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:border-[#FFDD00] transition-all duration-200 ${
            errors.titulo ? 'border-red-300 bg-red-900/10' : 'border-primary/30 bg-black/20'
          }`}
        />
        {errors.titulo && (
          <div className='flex items-center mt-2 text-red-600'>
            <IconAlertCircle size={16} className='fill-red-600 mr-2' />
            <span className='text-sm'>{errors.titulo}</span>
          </div>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className='block text-sm font-semibold text-foreground mb-3'>
          Descripción (opcional)
        </label>
        <textarea
          name='descripcion'
          value={formData.descripcion}
          onChange={handleInputChange}
          rows={4}
          placeholder='Describe brevemente el contenido del aporte...'
          className='w-full text-foreground-secondary font-bold px-4 py-3 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:border-[#FFDD00] transition-all duration-200 bg-black/20 resize-none'
        />
      </div>

      {/* Archivo */}
      <div>
        <label className='block text-sm font-semibold text-foreground mb-3'>
          Archivo <span className='text-red-500'>*</span>
        </label>
        <div
          className={`relative  text-foreground-secondary font-bold border border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            errors.archivo
              ? 'border-red-300 bg-red-900/10'
              : 'border-primary/30 bg-black/20 hover:border-[#FFDD00] hover:bg-[#FFDD00]/5'
          }`}
        >
          <input
            type='file'
            name='archivo'
            onChange={handleFileChange}
            accept='.pdf,.jpg,.jpeg,.png'
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
          />
          <div className='flex flex-col items-center'>
            <div className='w-12 h-12 bg-yellow-900/35 border border-yellow-500 rounded-xl flex items-center justify-center mb-4'>
              <IconDocument size={24} className=' fill-yellow-500' />
            </div>
            {formData.archivo ? (
              <div>
                <p className='text-sm font-medium text-foreground mb-1'>{formData.archivo.name}</p>
                <p className='text-xs text-gray-500'>
                  {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                </p>
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
        {errors.archivo && (
          <div className='flex items-center mt-2 text-red-600'>
            <IconAlertCircle size={16} className='fill-red-600 mr-2' />
            <span className='text-sm'>{errors.archivo}</span>
          </div>
        )}
      </div>

      {/* Autor */}
      <div>
        <label className='block text-sm font-semibold text-foreground mb-3'>
          Nombre del autor (opcional)
        </label>
        <input
          type='text'
          name='autor'
          value={formData.autor}
          onChange={handleInputChange}
          placeholder='Tu nombre o seudónimo'
          className='w-full text-foreground-secondary font-bold px-4 py-3 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:border-[#FFDD00] transition-all duration-200 bg-black/20'
        />
      </div>

      <ReCAPTCHA
        sitekey={SITE_KEY_CAPTCHA}
        theme='dark'
        onChange={(token) => setCaptchaToken(token)}
      />

      {errors.captcha && (
        <div className='flex items-center mb-4 text-red-600'>
          <IconAlertCircle size={16} className='fill-red-600 mr-2' />
          <span className='text-sm'>{errors.captcha}</span>
        </div>
      )}
      {/* Submit Button */}
      <div className='pt-6'>
        {uploadError && (
          <div className='flex items-center mb-4 text-red-600'>
            <IconAlertCircle size={16} className='fill-red-600 mr-2' />
            <span className='text-sm'>{uploadError}</span>
          </div>
        )}
        <button
          type='submit'
          disabled={uploading}
          className='cursor-pointer w-full bg-gradient-to-r from-[#FFDD00] to-[#FFCC00] text-black font-bold py-4 rounded-xl hover:from-[#FFCC00] hover:to-[#FFB800] focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center'
        >
          {!uploading && <IconDownload size={20} className=' mr-2' />}
          {uploading ? (
            <span className='flex items-center gap-2'>
              <svg className='animate-spin' width='20' height='20' viewBox='0 0 24 24'>
                <g fill='#000000'>
                  <path
                    fillRule='evenodd'
                    d='M12 19a7 7 0 1 0 0-14a7 7 0 0 0 0 14m0 3c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10'
                    clipRule='evenodd'
                    opacity='.2'
                  />
                  <path d='M2 12C2 6.477 6.477 2 12 2v3a7 7 0 0 0-7 7z' />
                </g>
              </svg>
              Subiendo archivo
            </span>
          ) : (
            'Enviar Aporte'
          )}
        </button>
      </div>
    </form>
  </div>
);

export default UploadForm;
