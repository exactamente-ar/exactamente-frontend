# Filter Default "Todos" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the careerId guard so subjects load by default, and move search/year/quadmester filtering to the backend API.

**Architecture:** Rewrite `useSubjects.ts` to merge two effects into one debounced fetch effect that passes applicable filters to the API. Only `planId` stays client-side (not supported by backend). No other files change.

**Tech Stack:** React 19, TypeScript strict, Astro 5, pnpm. No testing framework — verify manually via `pnpm dev`.

---

### Task 1: Rewrite `useSubjects.ts`

**Files:**
- Modify: `src/features/home/hooks/useSubjects.ts`

- [ ] **Step 1: Read the current file**

Read `src/features/home/hooks/useSubjects.ts` to confirm it matches the expected state before editing.

- [ ] **Step 2: Replace the entire file content**

```ts
import { useEffect, useMemo, useState } from 'react';
import { getSubjects } from '@/shared/services/api';
import type { Subject } from '@/features/home/types/subjects';
import type { AppliedFilters, FilterOption } from '@/features/home/types/filter';

const PAGE_SIZE = 9;

export const useSubjects = (appliedFilters: AppliedFilters) => {
  const [fetchedSubjects, setFetchedSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  // Fetch from API whenever any backend-supported filter changes.
  // Debounced 300ms so fast search keystrokes don't flood the API.
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (appliedFilters.careerId) params.careerId = appliedFilters.careerId;
    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.year !== 0) params.year = String(appliedFilters.year);
    if (appliedFilters.quadmester !== 0) params.quadmester = String(appliedFilters.quadmester);

    const timer = setTimeout(() => {
      getSubjects(Object.keys(params).length ? params : undefined).then((result) => {
        setFetchedSubjects(result.error ? [] : result.data);
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [appliedFilters.careerId, appliedFilters.search, appliedFilters.year, appliedFilters.quadmester]);

  // Client-side filter: planId only (backend does not support it).
  useEffect(() => {
    const result = fetchedSubjects
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
  }, [appliedFilters.planId, appliedFilters.careerId, fetchedSubjects]);

  const planOptions = useMemo((): FilterOption[] => {
    if (!appliedFilters.careerId) return [];
    const planSet = new Set<string>();
    fetchedSubjects.forEach((s) => {
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
  }, [fetchedSubjects, appliedFilters.careerId]);

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

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm astro check
```

Expected: no errors. If there are errors, fix them before continuing.

- [ ] **Step 4: Start dev server and verify manually**

```bash
pnpm dev
```

Open `http://localhost:4321` and check:

1. **Default state** — page loads and shows subjects immediately without selecting any filter
2. **Search by name (no filters)** — type a subject name in the search box; results update to matching subjects from the full catalogue
3. **Career filter** — select a university → faculty → career, apply; list narrows to that career's subjects
4. **Year filter** — select a year within a career; list narrows correctly
5. **Cuatrimestre filter** — same as year
6. **Plan filter** — select a plan; list narrows correctly (client-side)
7. **Clear all** — restores default state (all subjects visible)
8. **URL state** — applying filters updates the query string; refreshing restores the same filtered state

- [ ] **Step 5: Commit**

```bash
git add src/features/home/hooks/useSubjects.ts
git commit -m "feat(filter): show all subjects by default, move search/year/quadmester to API"
```
