# Upload — Plan Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar selector de plan (CareerPlan) al form de upload, con flujo Carrera → Plan → Materia, auto-seleccionando si hay un solo plan.

**Architecture:** El plan se carga desde un nuevo endpoint público `/api/v1/career-plans?careerId=X`. Las materias se cargan igual que antes por careerId, pero se filtran client-side por planId. El planId no se envía al backend al subir el recurso — solo sirve para filtrar materias en el form.

**Tech Stack:** React 19, TypeScript strict, Astro 5, Tailwind v4, shadcn/ui. Sin framework de testing — verificación con `pnpm build`.

---

## Files

- Modify: `src/shared/services/api.ts` — agregar `CareerPlan` type + `getCareerPlans()`
- Modify: `src/features/upload/types/form.ts` — agregar `planId` a state, errors y props
- Modify: `src/features/upload/hooks/useUploadForm.ts` — agregar `planId` al estado inicial y al reset de carrera
- Modify: `src/features/upload/components/UploadSection.tsx` — cargar planes, filtrar materias por plan, auto-select
- Modify: `src/features/upload/components/UploadForm.tsx` — agregar SelectInput de plan

---

### Task 1: Agregar `CareerPlan` y `getCareerPlans` a `api.ts`

**Files:**
- Modify: `src/shared/services/api.ts`

- [ ] **Agregar tipo `CareerPlan` junto a los otros tipos exportados** (después de `Faculty`):

```ts
export type CareerPlan = {
  id: string;
  careerId: string;
  name: string;
  year: number;
};
```

- [ ] **Agregar función `getCareerPlans` después de `getCareers`:**

```ts
export function getCareerPlans(careerId: string): Promise<ApiResult<CareerPlan[]>> {
  const url = new URL(`${BASE_URL}/api/v1/career-plans`);
  url.searchParams.set('careerId', careerId);
  const key = url.toString();
  return withCache(key, async () => {
    try {
      const response = await fetch(key);
      if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
      const json: { data: Array<{ id: string; careerId: string; name: string; year: number; createdAt: string }> } = await response.json();
      return { data: json.data.map(({ id, careerId, name, year }) => ({ id, careerId, name, year })), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error fetching career plans' };
    }
  });
}
```

- [ ] **Commit:**
```bash
git add src/shared/services/api.ts
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(api): add CareerPlan type and getCareerPlans function"
```

---

### Task 2: Actualizar tipos del form

**Files:**
- Modify: `src/features/upload/types/form.ts`

- [ ] **Agregar `planId: string` a `UploadFormState`** (después de `careerId`):

```ts
export interface UploadFormState {
  careerId: string;
  planId: string;
  subjectId: string;
  type: 'resumen' | 'parcial' | 'final' | '';
  period: string;
  notes: string;
  file: File | null;
  imageFiles: File[];
  fileMode: 'pdf' | 'images';
}
```

- [ ] **Agregar `planId?: string` a `UploadFormErrors`:**

```ts
export interface UploadFormErrors {
  careerId?: string;
  planId?: string;
  subjectId?: string;
  type?: string;
  file?: string;
}
```

- [ ] **Agregar `plans` y `onPlanChange` a `UploadFormProps`** (después de `careers` y `onCareerChange`):

```ts
export interface UploadFormProps {
  formData: UploadFormState;
  errors: UploadFormErrors;
  careers: { value: string; label: string }[];
  plans: { value: string; label: string }[];
  subjects: { value: string; label: string }[];
  tiposRecurso: { value: string; label: string }[];
  uploading: boolean;
  uploadError: string | undefined;
  onCareerChange: (careerId: string) => void;
  onPlanChange: (planId: string) => void;
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

- [ ] **Commit:**
```bash
git add src/features/upload/types/form.ts
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(upload): add planId to form types"
```

---

### Task 3: Actualizar `useUploadForm`

**Files:**
- Modify: `src/features/upload/hooks/useUploadForm.ts`

- [ ] **Agregar `planId: ''` a `INITIAL_STATE`** (después de `careerId`):

```ts
const INITIAL_STATE: UploadFormState = {
  careerId: '',
  planId: '',
  subjectId: '',
  type: '',
  period: '',
  notes: '',
  file: null,
  imageFiles: [],
  fileMode: 'pdf',
};
```

- [ ] **Actualizar `onCareerChange` para resetear `planId` y `subjectId`:**

```ts
onCareerChange: (v: string) => {
  setFormData((prev) => ({ ...prev, careerId: v, planId: '', subjectId: '' }));
  setErrors((prev) => ({ ...prev, careerId: undefined, planId: undefined, subjectId: undefined }));
},
```

- [ ] **Agregar `onPlanChange` en el return** (después de `onCareerChange`):

```ts
onPlanChange: (v: string) => {
  setFormData((prev) => ({ ...prev, planId: v, subjectId: '' }));
  setErrors((prev) => ({ ...prev, planId: undefined, subjectId: undefined }));
},
```

- [ ] **Commit:**
```bash
git add src/features/upload/hooks/useUploadForm.ts
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(upload): add planId state and onPlanChange to useUploadForm"
```

---

### Task 4: Actualizar `UploadSection`

**Files:**
- Modify: `src/features/upload/components/UploadSection.tsx`

- [ ] **Actualizar imports** — agregar `getCareerPlans` y `Subject`:

```ts
import { getCareers, getSubjects, getCareerPlans } from '@/shared/services/api';
import type { Subject } from '@/features/home/types/subjects';
```

- [ ] **Agregar estado para `plans` y `allSubjects`** (junto a los useState existentes):

```ts
const [careers, setCareers] = useState<{ value: string; label: string }[]>([]);
const [plans, setPlans] = useState<{ value: string; label: string }[]>([]);
const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
const [subjects, setSubjects] = useState<{ value: string; label: string }[]>([]);
```

- [ ] **Reemplazar el useEffect de subjects** con dos efectos separados:

```ts
// Cargar planes + materias raw cuando cambia la carrera
useEffect(() => {
  if (!formData.careerId) {
    setPlans([]);
    setAllSubjects([]);
    setSubjects([]);
    return;
  }
  getCareerPlans(formData.careerId).then(({ data }) => {
    const mapped = data.map((p) => ({ value: p.id, label: p.name }));
    setPlans(mapped);
    if (mapped.length === 1) onPlanChange(mapped[0].value);
  });
  getSubjects({ careerId: formData.careerId }).then(({ data }) => {
    setAllSubjects(data);
  });
}, [formData.careerId]);

// Filtrar materias client-side cuando cambia el plan
useEffect(() => {
  if (!formData.planId) {
    setSubjects([]);
    return;
  }
  const filtered = allSubjects
    .filter((s) => s.careers.some((c) => c.planId === formData.planId))
    .map((s) => ({ value: s.id, label: s.title }));
  setSubjects(filtered);
}, [formData.planId, allSubjects]);
```

Nota: `onPlanChange` se obtiene del hook `useUploadForm` en la desestructuración.

- [ ] **Actualizar la desestructuración del hook** para incluir `onPlanChange`:

```ts
const {
  formData,
  errors,
  showSuccess,
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
  handleSubmit,
  closeSuccess,
} = useUploadForm();
```

- [ ] **Pasar `plans` y `onPlanChange` a `UploadForm`:**

```tsx
<UploadForm
  formData={formData}
  errors={errors}
  careers={careers}
  plans={plans}
  subjects={subjects}
  tiposRecurso={tiposRecurso}
  uploading={uploading}
  uploadError={uploadError}
  onCareerChange={onCareerChange}
  onPlanChange={onPlanChange}
  onSubjectChange={onSubjectChange}
  onTypeChange={onTypeChange}
  onPeriodChange={onPeriodChange}
  onNotesChange={onNotesChange}
  onFileChange={onFileChange}
  onImagesChange={onImagesChange}
  onFileModeChange={onFileModeChange}
  onSubmit={handleSubmit}
/>
```

- [ ] **Commit:**
```bash
git add src/features/upload/components/UploadSection.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(upload): load and filter plans in UploadSection, auto-select single plan"
```

---

### Task 5: Actualizar `UploadForm`

**Files:**
- Modify: `src/features/upload/components/UploadForm.tsx`

- [ ] **Agregar `plans` y `onPlanChange` a la desestructuración de props:**

```tsx
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
```

- [ ] **Agregar `FormField` de plan entre Carrera y Materia:**

```tsx
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
```

- [ ] **Verificar build:**
```bash
pnpm build
```
Esperado: sin errores de TypeScript ni de build.

- [ ] **Commit:**
```bash
git add src/features/upload/components/UploadForm.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(upload): add plan selector to UploadForm"
```
