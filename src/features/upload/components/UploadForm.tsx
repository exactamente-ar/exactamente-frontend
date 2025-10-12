import ReCAPTCHA from 'react-google-recaptcha';
import ErrorMessage from './ErrorMessage';
import TextInput from './TextInput';
import FormField from './FormField';
import FileInput from './FileInput';
import TextAreaInput from './TextAreaInput';
import RadioGroupInput from './RadioGroupInput';
import SelectInput from './SelectInput';
import SubmitButton from './SubmitButton';
import type { UploadFormProps } from '../types/form';

const SITE_KEY_CAPTCHA = '6LfCHpArAAAAAMeI_zqp5XSn2IiGqklXaN4V2VEz';


const UploadForm = ({
  formData,
  errors,
  handleInputChange,
  handleFileChange,
  handleSubmit,
  uploading,
  uploadError,
  subjects,
  tiposRecurso,
  setCaptchaToken,
}: UploadFormProps) => {
  return (
    <div className='bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 rounded-xl shadow-sm border gradient-border  p-6'>
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

        <FormField label='Tipo de Recurso' required>
          <RadioGroupInput
            name='tipoRecurso'
            value={formData.tipoRecurso}
            onChange={handleInputChange}
            options={tiposRecurso}
            error={errors.tipoRecurso}
          />
        </FormField>

        <FormField label='Título del Recurso' required>
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
            placeholder='Describe brevemente el contenido del Recurso...'
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
            uploadError={uploadError}
            errors={errors}
            isSubmitting={uploading}
            text='Enviar Recurso'
            submittingText='Subiendo archivo...'
          />
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
