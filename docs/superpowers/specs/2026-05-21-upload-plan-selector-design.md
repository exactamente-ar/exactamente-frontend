---
title: Upload — Selector de Plan
date: 2026-05-21
status: approved
---

# Upload — Selector de Plan

## Contexto

El form de upload permite subir recursos universitarios. Actualmente el flujo es:
**Carrera → Materia → Tipo → Período → Notas → Archivo**

Las materias pertenecen a una carrera a través de un plan (`CareerPlan`), con jerarquía
`Career → CareerPlan → Subject`. Sin el plan, el selector de materias puede mostrar
materias de planes distintos mezcladas.

## Flujo nuevo

**Carrera → Plan → Materia → Tipo → Período → Notas → Archivo**

- Seleccionar carrera → carga planes de esa carrera → resetea planId y subjectId
- Seleccionar plan → filtra materias client-side por planId → resetea subjectId
- Si la carrera tiene un solo plan → se auto-selecciona
- El selector de plan está disabled hasta que haya carrera seleccionada
- El selector de materia está disabled hasta que haya plan seleccionado

## Backend requerido

Nuevo endpoint público (lo implementa el usuario):

```
GET /api/v1/career-plans?careerId=<id>
Response: { data: CareerPlan[] }

CareerPlan {
  id: string
  careerId: string
  name: string   // ej: "Plan 2023"
  year: number
  createdAt: string
}
```

## Cambios frontend

### 1. `api.ts`

Agregar tipo y función:

```ts
export type CareerPlan = {
  id: string;
  careerId: string;
  name: string;
  year: number;
};

export function getCareerPlans(careerId: string): Promise<ApiResult<CareerPlan[]>>
// GET /api/v1/career-plans?careerId=X
// Usa withCache igual que getCareers
```

### 2. `src/features/upload/types/form.ts`

- `UploadFormState`: agregar `planId: string`
- `UploadFormErrors`: agregar `planId?: string`
- `UploadFormProps`: agregar `plans: { value: string; label: string }[]` y `onPlanChange: (planId: string) => void`

### 3. `src/features/upload/hooks/useUploadForm.ts`

- `INITIAL_STATE`: agregar `planId: ''`
- `onCareerChange`: resetear también `planId: ''` y `subjectId: ''`
- Agregar `onPlanChange: (v: string) => updateField('planId', v)` en el return

### 4. `src/features/upload/components/UploadSection.tsx`

```ts
const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
const [plans, setPlans]     = useState<{ value: string; label: string }[]>([]);
const [subjects, setSubjects] = useState<{ value: string; label: string }[]>([]);

// Al cambiar carrera: cargar planes + todas las materias de esa carrera
useEffect(() => {
  if (!formData.careerId) {
    setPlans([]); setAllSubjects([]); setSubjects([]);
    return;
  }
  getCareerPlans(formData.careerId).then(({ data }) => {
    const mapped = data.map((p) => ({ value: p.id, label: p.name }));
    setPlans(mapped);
    if (mapped.length === 1) onPlanChange(mapped[0].value); // auto-select
  });
  getSubjects({ careerId: formData.careerId }).then(({ data }) => {
    setAllSubjects(data);
  });
}, [formData.careerId]);

// Al cambiar plan: filtrar materias client-side
useEffect(() => {
  if (!formData.planId) { setSubjects([]); return; }
  const filtered = allSubjects
    .filter((s) => s.careers.some((c) => c.planId === formData.planId))
    .map((s) => ({ value: s.id, label: s.title }));
  setSubjects(filtered);
}, [formData.planId, allSubjects]);
```

Pasar `plans` y `onPlanChange` a `UploadForm`.

### 5. `src/features/upload/components/UploadForm.tsx`

Agregar `SelectInput` de plan entre Carrera y Materia:

```tsx
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
```

El `SelectInput` de Materia actualiza su `disabled` a `!formData.planId`.

## Validación

`planId` no es campo requerido en la validación de `useUploadForm` — no se envía al backend (el backend no lo acepta en el POST de recursos). Su función es únicamente filtrar las materias disponibles en el form.

## Notas

- La auto-selección de plan (cuando hay uno solo) se dispara en el efecto de carreras dentro de `UploadSection`, no en el hook, para mantener la separación datos/UI.
- No se agrega `planId` al payload de `uploadResource` — el backend no lo soporta actualmente.
- El filtrado de materias es client-side sobre los subjects ya cargados; no requiere fetch adicional al cambiar el plan.
