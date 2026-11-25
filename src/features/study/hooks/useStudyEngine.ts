import { useEffect, useSyncExternalStore } from 'react';
import { isRunning } from '@/features/study/domain/timer';
import { studyStore, type StudyStore } from '@/features/study/store/studyStore';

const TICK_MS = 250;
/** While idle, a slow tick keeps `now` fresh so day, week and streak roll over at midnight. */
const IDLE_TICK_MS = 60_000;

/**
 * Drives the clock. Mount it once per page (the header chip does): it ticks
 * fast while something runs and once a minute while idle, and a tick on mount
 * or when the tab becomes visible catches what happened while nobody was looking.
 */
export function useStudyEngine(store: StudyStore = studyStore) {
  const running = useSyncExternalStore(
    store.subscribe,
    () => isRunning(store.getSnapshot().timer),
    () => false,
  );

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') store.tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [store]);

  useEffect(() => {
    store.tick();
    const id = window.setInterval(() => store.tick(), running ? TICK_MS : IDLE_TICK_MS);
    return () => window.clearInterval(id);
  }, [running, store]);
}
