# Backend Integration: Cascade Career Filters

**Date:** 2026-04-17
**Status:** Approved

## Overview

Integrate the `/api/v1/universities`, `/api/v1/faculties`, and `/api/v1/careers` endpoints into the home page subject filter. Replace the static hardcoded career chip (`Ingenieria en Sistemas`) with three cascaded `<select>` dropdowns: university → faculty → career. When a career is selected, subjects are re-fetched from the backend using the `careerId` query param.

The `/api/v1/subjects` and `/api/v1/resources` endpoints are already integrated and unchanged. The `PUBLIC_API_URL` env var is already in place.

## Architecture

### Data flow

```
useFilters (cascade state)
  → getUniversities() on mount
  → getFaculties(universityId) on university change
  → getCareers(facultyId) on faculty change
  → careerId passed to useSubjects

useSubjects(careerId?)
  → getSubjects({ careerId }) re-fetches from server when careerId changes
  → year / quadmester / search filtered client-side

SubjectsView
  → calls both useSubjects and useFilters
  → passes cascade data + setters + existing filters down to FilterBar

FilterBar
  → 3 cascade <select> dropdowns (university → faculty → career)
  → existing year/quadmester chips + search input unchanged
```

### Environment

`PUBLIC_API_URL` in `.env.local` (already set, defaults to `http://localhost:3000` in code).

## Components and Files

### 1. `src/features/home/types/organization.ts` — NEW

Three frontend types with the same shape as the backend responses:

```ts
export type University = { id: string; name: string; slug: string };
export type Faculty    = { id: string; name: string; slug: string; universityId: string };
export type Career     = { id: string; name: string; slug: string; facultyId: string };
```

### 2. `src/shared/services/api.ts` — UPDATE

Add backend types: `BackendUniversity`, `BackendFaculty`, `BackendCareer`.

Add three new API functions:
- `getUniversities(): Promise<ApiResult<University[]>>` → `GET /api/v1/universities`
- `getFaculties(universityId?: string): Promise<ApiResult<Faculty[]>>` → `GET /api/v1/faculties?universityId=...`
- `getCareers(facultyId?: string): Promise<ApiResult<Career[]>>` → `GET /api/v1/careers?facultyId=...`

Update `getSubjects()` to accept `careerId` as an optional param (alongside existing `params` object). Pass it as a query param when present.

### 3. `src/features/home/hooks/useFilters.ts` — NEW

Manages the cascade state. Responsibilities:

- Fetch universities on mount.
- When `universityId` changes: clear `facultyId` and `careerId`, fetch faculties for the new university.
- When `facultyId` changes: clear `careerId`, fetch careers for the new faculty.
- Expose per-level loading flags: `loadingUniversities`, `loadingFaculties`, `loadingCareers`.

Returns:
```ts
{
  universities, faculties, careers,
  universityId, facultyId, careerId,
  setUniversityId, setFacultyId, setCareerId,
  loadingUniversities, loadingFaculties, loadingCareers,
}
```

### 4. `src/features/home/hooks/useSubjects.ts` — UPDATE

- Accept `careerId?: string` param.
- When `careerId` changes, re-fetch subjects from the server with `careerId` as a query param (server-side filtering).
- Remove the `carrer` field from all filter logic (no longer managed here).

### 5. `src/features/home/types/filter.ts` — UPDATE

- Remove `carrer: string` from `FilterT`.
- Add cascade props to `PropsFilterBar`: the three data arrays, three loading flags, and three setters from `useFilters`.

### 6. `src/features/home/constants/filter.ts` — UPDATE

- Remove `carrer` from `INITIAL_FILTERS`.
- Remove `CARRERS_FILTER` (no longer used).

### 7. `src/features/home/components/subjects/FilterBar.tsx` — UPDATE

- Remove static career chip buttons.
- Add 3 cascade `<select>` dropdowns styled consistently with the existing filter bar:
  - **Universidad** (always enabled, populates from `universities`)
  - **Facultad** (disabled until university selected, populates from `faculties`)
  - **Carrera** (disabled until faculty selected, populates from `careers`)
- Each dropdown has a default "Todas" / empty option to clear the selection.
- Show a disabled/loading state while data is being fetched.

### 8. `src/features/home/components/subjects/SubjectsView.tsx` — UPDATE

- Call `useFilters()` alongside `useSubjects(careerId)`.
- Pass `careerId` from `useFilters` into `useSubjects`.
- Pass cascade data and setters to `FilterBar`.

## Error Handling

- API errors in `useFilters` are silently swallowed (empty array fallback) — same pattern as the rest of the app. Dropdowns just show empty if the fetch fails.

## Out of Scope

- Upload form subject selection (no change, still flat list from `getSubjects()`).
- `GET /api/v1/subjects/:id` endpoint (not needed; slug resolution via list fetch is fine).
- Correlatives section (no change).
