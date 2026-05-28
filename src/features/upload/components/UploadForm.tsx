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
  careers,
  plans,
  subjects,
  tiposRecurso,
  uploading,
  uploadError,
  onCareerChange,
  onPlanChange,
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
