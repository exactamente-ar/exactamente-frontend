import { useEffect, useRef, useState } from 'react';
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

  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Initialize from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const universityId = params.get('university') ?? '';
    const facultyId = universityId ? (params.get('faculty') ?? '') : '';
    const careerId = facultyId ? (params.get('career') ?? '') : '';
    const planId = careerId ? (params.get('plan') ?? '') : '';
    const rawYear = careerId ? Number(params.get('year') ?? 0) : 0;
    const year = Number.isFinite(rawYear) ? rawYear : 0;
    const rawQuadmester = careerId ? Number(params.get('quadmester') ?? 0) : 0;
    const quadmester = Number.isFinite(rawQuadmester) ? rawQuadmester : 0;
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
    setApplied((prev) => ({ ...draftRef.current, search: prev.search }));
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
