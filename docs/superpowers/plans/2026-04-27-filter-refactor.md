# Filter Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el FilterBar plano por search bar + botón Filtros + panel cascada (dropdown/bottom sheet) + active tags removibles con sincronización de URL.

**Architecture:** Tres hooks especializados (`useFilterState`, `useFilterOptions`, `useSubjects` simplificado) compuestos en `SubjectsView`. El panel trabaja con estado draft que se aplica al presionar "Aplicar". Cuatro componentes nuevos (`FilterPanel`, `FilterCombobox`, `ActiveTags`) más la reescritura de `FilterBar`.

**Tech Stack:** React 19, Tailwind CSS v4, TypeScript strict, Astro 5. Sin librería de componentes — todo custom. Sin framework de tests — usar `pnpm build` para verificación de tipos y pasos de verificación manual en el navegador.

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/shared/services/api.ts` | Modificar | Agregar `University`, `Faculty`, `getUniversities`, `getFaculties`; actualizar `getCareers` |
| `src/features/home/types/filter.ts` | Reescribir | `DraftFilters`, `AppliedFilters`, `FilterOptions`, props actualizadas |
| `src/features/home/hooks/useFilterState.ts` | Crear | Estado draft/applied, cascada, URL sync, `removeFilter` |
| `src/features/home/hooks/useFilterOptions.ts` | Crear | Fetching en cascada de universidades/facultades/carreras |
| `src/features/home/hooks/useSubjects.ts` | Simplificar | Recibe `AppliedFilters`, solo fetching + paginación |
| `src/features/home/components/subjects/FilterCombobox.tsx` | Crear | Combobox reutilizable con búsqueda interna |
| `src/features/home/components/subjects/ActiveTags.tsx` | Crear | Tags removibles con reset en cascada |
| `src/features/home/components/subjects/FilterPanel.tsx` | Crear | Dropdown desktop + bottom sheet mobile |
| `src/features/home/components/subjects/FilterBar.tsx` | Reescribir | Compone panel + tags + search |
| `src/features/home/components/subjects/ListOfSubjects.tsx` | Modificar | Reemplazar `setFilters` por `onClearAll` |
| `src/features/home/components/subjects/SubjectsView.tsx` | Reescribir | Compone los tres hooks, construye `options` |

---

## Task 1: API layer — tipos y funciones nuevas

**Files:**
- Modify: `src/shared/services/api.ts`

- [ ] **Step 1: Agregar tipos backend + exportados para University y Faculty**

En `src/shared/services/api.ts`, después de la declaración de `BackendCareer` (línea 5), agregar:

```ts
type BackendUniversity = {
  id: string;
  name: string;
  createdAt: string;
};

type BackendFaculty = {
  id: string;
  universityId: string;
  name: string;
  createdAt: string;
};

export type University = {
  id: string;
  name: string;
};

export type Faculty = {
  id: string;
  name: string;
};
```

- [ ] **Step 2: Actualizar la firma de `getCareers` para aceptar `facultyId` opcional**

Reemplazar la función `getCareers` existente (líneas 93–106) con:

```ts
export async function getCareers(params?: { facultyId?: string }): Promise<ApiResult<Career[]>> {
  try {
    const url = new URL(`${BASE_URL}/api/v1/careers`);
    if (params?.facultyId) url.searchParams.set('facultyId', params.facultyId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      return { data: [], error: `Request failed with status ${response.status}` };
    }
    const json: { data: BackendCareer[] } = await response.json();
    return { data: json.data.map(({ id, name }) => ({ id, name })), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching careers';
    return { data: [], error: message };
  }
}
```

- [ ] **Step 3: Agregar `getUniversities` y `getFaculties`**

Después de `getCareers`, agregar:

```ts
export async function getUniversities(): Promise<ApiResult<University[]>> {
  try {
    const url = new URL(`${BASE_URL}/api/v1/universities`);
    const response = await fetch(url.toString());
    if (!response.ok) {
      return { data: [], error: `Request failed with status ${response.status}` };
    }
    const json: { data: BackendUniversity[] } = await response.json();
    return { data: json.data.map(({ id, name }) => ({ id, name })), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching universities';
    return { data: [], error: message };
  }
}

export async function getFaculties(params: { universityId: string }): Promise<ApiResult<Faculty[]>> {
  try {
    const url = new URL(`${BASE_URL}/api/v1/faculties`);
    url.searchParams.set('universityId', params.universityId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      return { data: [], error: `Request failed with status ${response.status}` };
    }
    const json: { data: BackendFaculty[] } = await response.json();
    return { data: json.data.map(({ id, name }) => ({ id, name })), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching faculties';
    return { data: [], error: message };
  }
}
```

- [ ] **Step 4: Verificar build**

```bash
pnpm build
```

Esperado: sin errores de TypeScript.

- [ ] **Step 5: Commit**

```bash
git add src/shared/services/api.ts
git commit -m "feat(api): add getUniversities, getFaculties; update getCareers to accept facultyId"
```

---

## Task 2: Tipos de filtro

**Files:**
- Rewrite: `src/features/home/types/filter.ts`

- [ ] **Step 1: Reescribir `types/filter.ts`**

Reemplazar todo el contenido de `src/features/home/types/filter.ts` con:

```ts
import type { University, Faculty, Career } from '@/shared/services/api';
import type { Subject } from './subjects';

export type DraftFilters = {
  universityId: string;
  facultyId: string;
  careerId: string;
  planId: string;
  year: number;
  quadmester: number;
};

export type AppliedFilters = DraftFilters & {
  search: string;
};

export type FilterOption = { id: string; label: string };

export type FilterOptions = {
  universities: FilterOption[];
  faculties: FilterOption[];
  careers: FilterOption[];
  plans: FilterOption[];
  loadingUniversities: boolean;
  loadingFaculties: boolean;
  loadingCareers: boolean;
};

export type PropsFilterBar = {
  draft: DraftFilters;
  applied: AppliedFilters;
  setDraftFilter: <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => void;
  applyDraft: () => void;
  cancelDraft: () => void;
  setSearch: (search: string) => void;
  clearAll: () => void;
  removeFilter: (key: keyof DraftFilters) => void;
  activeCount: number;
  options: FilterOptions;
};

export type PropsListOfSubjects = {
  subjects: Subject[];
  onClearAll: () => void;
  loading: boolean;
  hasMore: boolean;
  showMore: () => void;
  careerId: string;
};
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: errores de TypeScript en `FilterBar.tsx`, `ListOfSubjects.tsx` y `SubjectsView.tsx` — los resolveremos en tareas posteriores. Si hay errores en otros archivos, investigar antes de continuar.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/types/filter.ts
git commit -m "feat(filter): define DraftFilters, AppliedFilters, FilterOptions types"
```

---

## Task 3: `useFilterState` hook

**Files:**
- Create: `src/features/home/hooks/useFilterState.ts`

- [ ] **Step 1: Crear el hook con estado y constantes**

Crear `src/features/home/hooks/useFilterState.ts`:

```ts
import { useEffect, useState } from 'react';
import type { DraftFilters, AppliedFilters } from '@/features/home/types/filter';

const EMPTY_DRAFT: DraftFilters = {
  universityId: '',
  facultyId: '',
  careerId: '',
  planId: '',
  year: 0,
  quadmester: 0,
};

const EMPTY_APPLIED: AppliedFilters = { ...EMPTY_DRAFT, search: '' };

const CASCADE_CHILDREN: Record<keyof DraftFilters, Array<keyof DraftFilters>> = {
  universityId: ['facultyId', 'careerId', 'planId', 'year', 'quadmester'],
  facultyId: ['careerId', 'planId', 'year', 'quadmester'],
  careerId: ['planId', 'year', 'quadmester'],
  planId: [],
  year: [],
  quadmester: [],
};

export const useFilterState = () => {
  const [draft, setDraft] = useState<DraftFilters>(EMPTY_DRAFT);
  const [applied, setApplied] = useState<AppliedFilters>(EMPTY_APPLIED);

  // Initialize from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const universityId = params.get('university') ?? '';
    const facultyId = universityId ? (params.get('faculty') ?? '') : '';
    const careerId = facultyId ? (params.get('career') ?? '') : '';
    const planId = careerId ? (params.get('plan') ?? '') : '';
    const year = careerId ? Number(params.get('year') ?? 0) : 0;
    const quadmester = careerId ? Number(params.get('quadmester') ?? 0) : 0;
    const search = params.get('q') ?? '';

    const initialDraft: DraftFilters = { universityId, facultyId, careerId, planId, year, quadmester };
    const initialApplied: AppliedFilters = { ...initialDraft, search };
    setDraft(initialDraft);
    setApplied(initialApplied);
  }, []);

  // Sync URL when applied changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (applied.search) params.set('q', applied.search);
    if (applied.universityId) params.set('university', applied.universityId);
    if (applied.facultyId) params.set('faculty', applied.facultyId);
    if (applied.careerId) params.set('career', applied.careerId);
    if (applied.planId) params.set('plan', applied.planId);
    if (applied.year) params.set('year', String(applied.year));
    if (applied.quadmester) params.set('quadmester', String(applied.quadmester));
    const qs = params.toString();
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [applied]);

  function setDraftFilter<K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) {
    setDraft((prev) => {
      const next = { ...prev, [key]: value } as DraftFilters;
      for (const child of CASCADE_CHILDREN[key]) {
        (next as Record<string, unknown>)[child] = EMPTY_DRAFT[child];
      }
      return next;
    });
  }

  function applyDraft() {
    setApplied((prev) => ({ ...draft, search: prev.search }));
  }

  function cancelDraft() {
    const { search: _search, ...draftFromApplied } = applied;
    setDraft(draftFromApplied);
  }

  function setSearch(search: string) {
    setApplied((prev) => ({ ...prev, search }));
  }

  function clearAll() {
    setDraft(EMPTY_DRAFT);
    setApplied(EMPTY_APPLIED);
  }

  function removeFilter(key: keyof DraftFilters) {
    const resetValue = (key === 'year' || key === 'quadmester') ? 0 : '';
    const applyReset = (prev: DraftFilters): DraftFilters => {
      const next = { ...prev, [key]: resetValue } as DraftFilters;
      for (const child of CASCADE_CHILDREN[key]) {
        (next as Record<string, unknown>)[child] = EMPTY_DRAFT[child];
      }
      return next;
    };
    setDraft(applyReset);
    setApplied((prev) => {
      const { search, ...rest } = prev;
      return { ...applyReset(rest), search };
    });
  }

  const activeCount = [
    applied.universityId,
    applied.facultyId,
    applied.careerId,
    applied.planId,
    applied.year !== 0 ? String(applied.year) : '',
    applied.quadmester !== 0 ? String(applied.quadmester) : '',
  ].filter(Boolean).length;

  return {
    draft,
    applied,
    setDraftFilter,
    applyDraft,
    cancelDraft,
    setSearch,
    clearAll,
    removeFilter,
    activeCount,
  };
};
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: sin errores nuevos en este archivo.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/hooks/useFilterState.ts
git commit -m "feat(filter): add useFilterState with cascade, draft/apply, URL sync"
```

---

## Task 4: `useFilterOptions` hook

**Files:**
- Create: `src/features/home/hooks/useFilterOptions.ts`

- [ ] **Step 1: Crear el hook**

Crear `src/features/home/hooks/useFilterOptions.ts`:

```ts
import { useEffect, useState } from 'react';
import { getCareers, getFaculties, getUniversities } from '@/shared/services/api';
import type { University, Faculty, Career } from '@/shared/services/api';
import type { DraftFilters, FilterOption } from '@/features/home/types/filter';

const toOption = (item: { id: string; name: string }): FilterOption => ({
  id: item.id,
  label: item.name,
});

export const useFilterOptions = (draft: DraftFilters) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingCareers, setLoadingCareers] = useState(false);

  useEffect(() => {
    setLoadingUniversities(true);
    getUniversities().then((r) => {
      setUniversities(r.error ? [] : r.data);
      setLoadingUniversities(false);
    });
  }, []);

  useEffect(() => {
    if (!draft.universityId) {
      setFaculties([]);
      return;
    }
    setLoadingFaculties(true);
    getFaculties({ universityId: draft.universityId }).then((r) => {
      setFaculties(r.error ? [] : r.data);
      setLoadingFaculties(false);
    });
  }, [draft.universityId]);

  useEffect(() => {
    if (!draft.facultyId) {
      setCareers([]);
      return;
    }
    setLoadingCareers(true);
    getCareers({ facultyId: draft.facultyId }).then((r) => {
      setCareers(r.error ? [] : r.data);
      setLoadingCareers(false);
    });
  }, [draft.facultyId]);

  return {
    universityOptions: universities.map(toOption),
    facultyOptions: faculties.map(toOption),
    careerOptions: careers.map(toOption),
    loadingUniversities,
    loadingFaculties,
    loadingCareers,
  };
};
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/hooks/useFilterOptions.ts
git commit -m "feat(filter): add useFilterOptions with cascading university/faculty/career fetch"
```

---

## Task 5: Simplificar `useSubjects`

**Files:**
- Modify: `src/features/home/hooks/useSubjects.ts`

- [ ] **Step 1: Reescribir `useSubjects` para recibir `AppliedFilters`**

Reemplazar todo el contenido de `src/features/home/hooks/useSubjects.ts` con:

```ts
import { useEffect, useMemo, useState } from 'react';
import { getSubjects } from '@/shared/services/api';
import { normalizeText } from '@/features/home/utils/normalizeText';
import type { Subject } from '@/features/home/types/subjects';
import type { AppliedFilters, FilterOption } from '@/features/home/types/filter';

const PAGE_SIZE = 9;

export const useSubjects = (appliedFilters: AppliedFilters) => {
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appliedFilters.careerId) {
      setAllSubjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getSubjects({ careerId: appliedFilters.careerId }).then((result) => {
      setAllSubjects(result.error ? [] : result.data);
      setLoading(false);
    });
  }, [appliedFilters.careerId]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const result = allSubjects
        .filter((s) => normalizeText(s.title).includes(normalizeText(appliedFilters.search)))
        .filter((s) => (appliedFilters.year === 0 ? true : s.year === appliedFilters.year))
        .filter((s) => (appliedFilters.quadmester === 0 ? true : s.quadmester === appliedFilters.quadmester))
        .filter((s) =>
          !appliedFilters.planId
            ? true
            : s.careers.some(
                (c) => c.careerId === appliedFilters.careerId && c.planId === appliedFilters.planId
              )
        )
        .sort((a, b) => a.title.localeCompare(b.title));

      setFilteredSubjects(result);
      setVisibleCount(PAGE_SIZE);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    appliedFilters.search,
    appliedFilters.year,
    appliedFilters.quadmester,
    appliedFilters.planId,
    appliedFilters.careerId,
    allSubjects,
  ]);

  const planOptions = useMemo((): FilterOption[] => {
    if (!appliedFilters.careerId) return [];
    const planSet = new Set<string>();
    allSubjects.forEach((s) => {
      s.careers.forEach((c) => {
        if (c.careerId === appliedFilters.careerId) planSet.add(c.planId);
      });
    });
    return Array.from(planSet)
      .sort()
      .map((planId) => {
        const year = planId.match(/\d+$/)?.[0];
        return { id: planId, label: year ? `Plan ${year}` : planId };
      });
  }, [allSubjects, appliedFilters.careerId]);

  const visibleSubjects = filteredSubjects.slice(0, visibleCount);
  const showMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);
  const hasMore = visibleCount < filteredSubjects.length;

  return {
    filteredSubjects: visibleSubjects,
    loading,
    showMore,
    hasMore,
    planOptions,
  };
};
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: errores en `SubjectsView.tsx` (todavía usa la API vieja) — los resolveremos en Task 10.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/hooks/useSubjects.ts
git commit -m "refactor(subjects): simplify useSubjects to receive AppliedFilters, expose planOptions"
```

---

## Task 6: `FilterCombobox` component

**Files:**
- Create: `src/features/home/components/subjects/FilterCombobox.tsx`

- [ ] **Step 1: Crear el componente**

Crear `src/features/home/components/subjects/FilterCombobox.tsx`:

```tsx
import React, { useEffect, useId, useRef, useState } from 'react';
import type { FilterOption } from '@/features/home/types/filter';

interface FilterComboboxProps {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const FilterCombobox: React.FC<FilterComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const listId = `combobox-list-${uid}`;

  const selectedLabel = options.find((o) => o.id === value)?.label ?? '';
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (!prev) {
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      return !prev;
    });
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-w-40${disabled ? ' opacity-40 pointer-events-none' : ''}`}
      aria-disabled={disabled || undefined}
    >
      <button
        type='button'
        onClick={handleTriggerClick}
        className='w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-left hover:border-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500'
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        aria-controls={isOpen ? listId : undefined}
      >
        <span className={selectedLabel ? 'text-white truncate' : 'text-zinc-400 truncate'}>
          {isLoading ? 'Cargando...' : selectedLabel || placeholder}
        </span>
        <svg
          className={`shrink-0 text-zinc-400 transition-transform${isOpen ? ' rotate-180' : ''}`}
          width='16'
          height='16'
          viewBox='0 0 24 24'
        >
          <path fill='currentColor' d='M7 10l5 5 5-5z' />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden'>
          <div className='p-2 border-b border-zinc-700'>
            <input
              ref={inputRef}
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Buscar...'
              className='w-full bg-zinc-900 text-sm text-white placeholder-zinc-400 px-2 py-1 rounded outline-none'
              role='combobox'
              aria-autocomplete='list'
              aria-expanded={isOpen}
              aria-controls={listId}
            />
          </div>
          <ul
            id={listId}
            role='listbox'
            className='max-h-52 overflow-y-auto py-1'
          >
            {filtered.length === 0 ? (
              <li className='px-3 py-2 text-sm text-zinc-400'>Sin resultados</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.id}
                  role='option'
                  aria-selected={option.id === value}
                  onClick={() => handleSelect(option.id)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-zinc-700 ${
                    option.id === value ? 'text-white bg-zinc-700/80' : 'text-zinc-200'
                  }`}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterCombobox;
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/subjects/FilterCombobox.tsx
git commit -m "feat(filter): add FilterCombobox with internal search, keyboard nav, accessibility"
```

---

## Task 7: `ActiveTags` component

**Files:**
- Create: `src/features/home/components/subjects/ActiveTags.tsx`

- [ ] **Step 1: Crear el componente**

Crear `src/features/home/components/subjects/ActiveTags.tsx`:

```tsx
import React, { useRef, useState, useEffect } from 'react';
import type { DraftFilters, FilterOptions } from '@/features/home/types/filter';

interface ActiveTagsProps {
  displayedFilters: DraftFilters;
  options: FilterOptions;
  onRemove: (key: keyof DraftFilters) => void;
  onClearAll: () => void;
}

type Tag = { key: keyof DraftFilters; label: string };

function buildTags(filters: DraftFilters, options: FilterOptions): Tag[] {
  const tags: Tag[] = [];

  if (filters.universityId) {
    const label = options.universities.find((u) => u.id === filters.universityId)?.label;
    if (label) tags.push({ key: 'universityId', label });
  }
  if (filters.facultyId) {
    const label = options.faculties.find((f) => f.id === filters.facultyId)?.label;
    if (label) tags.push({ key: 'facultyId', label });
  }
  if (filters.careerId) {
    const label = options.careers.find((c) => c.id === filters.careerId)?.label;
    if (label) tags.push({ key: 'careerId', label });
  }
  if (filters.planId) {
    const label = options.plans.find((p) => p.id === filters.planId)?.label;
    if (label) tags.push({ key: 'planId', label });
  }
  if (filters.year !== 0) {
    tags.push({ key: 'year', label: `${filters.year}º año` });
  }
  if (filters.quadmester !== 0) {
    tags.push({ key: 'quadmester', label: `${filters.quadmester}º cuatrimestre` });
  }

  return tags;
}

const ActiveTags: React.FC<ActiveTagsProps> = ({
  displayedFilters,
  options,
  onRemove,
  onClearAll,
}) => {
  const tags = buildTags(displayedFilters, options);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflowCount, setOverflowCount] = useState(0);

  // Detect overflow on desktop (max 2 lines = 2 * ~32px = 64px)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const lineHeight = 32;
    const maxHeight = lineHeight * 2;
    if (!expanded && container.scrollHeight > maxHeight + 4) {
      // Count tags that overflow
      let visibleHeight = 0;
      let hiddenCount = 0;
      const children = Array.from(container.children) as HTMLElement[];
      for (const child of children) {
        visibleHeight += child.offsetHeight + 8; // 8 = gap
        if (visibleHeight > maxHeight) hiddenCount++;
      }
      setOverflowCount(hiddenCount);
    } else {
      setOverflowCount(0);
    }
  }, [tags.length, expanded]);

  if (tags.length === 0) return null;

  const visibleTags = !expanded && overflowCount > 0
    ? tags.slice(0, tags.length - overflowCount)
    : tags;

  return (
    <div className='mt-3 flex flex-col gap-2'>
      {/* Mobile: scroll horizontal */}
      <div className='flex lg:hidden items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap'>
        {tags.map((tag) => (
          <TagChip key={tag.key} label={tag.label} onRemove={() => onRemove(tag.key)} />
        ))}
        <ClearAllButton onClick={onClearAll} />
      </div>

      {/* Desktop: flex wrap con colapso */}
      <div
        ref={containerRef}
        className='hidden lg:flex flex-wrap gap-2 items-center'
        style={!expanded && overflowCount > 0 ? { maxHeight: '72px', overflow: 'hidden' } : undefined}
      >
        {visibleTags.map((tag) => (
          <TagChip key={tag.key} label={tag.label} onRemove={() => onRemove(tag.key)} />
        ))}
        {!expanded && overflowCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className='text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-full border border-zinc-700 hover:border-zinc-500 transition-colors whitespace-nowrap'
          >
            +{overflowCount} más
          </button>
        )}
        <ClearAllButton onClick={onClearAll} />
      </div>
    </div>
  );
};

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className='flex items-center gap-1 pl-3 pr-1.5 py-1 text-sm bg-zinc-700/60 border border-zinc-600 rounded-full text-zinc-200 whitespace-nowrap'>
      {label}
      <button
        onClick={onRemove}
        aria-label={`Eliminar filtro ${label}`}
        className='ml-0.5 flex items-center justify-center w-4 h-4 rounded-full hover:bg-zinc-500 transition-colors'
      >
        <svg width='10' height='10' viewBox='0 0 24 24' fill='none'>
          <path
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            d='M6 6l12 12M18 6L6 18'
          />
        </svg>
      </button>
    </span>
  );
}

function ClearAllButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className='text-xs text-zinc-400 hover:text-red-400 transition-colors whitespace-nowrap underline underline-offset-2'
    >
      Limpiar todo
    </button>
  );
}

export default ActiveTags;
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/subjects/ActiveTags.tsx
git commit -m "feat(filter): add ActiveTags with cascade remove, desktop collapse, mobile scroll"
```

---

## Task 8: `FilterPanel` component

**Files:**
- Create: `src/features/home/components/subjects/FilterPanel.tsx`

- [ ] **Step 1: Crear el componente**

Crear `src/features/home/components/subjects/FilterPanel.tsx`:

```tsx
import React, { useEffect, useRef } from 'react';
import FilterCombobox from './FilterCombobox';
import type { DraftFilters, FilterOptions } from '@/features/home/types/filter';
import { YEARS_FILTER, QUADMESTERS_FILTER } from '@/features/home/constants/filter';

interface FilterPanelProps {
  draft: DraftFilters;
  setDraftFilter: <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => void;
  options: FilterOptions;
  onApply: () => void;
  onCancel: () => void;
}

const yearOptions = YEARS_FILTER.filter((f) => f.value !== 0).map((f) => ({
  id: String(f.value),
  label: f.label,
}));

const quadmesterOptions = QUADMESTERS_FILTER.filter((f) => f.value !== 0).map((f) => ({
  id: String(f.value),
  label: f.label,
}));

const FilterPanel: React.FC<FilterPanelProps> = ({
  draft,
  setDraftFilter,
  options,
  onApply,
  onCancel,
}) => {
  const firstComboboxRef = useRef<HTMLDivElement>(null);

  // Move focus to panel on open
  useEffect(() => {
    const firstButton = firstComboboxRef.current?.querySelector('button');
    firstButton?.focus();
  }, []);

  const rows: Array<{
    label: string;
    key: keyof DraftFilters;
    opts: { id: string; label: string }[];
    disabled: boolean;
    loading: boolean;
    isNumeric?: boolean;
  }> = [
    {
      label: 'Universidad',
      key: 'universityId',
      opts: options.universities,
      disabled: false,
      loading: options.loadingUniversities,
    },
    {
      label: 'Facultad',
      key: 'facultyId',
      opts: options.faculties,
      disabled: !draft.universityId,
      loading: options.loadingFaculties,
    },
    {
      label: 'Carrera',
      key: 'careerId',
      opts: options.careers,
      disabled: !draft.facultyId,
      loading: options.loadingCareers,
    },
    {
      label: 'Plan',
      key: 'planId',
      opts: options.plans,
      disabled: !draft.careerId,
      loading: false,
    },
    {
      label: 'Año',
      key: 'year',
      opts: yearOptions,
      disabled: !draft.careerId,
      loading: false,
      isNumeric: true,
    },
    {
      label: 'Cuatrimestre',
      key: 'quadmester',
      opts: quadmesterOptions,
      disabled: !draft.careerId,
      loading: false,
      isNumeric: true,
    },
  ];

  const panelContent = (
    <>
      {/* Filter rows */}
      <div className='flex flex-col gap-4 p-4'>
        {rows.map((row, i) => (
          <div
            key={row.key}
            ref={i === 0 ? firstComboboxRef : undefined}
            className='flex items-center justify-between gap-4'
          >
            <span className={`text-sm shrink-0 w-28 ${row.disabled ? 'text-zinc-500' : 'text-zinc-300'}`}>
              {row.label}
            </span>
            <FilterCombobox
              options={row.opts}
              value={row.isNumeric ? (draft[row.key] !== 0 ? String(draft[row.key]) : '') : String(draft[row.key])}
              onChange={(id) => {
                if (row.isNumeric) {
                  (setDraftFilter as (key: keyof DraftFilters, value: number) => void)(
                    row.key,
                    id ? Number(id) : 0
                  );
                } else {
                  (setDraftFilter as (key: keyof DraftFilters, value: string) => void)(
                    row.key,
                    id
                  );
                }
              }}
              placeholder={`Seleccionar ${row.label.toLowerCase()}`}
              disabled={row.disabled}
              isLoading={row.loading}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-end gap-3 px-4 py-3 border-t border-zinc-700'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-zinc-700'
        >
          Cancelar
        </button>
        <button
          type='button'
          onClick={onApply}
          className='px-4 py-2 text-sm font-semibold text-white rounded-lg gradient-bg hover:opacity-90 transition-opacity'
        >
          Aplicar
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop dropdown */}
      <div
        id='filter-panel'
        role='region'
        aria-label='Filtros'
        className='hidden lg:block absolute right-0 top-full mt-2 w-[480px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50'
      >
        {panelContent}
      </div>

      {/* Mobile bottom sheet */}
      <>
        {/* Backdrop */}
        <div
          className='lg:hidden fixed inset-0 bg-black/60 z-40'
          onClick={onCancel}
          aria-hidden='true'
        />
        <div
          id='filter-panel-mobile'
          role='dialog'
          aria-label='Filtros'
          aria-modal='true'
          className='lg:hidden fixed inset-x-0 bottom-0 z-50 bg-zinc-900 border-t border-zinc-700 rounded-t-2xl max-h-[90dvh] flex flex-col'
        >
          {/* Handle */}
          <div className='flex justify-center pt-3 pb-1'>
            <div className='w-10 h-1 rounded-full bg-zinc-600' />
          </div>
          <div className='flex-1 overflow-y-auto'>
            <div className='flex flex-col gap-4 p-4'>
              {rows.map((row) => (
                <div key={row.key} className='flex flex-col gap-1.5'>
                  <span className={`text-sm font-medium ${row.disabled ? 'text-zinc-500' : 'text-zinc-300'}`}>
                    {row.label}
                  </span>
                  <FilterCombobox
                    options={row.opts}
                    value={row.isNumeric ? (draft[row.key] !== 0 ? String(draft[row.key]) : '') : String(draft[row.key])}
                    onChange={(id) => {
                      if (row.isNumeric) {
                        (setDraftFilter as (key: keyof DraftFilters, value: number) => void)(
                          row.key,
                          id ? Number(id) : 0
                        );
                      } else {
                        (setDraftFilter as (key: keyof DraftFilters, value: string) => void)(
                          row.key,
                          id
                        );
                      }
                    }}
                    placeholder={`Seleccionar ${row.label.toLowerCase()}`}
                    disabled={row.disabled}
                    isLoading={row.loading}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Mobile footer */}
          <div className='flex items-center gap-3 px-4 py-4 border-t border-zinc-700 shrink-0'>
            <button
              type='button'
              onClick={onCancel}
              className='flex-1 px-4 py-2.5 text-sm text-zinc-300 hover:text-white border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={onApply}
              className='flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl gradient-bg hover:opacity-90 transition-opacity'
            >
              Aplicar
            </button>
          </div>
        </div>
      </>
    </>
  );
};

export default FilterPanel;
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/subjects/FilterPanel.tsx
git commit -m "feat(filter): add FilterPanel with desktop dropdown and mobile bottom sheet"
```

---

## Task 9: Reescribir `FilterBar`

**Files:**
- Rewrite: `src/features/home/components/subjects/FilterBar.tsx`

- [ ] **Step 1: Reescribir el componente**

Reemplazar todo el contenido de `src/features/home/components/subjects/FilterBar.tsx` con:

```tsx
import React, { useEffect, useRef, useState } from 'react';
import FilterPanel from './FilterPanel';
import ActiveTags from './ActiveTags';
import type { PropsFilterBar, DraftFilters } from '@/features/home/types/filter';

const FilterBar: React.FC<PropsFilterBar> = ({
  draft,
  applied,
  setDraftFilter,
  applyDraft,
  cancelDraft,
  setSearch,
  clearAll,
  removeFilter,
  activeCount,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelWrapperRef = useRef<HTMLDivElement>(null);

  // Return focus to button when panel closes
  useEffect(() => {
    if (!isOpen) buttonRef.current?.focus();
  }, [isOpen]);

  // Close desktop dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelWrapperRef.current && !panelWrapperRef.current.contains(e.target as Node)) {
        cancelDraft();
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, cancelDraft]);

  const handleApply = () => {
    applyDraft();
    setIsOpen(false);
  };

  const handleCancel = () => {
    cancelDraft();
    setIsOpen(false);
  };

  const displayedFilters: DraftFilters = isOpen
    ? draft
    : {
        universityId: applied.universityId,
        facultyId: applied.facultyId,
        careerId: applied.careerId,
        planId: applied.planId,
        year: applied.year,
        quadmester: applied.quadmester,
      };

  return (
    <div className='flex flex-col mb-4 lg:mb-8 w-full'>
      {/* Search bar row */}
      <div className='relative flex items-center gap-2'>
        <div className='flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 focus-within:border-zinc-500 transition-colors'>
          <svg width='18' height='18' viewBox='0 0 24 24' className='shrink-0'>
            <path
              className='stroke-foreground-muted'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314'
            />
          </svg>
          <input
            type='text'
            placeholder='Ingresá una materia'
            value={applied.search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full text-sm font-medium text-foreground placeholder-foreground-muted focus:outline-none bg-transparent'
          />
        </div>

        {/* Filtros button + desktop dropdown wrapper */}
        <div ref={panelWrapperRef} className='relative'>
          <button
            ref={buttonRef}
            type='button'
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls='filter-panel'
            className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-zinc-900 border border-zinc-700 rounded-xl hover:border-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
              <path
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                d='M3 6h18M7 12h10M11 18h2'
              />
            </svg>
            <span>Filtros</span>
            {activeCount > 0 && (
              <span className='flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full gradient-bg text-white'>
                {activeCount}
              </span>
            )}
          </button>

          {isOpen && (
            <FilterPanel
              draft={draft}
              setDraftFilter={setDraftFilter}
              options={options}
              onApply={handleApply}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>

      {/* Active tags */}
      <ActiveTags
        displayedFilters={displayedFilters}
        options={options}
        onRemove={removeFilter}
        onClearAll={clearAll}
      />
    </div>
  );
};

export default FilterBar;
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: error solo en `SubjectsView.tsx` (todavía pasa props viejas a FilterBar).

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/subjects/FilterBar.tsx
git commit -m "feat(filter): rewrite FilterBar to compose FilterPanel and ActiveTags"
```

---

## Task 10: Actualizar `ListOfSubjects` y `SubjectsView`

**Files:**
- Modify: `src/features/home/components/subjects/ListOfSubjects.tsx`
- Rewrite: `src/features/home/components/subjects/SubjectsView.tsx`

- [ ] **Step 1: Actualizar `ListOfSubjects` — reemplazar `setFilters` por `onClearAll`**

En `src/features/home/components/subjects/ListOfSubjects.tsx`, reemplazar el contenido completo con:

```tsx
import type { PropsListOfSubjects } from '../../types/filter';
import Card from './CardSubject';
import CardSubjectLoading from './CardSubjectLoading';

function ListOfSubjects({ subjects, onClearAll, loading, hasMore, showMore, careerId }: PropsListOfSubjects) {
  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSubjectLoading key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center'>
      <div className='w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
        {subjects.length === 0 ? (
          <div className='col-span-full w-full px-6 py-10 rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border gradient-border overflow-hidden hover:border-zinc-700/80 text-center shadow-md'>
            <h2 className='text-xl font-semibold text-zinc-100 mb-2'>Sin resultados</h2>
            <p className='text-zinc-400 mb-4'>
              No se encontraron coincidencias con los filtros seleccionados.
            </p>
            <button
              onClick={onClearAll}
              className='mx-auto cursor-pointer flex items-center duration-200 hover:scale-105 rounded-xl gradient-bg gradient-border font-bold text-white shadow-sm'
            >
              <div className='bg-black/40 mx-[1px] relative inset-0 z-0 rounded-2xl gap-2 flex items-center justify-center px-5 py-3'>
                Restablecer filtros
              </div>
            </button>
          </div>
        ) : (
          subjects.map((subject) => <Card key={subject.id} {...subject} careerId={careerId} />)
        )}
      </div>
      {hasMore && (
        <button
          className='text-primary-foreground font-bold rounded-xl px-10 mt-10 cursor-pointer hover:scale-105 py-3 bg-primary'
          onClick={() => showMore()}
        >
          Ver más
        </button>
      )}
    </div>
  );
}

export default ListOfSubjects;
```

- [ ] **Step 2: Reescribir `SubjectsView`**

Reemplazar todo el contenido de `src/features/home/components/subjects/SubjectsView.tsx` con:

```tsx
import FilterBar from './FilterBar';
import ListOfSubjects from './ListOfSubjects';
import { useFilterState } from '@/features/home/hooks/useFilterState';
import { useFilterOptions } from '@/features/home/hooks/useFilterOptions';
import { useSubjects } from '@/features/home/hooks/useSubjects';
import type { FilterOptions } from '@/features/home/types/filter';

function SubjectsView() {
  const filterState = useFilterState();
  const { universityOptions, facultyOptions, careerOptions, loadingUniversities, loadingFaculties, loadingCareers } =
    useFilterOptions(filterState.draft);
  const { filteredSubjects, loading, showMore, hasMore, planOptions } = useSubjects(filterState.applied);

  const options: FilterOptions = {
    universities: universityOptions,
    faculties: facultyOptions,
    careers: careerOptions,
    plans: planOptions,
    loadingUniversities,
    loadingFaculties,
    loadingCareers,
  };

  return (
    <>
      <FilterBar
        draft={filterState.draft}
        applied={filterState.applied}
        setDraftFilter={filterState.setDraftFilter}
        applyDraft={filterState.applyDraft}
        cancelDraft={filterState.cancelDraft}
        setSearch={filterState.setSearch}
        clearAll={filterState.clearAll}
        removeFilter={filterState.removeFilter}
        activeCount={filterState.activeCount}
        options={options}
      />
      <ListOfSubjects
        subjects={filteredSubjects}
        onClearAll={filterState.clearAll}
        hasMore={hasMore}
        showMore={showMore}
        loading={loading}
        careerId={filterState.applied.careerId}
      />
    </>
  );
}

export default SubjectsView;
```

- [ ] **Step 3: Verificar build limpio**

```bash
pnpm build
```

Esperado: **cero errores**. Si hay errores de TypeScript, resolverlos antes de continuar.

- [ ] **Step 4: Verificación manual en el navegador**

```bash
pnpm dev
```

Abrir `http://localhost:4321` y verificar:

1. La barra de búsqueda está visible con el botón "Filtros"
2. Escribir en el campo de búsqueda → las materias se filtran inmediatamente
3. Click en "Filtros" → se abre el panel
4. En el panel: los comboboxes de Facultad, Carrera, Plan, Año y Cuatrimestre están deshabilitados (opacidad reducida)
5. Seleccionar una Universidad → se habilita Facultad y se dispara el fetch de facultades
6. Seleccionar una Facultad → se habilita Carrera
7. Seleccionar una Carrera → se habilitan Plan, Año, Cuatrimestre; y las materias se cargan
8. Seleccionar valores en Plan/Año/Cuatrimestre → los tags aparecen en el panel abierto
9. Click "Aplicar" → el panel se cierra, las materias se filtran, los tags aparecen debajo de la barra
10. Click X en un tag → ese filtro se elimina y sus dependientes se resetean
11. Cambiar el tamaño de la ventana a mobile → el panel se abre como bottom sheet con handle y backdrop
12. La URL refleja todos los filtros activos; copiar la URL, pegarla en una nueva pestaña → los filtros se restauran correctamente
13. Click "Limpiar todo" → todos los filtros se borran, la URL se limpia

- [ ] **Step 5: Commit final**

```bash
git add src/features/home/components/subjects/ListOfSubjects.tsx src/features/home/components/subjects/SubjectsView.tsx
git commit -m "feat(filter): wire up SubjectsView with new hooks; complete filter refactor"
```

---

## Resumen de commits esperados

1. `feat(api): add getUniversities, getFaculties; update getCareers to accept facultyId`
2. `feat(filter): define DraftFilters, AppliedFilters, FilterOptions types`
3. `feat(filter): add useFilterState with cascade, draft/apply, URL sync`
4. `feat(filter): add useFilterOptions with cascading university/faculty/career fetch`
5. `refactor(subjects): simplify useSubjects to receive AppliedFilters, expose planOptions`
6. `feat(filter): add FilterCombobox with internal search, keyboard nav, accessibility`
7. `feat(filter): add ActiveTags with cascade remove, desktop collapse, mobile scroll`
8. `feat(filter): add FilterPanel with desktop dropdown and mobile bottom sheet`
9. `feat(filter): rewrite FilterBar to compose FilterPanel and ActiveTags`
10. `feat(filter): wire up SubjectsView with new hooks; complete filter refactor`
