import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudySubject } from '@/features/study/domain/timer';
import { createStudyStore } from '@/features/study/store/studyStore';
import { writeSessions } from '@/features/study/utils/studyStorage';
import { useStudy } from './useStudy';
import { useStudyEngine } from './useStudyEngine';

const MIN = 60_000;
const SUBJECT: StudySubject = {
  careerId: 'c1',
  careerName: 'Ing. en Sistemas',
  subjectId: 's1',
  subjectName: 'Cálculo II',
};

let clock = 0;
const deps = () => ({ now: () => clock, newId: () => 'focus-1' });

beforeEach(() => {
  localStorage.clear();
  clock = new Date(2026, 10, 25, 10, 0).getTime();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useStudy', () => {
  it('en foco expone restante, extra, hoy, semana y la Meta Semanal vigente', () => {
    writeSessions([
      {
        id: 'old',
        startedAt: new Date(2026, 10, 24, 9, 0).toISOString(),
        endedAt: new Date(2026, 10, 24, 10, 0).toISOString(),
        minutes: 60,
        recordedMinutes: 60,
        endReason: 'manual',
        ...SUBJECT,
        updatedAt: new Date(2026, 10, 24, 10, 0).toISOString(),
      },
    ]);
    const store = createStudyStore(deps());
    store.setWeeklyGoal(12);
    store.setSubject(SUBJECT);
    store.start();

    const { result } = renderHook(() => useStudy(store));
    act(() => {
      clock += 20 * MIN;
      store.tick();
    });

    expect(result.current.remainingMs).toBe(30 * MIN);
    expect(result.current.overtimeMs).toBe(0);
    expect(result.current.todayMinutes).toBe(0);
    expect(result.current.weekMinutes).toBe(60);
    expect(result.current.weeklyGoal).toBe(12);
    expect(result.current.running).toBe(true);

    act(() => {
      clock += 38 * MIN;
      store.tick();
    });
    expect(result.current.overtimeMs).toBe(8 * MIN);
    expect(result.current.inOvertime).toBe(true);
  });
});

describe('useStudyEngine', () => {
  it('al volver a ser visible corre tick y el tiempo mostrado es el correcto', () => {
    const store = createStudyStore(deps());
    store.setSubject(SUBJECT);
    store.start();
    renderHook(() => useStudyEngine(store));
    const { result } = renderHook(() => useStudy(store));

    // Background tabs throttle intervals; simulate one that never fired.
    clock += 30 * MIN;
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.remainingMs).toBe(20 * MIN);
  });

  it('mientras corre hace tick cada 250 ms', () => {
    vi.useFakeTimers();
    const store = createStudyStore(deps());
    store.setSubject(SUBJECT);
    store.start();
    const tick = vi.spyOn(store, 'tick');
    renderHook(() => useStudyEngine(store));
    tick.mockClear();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(tick).toHaveBeenCalledTimes(4);
  });
});
