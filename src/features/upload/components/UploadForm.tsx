import React from 'react';
import ErrorMessage from './ErrorMessage';
import TextInput from './TextInput';
import TextAreaInput from './TextAreaInput';
import FormField from './FormField';
import FileInput from './FileInput';
import RadioGroupInput from './RadioGroupInput';
import SelectInput from './SelectInput';
import SubmitButton from './SubmitButton';
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton';
import type { UploadFormProps } from '../types/form';

const YEARS = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => {
  const y = 2026 - i;
  return { value: String(y), label: String(y) };
});

const DAYS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const SUBTYPES = [
  { value: 'parcial', label: 'Parcial' },
  { value: 'recuperatorio', label: 'Recuperatorio' },
  { value: 'prefinal', label: 'Pre-final' },
  { value: 'parcialito', label: 'Parcialito' },
];

const TOPICS = [
  { value: 'none', label: 'Sin tema' },
  { value: '1', label: 'Tema 1' },
  { value: '2', label: 'Tema 2' },
  { value: '3', label: 'Tema 3' },
  { value: '4', label: 'Tema 4' },
];

const UploadForm: React.FC<UploadFormProps> = ({
  formData,
  errors,
  careers,
  plans,
  subjects,
  tiposRecurso,
  uploading,
  uploadError,
  duplicateWarning,
  onCareerChange,
  onPlanChange,
  onSubjectChange,
  onTypeChange,
  onTitleChange,
  onSubtypeChange,
  onExamYearChange,
  onExamMonthChange,
  onExamDayChange,
  onTopicChange,
  onNotesChange,
  onFileChange,
  onImagesChange,
  onFileModeChange,
  onDuplicateConfirm,
  onSubmit,
  isAuthenticated,
  isAuthLoading,
}) => (
  <div className='bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 rounded-xl shadow-sm border gradient-border p-6'>
    <form onSubmit={onSubmit} className='space-y-8'>
      <FormField label='Carrera' required>
        <SelectInput
          name='careerId'
          value={formData.careerId}
          onValueChange={onCareerChange}
          options={careers}
          placeholder='Seleccioná una carrera'
          error={errors.careerId}
        />
      </FormField>

      <FormField label='Plan' required>
        <SelectInput
          name='planId'
          value={formData.planId}
          onValueChange={onPlanChange}
          options={plans}
          placeholder={formData.careerId ? 'Seleccioná un plan' : 'Primero seleccioná una carrera'}
          error={errors.planId}
          disabled={!formData.careerId}
        />
      </FormField>

      <FormField label='Materia' required>
        <SelectInput
          name='subjectId'
          value={formData.subjectId}
          onValueChange={onSubjectChange}
          options={subjects}
          placeholder={formData.planId ? 'Seleccioná una materia' : 'Primero seleccioná un plan'}
          error={errors.subjectId}
          disabled={!formData.planId}
        />
      </FormField>

      <FormField label='Tipo de Recurso' required>
        <RadioGroupInput
          name='type'
          value={formData.type}
          onChange={(e) => onTypeChange(e.target.value)}
          options={tiposRecurso}
          error={errors.type}
        />
      </FormField>

      {formData.type === 'resumen' && (
        <FormField label='Título' required>
          <TextInput
            name='title'
            value={formData.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder='Ej: Resumen Cálculo I'
            error={errors.title}
          />
        </FormField>
      )}

      {formData.type === 'parcial' && (
        <FormField label='Tipo de evaluación' required>
          <SelectInput
            name='subtype'
            value={formData.subtype}
            onValueChange={onSubtypeChange}
            options={SUBTYPES}
            placeholder='Seleccioná el tipo de evaluación'
            error={errors.subtype}
          />
        </FormField>
      )}

      <div className={`grid gap-4 ${formData.type === 'final' ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <FormField label='Año' required>
          <SelectInput
            name='examYear'
            value={formData.examYear}
            onValueChange={onExamYearChange}
            options={YEARS}
            placeholder='Seleccioná el año'
            error={errors.examYear}
          />
        </FormField>

        <FormField label='Mes' required>
          <SelectInput
            name='examMonth'
            value={formData.examMonth}
            onValueChange={onExamMonthChange}
            options={MONTHS}
            placeholder='Seleccioná el mes'
            error={errors.examMonth}
          />
        </FormField>

        {formData.type === 'final' && (
          <FormField label='Día' required>
            <SelectInput
              name='examDay'
              value={formData.examDay}
              onValueChange={onExamDayChange}
              options={DAYS}
              placeholder='Seleccioná el día'
              error={errors.examDay}
            />
          </FormField>
        )}
      </div>

      {(formData.type === 'parcial' || formData.type === 'final') && (
        <FormField label='Tema'>
          <SelectInput
            name='topic'
            value={formData.topic}
            onValueChange={onTopicChange}
            options={TOPICS}
            placeholder='Seleccioná el tema'
          />
        </FormField>
      )}

      <FormField label='Notas'>
        <TextAreaInput
          name='notes'
          value={formData.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder='Información adicional (opcional)'
          rows={3}
        />
      </FormField>

      <FormField label='Archivo' required>
        {isAuthLoading ? (
          <div className='flex justify-center py-6'>
            <div className='w-6 h-6 border-2 border-primary/30 border-t-white rounded-full animate-spin' />
          </div>
        ) : !isAuthenticated ? (
          <div className='rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-6 flex flex-col items-center gap-3 text-center'>
            <p className='text-sm text-zinc-400'>Iniciá sesión para poder adjuntar un archivo</p>
            <GoogleLoginButton onBeforeRedirect={() => {
              const { file, imageFiles, ...draft } = formData;
              localStorage.setItem('exactamente_upload_draft', JSON.stringify(draft));
            }} />
          </div>
        ) : (
          <FileInput
            fileMode={formData.fileMode}
            onFileModeChange={onFileModeChange}
            file={formData.file}
            onFileChange={onFileChange}
            imageFiles={formData.imageFiles}
            onImagesChange={onImagesChange}
            error={errors.file}
          />
        )}
      </FormField>

      {isAuthenticated && (
        <div className='pt-6'>
          {duplicateWarning?.hasSimilar && (
            <div className='mb-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-yellow-200'>
              <p className='text-sm font-semibold mb-2'>Ya existe un recurso similar en revisión o publicado. ¿Querés subirlo de todas formas?</p>
              <button
                type='button'
                onClick={onDuplicateConfirm}
                className='text-sm font-bold underline hover:text-yellow-100'
              >
                Subir de todas formas
              </button>
            </div>
          )}
          <ErrorMessage message={uploadError} />
          <SubmitButton
            uploadError={uploadError}
            errors={errors}
            isSubmitting={uploading}
            text='Enviar Recurso'
            submittingText='Subiendo...'
          />
        </div>
      )}
    </form>
  </div>
);

export default UploadForm;
