import React from 'react';
import ErrorMessage from './ErrorMessage';
import TextInput from './TextInput';
import TextAreaInput from './TextAreaInput';
import FormField from './FormField';
import FileInput from './FileInput';
import RadioGroupInput from './RadioGroupInput';
import SelectInput from './SelectInput';
import SubmitButton from './SubmitButton';
import type { UploadFormProps } from '../types/form';

const UploadForm: React.FC<UploadFormProps> = ({
  formData,
  errors,
  subjects,
  tiposRecurso,
  uploading,
  uploadError,
  onSubjectChange,
  onTypeChange,
  onPeriodChange,
  onNotesChange,
  onFileChange,
  onImagesChange,
  onFileModeChange,
  onSubmit,
}) => (
  <div className='bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 rounded-xl shadow-sm border gradient-border p-6'>
    <form onSubmit={onSubmit} className='space-y-8'>
      <FormField label='Materia' required>
        <SelectInput
          name='subjectId'
          value={formData.subjectId}
          onValueChange={onSubjectChange}
          options={subjects}
          placeholder='Selecciona una materia'
          error={errors.subjectId}
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

      <FormField label='Período'>
        <TextInput
          name='period'
          value={formData.period}
          onChange={(e) => onPeriodChange(e.target.value)}
          placeholder='Ej: 1C 2024, Final Feb 2024'
        />
      </FormField>

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
        <FileInput
          fileMode={formData.fileMode}
          onFileModeChange={onFileModeChange}
          file={formData.file}
          onFileChange={onFileChange}
          imageFiles={formData.imageFiles}
          onImagesChange={onImagesChange}
          error={errors.file}
        />
      </FormField>

      <div className='pt-6'>
        <ErrorMessage message={uploadError} />
        <SubmitButton
          uploadError={uploadError}
          errors={errors}
          isSubmitting={uploading}
          text='Enviar Recurso'
          submittingText='Subiendo...'
        />
      </div>
    </form>
  </div>
);

export default UploadForm;
