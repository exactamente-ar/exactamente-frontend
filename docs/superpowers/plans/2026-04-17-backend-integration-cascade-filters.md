# Backend Integration: Cascade Career Filters — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static career chip filter on the home page with three cascaded `<select>` dropdowns (university → faculty → career) backed by the new backend API endpoints.

**Architecture:** A new `useFilters` hook owns the cascade state and fetches from `/api/v1/universities`, `/api/v1/faculties`, and `/api/v1/careers`. `useSubjects` accepts `careerId` and re-fetches subjects server-side when it changes. `SubjectsView` wires both hooks together and passes everything down to `FilterBar`.

**Tech Stack:** Astro 5, React 19, TypeScript, Tailwind v4. No test runner — verify each task by running `pnpm dev` and checking the browser at `localhost:4321`. Backend runs at `localhost:3000` (set via `PUBLIC_API_URL` in `.env.local`).

**Spec:** `docs/superpowers/specs/2026-04-17-backend-integration-cascade-filters-design.md`

---

### Task 1: Add organization types

**Files:**
- Create: `src/features/home/types/organization.ts`

- [ ] **Step 1: Create the types file**

```ts
// src/features/home/types/organization.ts
export type University = { id: string; name: string; slug: string };
export type Faculty = { id: string; name: string; slug: string; universityId: string };
export type Career = { id: string; name: string; slug: string; facultyId: string };
```

- [ ] **Step 2: Commit**

```bash
git add src/features/home/types/organization.ts
git commit -m "feat: add University, Faculty, Career types"
```

---

### Task 2: Add universities, faculties, and careers API functions

**Files:**
- Modify: `src/shared/services/api.ts`

- [ ] **Step 1: Add the import for the new types at the top of `src/shared/services/api.ts`**

The current first line is:
```ts
import type { Subject } from '@/features/home/types/subjects';
```

Change it to:
```ts
import type { Subject } from '@/features/home/types/subjects';
import type { University, Faculty, Career } from '@/features/home/types/organization';
```

- [ ] **Step 2: Add the three backend types after the existing `BackendResource` type (around line 33)**

After the closing `};` of `BackendResource`, add:
```ts
type BackendUniversity = { id: string; name: string; slug: string };
type BackendFaculty = { id: string; name: string; slug: string; universityId: string };
type BackendCareer = { id: string; name: string; slug: string; facultyId: string };
```

- [ ] **Step 3: Add the three new API functions at the end of `src/shared/services/api.ts`**

```ts
export async function getUniversities(): Promise<ApiResult<University[]>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/universities`);
    if (!response.ok) {
      return { data: [], error: `Request failed with status ${response.status}` };
    }
    const json: { data: BackendUniversity[] } = await response.json();
    return { data: json.data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching universities';
    return { data: [], error: message };
  }
}

export async function getFaculties(universityId?: string): Promise<ApiResult<Faculty[]>> {
  try {
    const url = new URL(`${BASE_URL}/api/v1/faculties`);
    if (universityId) url.searchParams.set('universityId', universityId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      return { data: [], error: `Request failed with status ${response.status}` };
    }
    const json: { data: BackendFaculty[] } = await response.json();
    return { data: json.data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching faculties';
    return { data: [], error: message };
  }
}

export async function getCareers(facultyId?: string): Promise<ApiResult<Career[]>> {
  try {
    const url = new URL(`${BASE_URL}/api/v1/careers`);
    if (facultyId) url.searchParams.set('facultyId', facultyId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      return { data: [], error: `Request failed with status ${response.status}` };
    }
    const json: { data: BackendCareer[] } = await response.json();
    return { data: json.data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching careers';
    return { data: [], error: message };
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm build`
Expected: no TypeScript errors. (Build may fail on other things — only look for type errors in `api.ts`.)

- [ ] **Step 5: Commit**

```bash
git add src/shared/services/api.ts
git commit -m "feat: add getUniversities, getFaculties, getCareers API functions"
```

---

### Task 3: Create `useFilters` hook

**Files:**
- Create: `src/features/home/hooks/useFilters.ts`

- [ ] **Step 1: Create the hook**

```ts
// src/features/home/hooks/useFilters.ts
import { useState, useEffect } from 'react';
import { getUniversities, getFaculties, getCareers } from '@/shared/services/api';
import type { University, Faculty, Career } from '@/features/home/types/organization';

export function useFilters() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);

  const [universityId, setUniversityIdState] = useState('');
  const [facultyId, setFacultyIdState] = useState('');
  const [careerId, setCareerIdState] = useState('');

  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingCareers, setLoadingCareers] = useState(false);

  useEffect(() => {
    getUniversities().then((result) => {
      setUniversities(result.error ? [] : result.data);
      setLoadingUniversities(false);
    });
  }, []);

  useEffect(() => {
    if (!universityId) {
      setFaculties([]);
      return;
    }
    setLoadingFaculties(true);
    getFaculties(universityId).then((result) => {
      setFaculties(result.error ? [] : result.data);
      setLoadingFaculties(false);
    });
  }, [universityId]);

  useEffect(() => {
    if (!facultyId) {
      setCareers([]);
      return;
    }
    setLoadingCareers(true);
    getCareers(facultyId).then((result) => {
      setCareers(result.error ? [] : result.data);
      setLoadingCareers(false);
    });
  }, [facultyId]);

  const setUniversityId = (id: string) => {
    setUniversityIdState(id);
    setFacultyIdState('');
    setCareerIdState('');
    setFaculties([]);
    setCareers([]);
  };

  const setFacultyId = (id: string) => {
    setFacultyIdState(id);
    setCareerIdState('');
    setCareers([]);
  };

  const setCareerId = (id: string) => {
    setCareerIdState(id);
  };

  return {
    universities,
    faculties,
    careers,
    universityId,
    facultyId,
    careerId,
    setUniversityId,
    setFacultyId,
    setCareerId,
    loadingUniversities,
    loadingFaculties,
    loadingCareers,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/home/hooks/useFilters.ts
git commit -m "feat: add useFilters hook for cascade university/faculty/career state"
```

---

### Task 4: Update `useSubjects` to accept `careerId`

**Files:**
- Modify: `src/features/home/hooks/useSubjects.ts`

- [ ] **Step 1: Replace the full contents of `src/features/home/hooks/useSubjects.ts`**

```ts
import { useEffect, useState } from 'react';
import { INITIAL_FILTERS } from '@/features/home/constants/filter';
import { getSubjects } from '@/shared/services/api';
import { normalizeText } from '@/features/home/utils/normalizeText';
import type { Subject } from '@/features/home/types/subjects';
import type { FilterT } from '../types/filter';

const PAGE_SIZE = 9;

export const useSubjects = (careerId?: string) => {
  const [filters, setFilters] = useState<FilterT>(INITIAL_FILTERS);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (careerId) params.careerId = careerId;

    getSubjects(params).then((result) => {
      setAllSubjects(result.error ? [] : result.data);
      setLoading(false);
    });
  }, [careerId]);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      const result = allSubjects
        .filter((s) => normalizeText(s.title).includes(normalizeText(filters.search)))
        .filter((s) => (filters.year === 0 ? true : s.year === filters.year))
        .filter((s) => (filters.quadmester === 0 ? true : s.quadmester === filters.quadmester))
        .sort((a, b) => a.title.localeCompare(b.title));

      setFilteredSubjects(result);
      setVisibleCount(PAGE_SIZE);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, allSubjects]);

  const visibleSubjects = filteredSubjects.slice(0, visibleCount);

  const showMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const hasMore = visibleCount < filteredSubjects.length;

  return {
    filters,
    setFilters,
    filteredSubjects: visibleSubjects,
    loading,
    showMore,
    hasMore,
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/home/hooks/useSubjects.ts
git commit -m "feat: useSubjects accepts careerId and re-fetches server-side on change"
```

---

### Task 5: Update filter types and constants

**Files:**
- Modify: `src/features/home/types/filter.ts`
- Modify: `src/features/home/constants/filter.ts`

- [ ] **Step 1: Replace the full contents of `src/features/home/types/filter.ts`**

```ts
import type { Subject } from './subjects';
import type { University, Faculty, Career } from './organization';

export type FilterT = {
  search: string;
  year: number;
  quadmester: number;
};

export interface PropsFilterBar {
  setFilters: React.Dispatch<React.SetStateAction<FilterT>>;
  filters: FilterT;
  universities: University[];
  faculties: Faculty[];
  careers: Career[];
  universityId: string;
  facultyId: string;
  careerId: string;
  setUniversityId: (id: string) => void;
  setFacultyId: (id: string) => void;
  setCareerId: (id: string) => void;
  loadingUniversities: boolean;
  loadingFaculties: boolean;
  loadingCareers: boolean;
}

export type PropsListOfSubjects = {
  subjects: Subject[];
  setFilters: React.Dispatch<React.SetStateAction<FilterT>>;
  loading: boolean;
  hasMore: boolean;
  showMore: () => void;
};
```

- [ ] **Step 2: Replace the full contents of `src/features/home/constants/filter.ts`**

```ts
export const INITIAL_FILTERS = {
  search: '',
  quadmester: 0,
  year: 0,
};

export const YEARS_FILTER = [
  { label: 'Todos', value: 0 },
  { label: '1º', value: 1 },
  { label: '2º', value: 2 },
  { label: '3º', value: 3 },
  { label: '4º', value: 4 },
  { label: '5º', value: 5 },
];

export const QUADMESTERS_FILTER = [
  { label: 'Todos', value: 0 },
  { label: '1º', value: 1 },
  { label: '2º', value: 2 },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/features/home/types/filter.ts src/features/home/constants/filter.ts
git commit -m "refactor: remove static carrer from FilterT and constants"
```

---

### Task 6: Update `FilterBar` with cascade selects

**Files:**
- Modify: `src/features/home/components/subjects/FilterBar.tsx`

- [ ] **Step 1: Replace the full contents of `src/features/home/components/subjects/FilterBar.tsx`**

```tsx
import { QUADMESTERS_FILTER, YEARS_FILTER } from '@/features/home/constants/filter';
import React from 'react';
import type { PropsFilterBar } from '../../types/filter';

const FilterBar: React.FC<PropsFilterBar> = ({
  filters,
  setFilters,
  universities,
  faculties,
  careers,
  universityId,
  facultyId,
  careerId,
  setUniversityId,
  setFacultyId,
  setCareerId,
  loadingUniversities,
  loadingFaculties,
  loadingCareers,
}) => {
  return (
    <div className='flex flex-col gap-8 mb-4 lg:mb-8 w-full rounded-xl p-4 bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border gradient-border'>
      {/* Search */}
      <div className='p-[2px] rounded-xl gradient-bg'>
        <div
          className='relative w-full bg-zinc-900 flex justify-between items-center gap-2 border border-zinc-700 rounded-xl transition-all duration-200'
          tabIndex={0}
        >
          <div className='px-4 py-2 flex items-center w-full'>
            <svg width='20' height='20' className='mr-2' viewBox='0 0 24 24'>
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
              placeholder='Ingresa una materia'
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className='w-full font-bold text-foreground placeholder-foreground-muted focus:outline-none'
            />
          </div>
          <div className='bg-gradient-to-l gradient-bg rounded-xl h-full'>
            <div className='bg-black/40 relative py-2.5 px-4 m-[1px] inset-0 z-0 rounded-xl gap-2 flex items-center justify-center w-full'>
              <svg className='text-primary-foreground' width='20' height='20' viewBox='0 0 24 24'>
                <path fill='#fff' d='M16.175 13H4v-2h12.175l-5.6-5.6L12 4l8 8l-8 8l-1.425-1.4z' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cascade selects: university → faculty → career */}
      <div className='flex gap-4 items-end flex-col sm:flex-row text-foreground-muted'>
        <div className='flex flex-col gap-1 w-full sm:flex-1'>
          <span className='text-xs'>Universidad</span>
          <select
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value)}
            disabled={loadingUniversities}
            className='bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed w-full'
          >
            <option value=''>Todas</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-1 w-full sm:flex-1'>
          <span className='text-xs'>Facultad</span>
          <select
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            disabled={!universityId || loadingFaculties}
            className='bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed w-full'
          >
            <option value=''>Todas</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-1 w-full sm:flex-1'>
          <span className='text-xs'>Carrera</span>
          <select
            value={careerId}
            onChange={(e) => setCareerId(e.target.value)}
            disabled={!facultyId || loadingCareers}
            className='bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed w-full'
          >
            <option value=''>Todas</option>
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quadmester and Year chips */}
      <div className='flex gap-6 items-start sm:items-center flex-col sm:flex-row text-foreground-muted'>
        <div className='flex items-start gap-2'>
          <span className='text-sm'>Cuatrimestre</span>
          <div className='flex gap-2 flex-wrap'>
            {QUADMESTERS_FILTER.map(({ label, value }) => (
              <div
                key={value}
                className={`cursor-pointer rounded-full px-4 font-medium flex gap-1 items-center border border-zinc-700 hover:ring-1 hover:gradient-border ${
                  filters.quadmester === value ? 'bg-white/20 text-white/80 border border-white' : ''
                }`}
                onClick={() => setFilters((prev) => ({ ...prev, quadmester: value }))}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-start gap-2'>
          <span className='text-sm'>Año</span>
          <div className='flex gap-2 flex-wrap'>
            {YEARS_FILTER.map(({ label, value }) => (
              <div
                key={value}
                className={`cursor-pointer rounded-full px-4 font-medium flex gap-1 items-center border border-zinc-700 hover:ring-1 hover:gradient-border ${
                  filters.year === value ? 'bg-white/20 text-white/80 border border-white' : ''
                }`}
                onClick={() => setFilters((prev) => ({ ...prev, year: value }))}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/home/components/subjects/FilterBar.tsx
git commit -m "feat: replace static career chips with cascade university/faculty/career selects"
```

---

### Task 7: Wire everything together in `SubjectsView`

**Files:**
- Modify: `src/features/home/components/subjects/SubjectsView.tsx`

- [ ] **Step 1: Replace the full contents of `src/features/home/components/subjects/SubjectsView.tsx`**

```tsx
import ListOfSubjects from './ListOfSubjects';
import FilterBar from './FilterBar';
import { useSubjects } from '@/features/home/hooks/useSubjects';
import { useFilters } from '@/features/home/hooks/useFilters';

function SubjectsView() {
  const {
    universities,
    faculties,
    careers,
    universityId,
    facultyId,
    careerId,
    setUniversityId,
    setFacultyId,
    setCareerId,
    loadingUniversities,
    loadingFaculties,
    loadingCareers,
  } = useFilters();

  const { filters, setFilters, filteredSubjects, loading, hasMore, showMore } = useSubjects(careerId);

  return (
    <>
      <FilterBar
        setFilters={setFilters}
        filters={filters}
        universities={universities}
        faculties={faculties}
        careers={careers}
        universityId={universityId}
        facultyId={facultyId}
        careerId={careerId}
        setUniversityId={setUniversityId}
        setFacultyId={setFacultyId}
        setCareerId={setCareerId}
        loadingUniversities={loadingUniversities}
        loadingFaculties={loadingFaculties}
        loadingCareers={loadingCareers}
      />
      <ListOfSubjects
        subjects={filteredSubjects}
        setFilters={setFilters}
        hasMore={hasMore}
        showMore={showMore}
        loading={loading}
      />
    </>
  );
}

export default SubjectsView;
```

- [ ] **Step 2: Run the dev server and verify**

Run: `pnpm dev`

Open `http://localhost:4321` in a browser. Check:
1. The home page loads without errors.
2. The filter bar shows "Universidad", "Facultad", "Carrera" dropdowns (the Universidad dropdown populates from the API; Facultad and Carrera are disabled until the prior level is selected).
3. Selecting a university enables and populates the Facultad dropdown.
4. Selecting a faculty enables and populates the Carrera dropdown.
5. Selecting a career re-fetches and filters the subjects list.
6. Selecting "Todas" (empty option) at any level clears downstream levels and shows all subjects.
7. Year, quadmester, and search filters still work correctly.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/subjects/SubjectsView.tsx
git commit -m "feat: wire useFilters into SubjectsView for cascade career filtering"
```
