# Upload Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisites:**
- Plan `2026-05-18-auth-feature.md` complete — `AuthProvider`, `AuthGuard` exist
- Plan `2026-05-18-upload-backend.md` complete — new `UploadFormState`, `UploadFormProps`, `FileInput`, `useUploadForm` exist

**Goal:** Wire the renovated upload UI to the new backend flow — update `UploadForm` with new fields, update `SuccessModal` text, wrap `UploadSection` with `AuthProvider` + `AuthGuard`, and do a final cleanup build.

**Tech Stack:** React 19, TypeScript strict, Tailwind v4, `@/` alias

---

## File Map

**Modified:**
- `src/features/upload/components/UploadForm.tsx` — remove title/captcha, add period/notes, new prop interface
- `src/features/upload/components/SuccesModal.tsx` — update text
- `src/features/upload/components/UploadSection.tsx` — AuthProvider + AuthGuard wrap, new subject shape, new hook API

---

## Task 1: UploadForm renovation

**Files:**
- Modify: `src/features/upload/components/UploadForm.tsx`
- Read first: `src/features/upload/components/FormField.tsx` (check if it has a `description` prop)

- [ ] **Step 1: Read FormField to check available props**

Read `src/features/upload/components/FormField.tsx`.

- [ ] **Step 2: Rewrite UploadForm.tsx**

`src/features/upload/components/UploadForm.tsx`:
```tsx
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
```

> **Note on SubmitButton:** The `errors` prop type changed from the old specific keys to `UploadFormErrors`. Read `SubmitButton.tsx` — if it types `errors` strictly (e.g. requires `captcha` key), update the prop type to `Record<string, string | undefined>` in `SubmitButton.tsx` as well.

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Fix any TypeScript errors from SubmitButton or FormField prop type mismatches before committing.

- [ ] **Step 4: Commit**

```bash
git add src/features/upload/components/UploadForm.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(upload): renovate UploadForm - remove captcha/title, add period/notes"
```

---

## Task 2: SuccessModal text

**Files:**
- Modify: `src/features/upload/components/SuccesModal.tsx`

- [ ] **Step 1: Update DialogTitle and DialogDescription**

In `SuccesModal.tsx`, change:

```tsx
// Old
<DialogTitle className='text-2xl font-bold text-foreground'>
  !Recurso enviado!
</DialogTitle>
<DialogDescription className='text-foreground-secondary'>
  Tu recurso ha sido enviado exitosamente. Sera revisado y publicado pronto.
</DialogDescription>
```

to:

```tsx
// New
<DialogTitle className='text-2xl font-bold text-foreground'>
  ¡Recurso enviado!
</DialogTitle>
<DialogDescription className='text-foreground-secondary'>
  Tu recurso fue enviado y está pendiente de revisión. Lo publicaremos a la brevedad.
</DialogDescription>
```

- [ ] **Step 2: Commit**

```bash
git add src/features/upload/components/SuccesModal.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "fix(upload): update SuccessModal text to pending review"
```

---

## Task 3: UploadSection with AuthGuard

**Files:**
- Modify: `src/features/upload/components/UploadSection.tsx`

- [ ] **Step 1: Rewrite UploadSection.tsx**

`src/features/upload/components/UploadSection.tsx`:
```tsx
import { useUploadForm } from '@/features/upload/hooks/useUploadForm';
import SuccessModal from './SuccesModal';
import UploadForm from './UploadForm';
import { useEffect, useState } from 'react';
import { getSubjects } from '@/shared/services/api';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { AuthGuard } from '@/features/auth/components/AuthGuard';

const tiposRecurso = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'final', label: 'Final' },
];

function UploadSectionInner() {
  const {
    formData,
    errors,
    showSuccess,
    uploading,
    uploadError,
    onSubjectChange,
    onTypeChange,
    onPeriodChange,
    onNotesChange,
    onFileChange,
    onImagesChange,
    onFileModeChange,
    handleSubmit,
    closeSuccess,
  } = useUploadForm();

  const [subjects, setSubjects] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const skeleton = document.getElementById('upload-skeleton');
    if (skeleton) skeleton.style.display = 'none';
  }, []);

  useEffect(() => {
    getSubjects().then(({ data }) => {
      setSubjects(data.map((s) => ({ value: s.id, label: s.title })));
    });
  }, []);

  return (
    <>
      <SuccessModal showSuccess={showSuccess} closeSuccess={closeSuccess} />
      <div className='max-w-4xl mx-auto pt-12'>
        <UploadForm
          formData={formData}
          errors={errors}
          subjects={subjects}
          tiposRecurso={tiposRecurso}
          uploading={uploading}
          uploadError={uploadError}
          onSubjectChange={onSubjectChange}
          onTypeChange={onTypeChange}
          onPeriodChange={onPeriodChange}
          onNotesChange={onNotesChange}
          onFileChange={onFileChange}
          onImagesChange={onImagesChange}
          onFileModeChange={onFileModeChange}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
}

export default function UploadSection() {
  return (
    <AuthProvider>
      <AuthGuard>
        <UploadSectionInner />
      </AuthGuard>
    </AuthProvider>
  );
}
```

- [ ] **Step 2: Final build check**

```bash
pnpm build
```

Expected: completely clean build, no TypeScript errors or warnings.

- [ ] **Step 3: Check for leftover recaptcha/drive references**

```bash
grep -r "RECAPTCHA\|GOOGLE_SCRIPT\|react-google-recaptcha\|uploadFileToDrive\|convertFileToBase64" src/
```

Expected: no results. If any found, remove them.

- [ ] **Step 4: Commit**

```bash
git add src/features/upload/components/UploadSection.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(upload): wrap UploadSection with AuthProvider + AuthGuard"
```
