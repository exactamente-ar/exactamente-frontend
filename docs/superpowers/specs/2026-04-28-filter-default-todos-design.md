# Filter Default "Todos" — Design Spec

**Date:** 2026-04-28

## Problem

Currently `useSubjects` requires a `careerId` before fetching any subjects. Without a career selected, the list is empty. Users must navigate university → faculty → career before seeing anything. The goal is: no filters selected = show all subjects (default "Todos").

Additionally, the client-side search only covers the subjects already fetched. If there are 100+ subjects in total and no career is selected, search by name misses subjects beyond the limit.

## Solution

Move filter logic to the backend. Instead of fetching once per career and filtering client-side, pass all applicable filters as query params to `GET /api/v1/subjects`.

The backend already supports: `careerId`, `facultyId`, `year`, `quadmester`, `search` (partial title match), `page`, `limit`.

`planId` is not supported by the backend — it remains client-side only.

## Architecture

### Before

```
useSubjects:
  fetch effect   → triggered by careerId change only
                 → if no careerId: early return, allSubjects = []
                 → if careerId: getSubjects({ careerId })
  filter effect  → triggered by any filter change, debounced 300ms
                 → client-side: search, year, quadmester, planId
```

### After

```
useSubjects:
  fetch effect   → triggered by careerId, search, year, quadmester changes
                 → debounced 300ms (same debounce as current filter effect)
                 → no early return: always fetches
                 → passes applicable params to getSubjects()
                 → params: careerId?, search?, year?, quadmester?
  filter effect  → triggered by planId change + allSubjects change
                 → client-side: planId only + sort
```

### Params logic

| Filter | Included in API call? | Condition |
|---|---|---|
| `careerId` | Yes | if non-empty string |
| `search` | Yes | if non-empty string |
| `year` | Yes | if !== 0 |
| `quadmester` | Yes | if !== 0 |
| `planId` | No | always client-side |

When no params apply (default state): calls `getSubjects()` with no filters → backend returns all subjects.

### Limit

`limit=100` is kept. Sufficient for browsing. For search, matching subjects for a given title fragment are unlikely to exceed 100 in practice. Can be revisited if needed.

## Files Changed

| File | Change |
|---|---|
| `src/features/home/hooks/useSubjects.ts` | Main change: remove careerId guard, merge effects, pass params to API |

## Files Unchanged

- `src/shared/services/api.ts` — `getSubjects(params?)` already accepts arbitrary params, no change needed
- `src/features/home/hooks/useFilterState.ts` — no change
- `src/features/home/hooks/useFilterOptions.ts` — no change
- All components — no change

## Behavior Summary

| Scenario | Before | After |
|---|---|---|
| No filters | Empty list | All subjects (up to 100) |
| Search only | Empty (no career) | Subjects matching name via API |
| Career selected | Subjects for career | Subjects for career (same) |
| Career + search | Client-side search on career subjects | API search within career |
| Career + year | Client-side | API param |
| Career + quadmester | Client-side | API param |
| planId filter | Client-side | Client-side (unchanged) |

## Non-Goals

- Pagination of the full subjects list (out of scope)
- Increasing limit beyond 100 (not needed currently)
- Any changes to filter UI or state management
