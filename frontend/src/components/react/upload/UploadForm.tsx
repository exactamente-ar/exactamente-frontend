import ReCAPTCHA from 'react-google-recaptcha';
import ErrorMessage from './ErrorMessage';
import TextInput from './TextInput';
import FormField from './FormField';
import FileInput from './FileInput';
import TextAreaInput from './TextAreaInput';
import RadioGroupInput from './RadioGroupInput';
import SelectInput from './SelectInput';
import SubmitButton from './SubmitButton';

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
  setCaptchaToken,
}: UploadFormProps) => {
  return (
    <div className='bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 rounded-xl shadow-sm border border-border/60 p-6'>
      <form onSubmit={(e) => handleSubmit(() => {})(e)} className='space-y-8'>
        <FormField label='Materia' required>
          <SelectInput
            name='materia'
            value={formData.materia}
            onChange={handleInputChange}
            options={subjects}
            placeholder='Selecciona una materia'
            error={errors.materia}
          />
        </FormField>

        <FormField label='Tipo de aporte' required>
          <RadioGroupInput
            name='tipoAporte'
            value={formData.tipoAporte}
            onChange={handleInputChange}
            options={tiposAporte}
            error={errors.tipoAporte}
          />
        </FormField>

        <FormField label='Título del aporte' required>
          <TextInput
            name='titulo'
            value={formData.titulo}
            onChange={handleInputChange}
            placeholder='Ej: Resumen completo de límites y continuidad'
            error={errors.titulo}
          />
        </FormField>

        <FormField label='Descripción (opcional)'>
          <TextAreaInput
            name='descripcion'
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder='Describe brevemente el contenido del aporte...'
          />
        </FormField>

        <FormField label='Archivo' required>
          <FileInput
            name='archivo'
            file={formData.archivo}
            onChange={handleFileChange}
            accept='.pdf,.jpg,.jpeg,.png'
            error={errors.archivo}
          />
        </FormField>

        <FormField label='Nombre del autor (opcional)'>
          <TextInput
            name='autor'
            value={formData.autor}
            onChange={handleInputChange}
            placeholder='Tu nombre o seudónimo'
          />
        </FormField>

        <div>
          <ReCAPTCHA
            sitekey={SITE_KEY_CAPTCHA}
            theme='dark'
            onChange={(token) => setCaptchaToken(token)}
          />
          <ErrorMessage message={errors.captcha} />
        </div>

        <div className='pt-6'>
          <ErrorMessage message={uploadError} />
          <SubmitButton
            isSubmitting={uploading}
            text='Enviar Aporte'
            submittingText='Subiendo archivo...'
          />
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
