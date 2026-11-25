import { useSyncExternalStore } from 'react';
import { weeklyGoalFor } from '@/features/study/domain/goals';
import { localDayKey, minutesOnDay, weekKey } from '@/features/study/domain/sessions';
import {
  canStart,
  elapsedMs,
  isRunning,
  overtimeMs,
  remainingMs,
} from '@/features/study/domain/timer';
import { studyStore, type StudyStore } from '@/features/study/store/studyStore';
import { weekMinutes } from '@/features/study/utils/metrics';

/** Reads the shared store and derives every time from its last tick. */
export function useStudy(store: StudyStore = studyStore) {
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const { timer, now, sessions, goals } = snapshot;
  // `now` is 0 in the server snapshot; there are no sessions there either.
  const today = now ? new Date(now) : null;
  const overtime = overtimeMs(timer, now);
  return {
    ...snapshot,
    elapsedMs: elapsedMs(timer, now),
    remainingMs: remainingMs(timer, now),
    overtimeMs: overtime,
    inOvertime: timer.phase === 'focus' && elapsedMs(timer, now) >= timer.targetMs,
    running: isRunning(timer),
    canStart: canStart(timer),
    todayMinutes: today ? minutesOnDay(sessions, localDayKey(today)) : 0,
    weekMinutes: today ? weekMinutes(sessions, today, 0) : 0,
    weeklyGoal: today ? weeklyGoalFor(goals, weekKey(today)) : null,
  };
}

export type StudyView = ReturnType<typeof useStudy>;
