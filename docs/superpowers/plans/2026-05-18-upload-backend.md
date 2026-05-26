# Upload Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** Plan `2026-05-18-auth-feature.md` must be complete — `src/features/auth/` and `api.ts` auth functions must exist.

**Goal:** Rewire the upload feature to POST directly to `POST /api/v1/resources` with a JWT token, adding jsPDF image-to-PDF conversion and removing the Google Drive/reCAPTCHA flow.

**Architecture:** `useUploadForm` is fully rewritten to use `api.uploadResource()` and `useAuth().token`. `FileInput` gets a PDF/Images mode toggle. `SelectInput` updated to accept `{ value, label }[]`. New `UploadFormState` type replaces old `FormData`. `jspdf` added as dependency, `react-google-recaptcha` removed.

**Tech Stack:** React 19, TypeScript strict, `jspdf`, Tailwind v4, `@/` alias

---

## File Map

**Modified:**
- `package.json` — add `jspdf`, remove `react-google-recaptcha` + `@types/react-google-recaptcha`
- `src/shared/services/api.ts` — add `Resource` type + `uploadResource` function
- `src/features/upload/types/form.ts` — rewrite with new `UploadFormState`, `UploadFormErrors`, `UploadFormProps`
- `src/features/upload/components/SelectInput.tsx` — options: `string[]` → `{ value, label }[]`
- `src/features/upload/components/FileInput.tsx` — full rewrite with PDF/Images modes
- `src/features/upload/hooks/useUploadForm.ts` — full rewrite

---

## Task 1: Deps

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install jspdf**

```bash
pnpm add jspdf
```

- [ ] **Step 2: Remove recaptcha**

```bash
pnpm remove react-google-recaptcha @types/react-google-recaptcha
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "deps: add jspdf, remove react-google-recaptcha"
```

---

## Task 2: Resource type + uploadResource in api.ts

**Files:**
- Modify: `src/shared/services/api.ts`

- [ ] **Step 1: Add Resource export type after the existing BackendResource type (around line 63)**

```ts
export type Resource = {
  id: string;
  subjectId: string;
  title: string;
  type: 'resumen' | 'parcial' | 'final';
  status: 'pending' | 'published' | 'rejected';
  examDate: string | null;
  period: string | null;
  notes: string | null;
  downloadCount: number;
  publishedAt: string | null;
  createdAt: string;
  fileUrl: string | null;
};
```

- [ ] **Step 2: Add uploadResource at end of api.ts**

```ts
export async function uploadResource(
  data: {
    subjectId: string;
    type: string;
    file: File;
    period?: string;
    notes?: string;
  },
  token: string
): Promise<ApiResult<Resource>> {
  try {
    const form = new FormData();
    form.append('file', data.file);
    form.append('subjectId', data.subjectId);
    form.append('type', data.type);
    if (data.period) form.append('period', data.period);
    if (data.notes) form.append('notes', data.notes);

    const response = await fetch(`${BASE_URL}/api/v1/resources`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
    const json: Resource = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : 'Unknown error uploading resource' };
  }
}
```

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/shared/services/api.ts
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(api): add Resource type + uploadResource"
```

---

## Task 3: Upload form types

**Files:**
- Modify: `src/features/upload/types/form.ts`

- [ ] **Step 1: Rewrite form.ts**

`src/features/upload/types/form.ts`:
```ts
export interface UploadFormState {
  subjectId: string;
  type: 'resumen' | 'parcial' | 'final' | '';
  period: string;
  notes: string;
  file: File | null;
  imageFiles: File[];
  fileMode: 'pdf' | 'images';
}

export interface UploadFormErrors {
  subjectId?: string;
  type?: string;
  file?: string;
}

export interface UploadFormProps {
  formData: UploadFormState;
  errors: UploadFormErrors;
  subjects: { value: string; label: string }[];
  tiposRecurso: { value: string; label: string }[];
  uploading: boolean;
  uploadError: string | undefined;
  onSubjectChange: (subjectId: string) => void;
  onTypeChange: (type: string) => void;
  onPeriodChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onImagesChange: (files: File[]) => void;
  onFileModeChange: (mode: 'pdf' | 'images') => void;
  onSubmit: (e: React.FormEvent) => void;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/upload/types/form.ts
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(upload): rewrite form types for REST API flow"
```

---

## Task 4: SelectInput — support `{ value, label }[]`

**Files:**
- Modify: `src/features/upload/components/SelectInput.tsx`

- [ ] **Step 1: Update interface and render**

`src/features/upload/components/SelectInput.tsx`:
```tsx
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';
import ErrorMessage from './ErrorMessage';

interface SelectInputProps {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  error?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  value,
  onValueChange,
  options,
  placeholder,
  error,
}) => (
  <>
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger
        className={cn(
          'w-full rounded-xl border border-primary/30 bg-black/20 px-4 py-3 h-auto font-bold text-foreground-secondary focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff] transition-all duration-200',
          error && 'border-red-300 bg-red-900/10'
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className='bg-zinc-900 border border-zinc-700 rounded-xl'>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className='text-white font-bold focus:bg-zinc-700 cursor-pointer'
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <ErrorMessage message={error} />
  </>
);

export default SelectInput;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/upload/components/SelectInput.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "refactor(upload): SelectInput accepts {value,label}[] options"
```

---

## Task 5: FileInput renovation

**Files:**
- Modify: `src/features/upload/components/FileInput.tsx`

- [ ] **Step 1: Rewrite FileInput**

`src/features/upload/components/FileInput.tsx`:
```tsx
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
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              fileMode === mode
                ? 'bg-[#0084ff] text-white'
                : 'bg-black/20 text-foreground-secondary hover:bg-black/40'
            }`}
          >
            {mode === 'pdf' ? 'PDF' : 'Imágenes'}
          </button>
        ))}
      </div>

      {fileMode === 'pdf' && (
        <div
          className={`relative border border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            error
              ? 'border-red-300 bg-red-900/10'
              : 'border-primary/30 bg-black/20 hover:border-[#0084ff] hover:bg-[#0084ff]/5'
          }`}
        >
          <input
            type='file'
            accept='.pdf'
            onChange={handlePdfChange}
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
          />
          <div className='flex flex-col items-center pointer-events-none'>
            <div className='w-12 h-12 bg-yellow-900/35 border border-yellow-500 rounded-xl flex items-center justify-center mb-4'>
              <IconDocument size={24} className='fill-yellow-500' />
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
            className={`relative border border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
              error
                ? 'border-red-300 bg-red-900/10'
                : 'border-primary/30 bg-black/20 hover:border-[#0084ff] hover:bg-[#0084ff]/5'
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
```

- [ ] **Step 2: Commit**

```bash
git add src/features/upload/components/FileInput.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(upload): renovate FileInput with PDF/Images modes"
```

---

## Task 6: useUploadForm rewrite

**Files:**
- Modify: `src/features/upload/hooks/useUploadForm.ts`

- [ ] **Step 1: Rewrite useUploadForm.ts**

`src/features/upload/hooks/useUploadForm.ts`:
```ts
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { uploadResource } from '@/shared/services/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UploadFormState, UploadFormErrors } from '../types/form';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const INITIAL_STATE: UploadFormState = {
  subjectId: '',
  type: '',
  period: '',
  notes: '',
  file: null,
  imageFiles: [],
  fileMode: 'pdf',
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Error cargando ${file.name}`)); };
    img.src = url;
  });
}

async function imagesToPdf(imageFiles: File[]): Promise<File> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  for (let i = 0; i < imageFiles.length; i++) {
    if (i > 0) doc.addPage();
    const img = await loadImage(imageFiles[i]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const pageRatio = pageW / pageH;
    let drawW: number, drawH: number, x: number, y: number;
    if (imgRatio > pageRatio) {
      drawW = pageW; drawH = pageW / imgRatio;
      x = 0; y = (pageH - drawH) / 2;
    } else {
      drawH = pageH; drawW = pageH * imgRatio;
      x = (pageW - drawW) / 2; y = 0;
    }
    doc.addImage(dataUrl, 'JPEG', x, y, drawW, drawH);
  }

  const blob = doc.output('blob');
  return new File([blob], 'imagenes.pdf', { type: 'application/pdf' });
}

export function useUploadForm() {
  const { token, logout } = useAuth();
  const [formData, setFormData] = useState<UploadFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<UploadFormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);

  const updateField = <K extends keyof UploadFormState>(key: K, value: UploadFormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: UploadFormErrors = {};
    if (!formData.subjectId) newErrors.subjectId = 'Selecciona una materia';
    if (!formData.type) newErrors.type = 'Selecciona el tipo de recurso';
    if (formData.fileMode === 'pdf' && !formData.file) newErrors.file = 'Seleccioná un archivo PDF';
    if (formData.fileMode === 'images' && formData.imageFiles.length === 0) newErrors.file = 'Agregá al menos una imagen';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(undefined);
    if (!validate() || !token) return;

    setUploading(true);
    try {
      let finalFile: File;

      if (formData.fileMode === 'images') {
        finalFile = await imagesToPdf(formData.imageFiles);
        if (finalFile.size > MAX_FILE_SIZE) {
          setErrors((prev) => ({ ...prev, file: 'El PDF generado supera los 20 MB. Reducí la cantidad de imágenes.' }));
          setUploading(false);
          return;
        }
      } else {
        finalFile = formData.file!;
      }

      const result = await uploadResource(
        {
          subjectId: formData.subjectId,
          type: formData.type,
          file: finalFile,
          period: formData.period || undefined,
          notes: formData.notes || undefined,
        },
        token
      );

      if (result.error) {
        if (result.error.includes('401')) {
          logout();
          window.location.href = '/login?redirect=/upload';
          return;
        }
        setUploadError(result.error);
        return;
      }

      setShowSuccess(true);
      setFormData(INITIAL_STATE);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir el recurso');
    } finally {
      setUploading(false);
    }
  };

  return {
    formData,
    errors,
    showSuccess,
    uploading,
    uploadError,
    onSubjectChange: (v: string) => updateField('subjectId', v),
    onTypeChange: (v: string) => updateField('type', v as UploadFormState['type']),
    onPeriodChange: (v: string) => updateField('period', v),
    onNotesChange: (v: string) => updateField('notes', v),
    onFileChange: (f: File | null) => updateField('file', f),
    onImagesChange: (files: File[]) => updateField('imageFiles', files),
    onFileModeChange: (mode: 'pdf' | 'images') => updateField('fileMode', mode),
    handleSubmit,
    closeSuccess: () => setShowSuccess(false),
  };
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build
```

Expected: clean build. TypeScript may warn about unused old imports in `UploadSection.tsx` — those get fixed in plan 3.

- [ ] **Step 3: Commit**

```bash
git add src/features/upload/hooks/useUploadForm.ts
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(upload): rewrite useUploadForm with REST API + jsPDF"
```
