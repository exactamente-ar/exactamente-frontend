import { useEffect, useRef } from 'react';
import { studyStore, type StudyStore } from '@/features/study/store/studyStore';
import {
  STUDY_LIVE_ID,
  announcement,
  playChime,
  showNotification,
} from '@/features/study/utils/alerts';

/**
 * Sound, browser notification and live-region announcements. Mount once per
 * page, next to `useStudyEngine`. The store emits events only in the tab that
 * caused the transition, and the end of focus only once (`targetNotified`), so
 * other tabs and reloads stay quiet. Never opens anything (FR-8).
 */
export function useStudyAlerts(store: StudyStore = studyStore) {
  const pending = useRef<string[]>([]);

  useEffect(() => {
    let flush: number | null = null;

    const unsubscribe = store.onEvent((event) => {
      const { sound, notify, autoStartBreak } = store.getSnapshot().settings;

      if (event.type === 'focus-ended') {
        if (sound) playChime();
        if (notify) {
          showNotification(
            `Terminó tu foco de ${event.targetMinutes} min`,
            autoStartBreak ? 'Arrancó tu descanso.' : 'El tiempo extra se sigue contando.',
          );
        }
      } else if (event.type === 'break-ended') {
        if (sound) playChime();
        if (notify) showNotification('Terminó tu descanso', 'Cuando quieras, arrancá otro foco.');
      }

      // Several events can come from one transition (end of focus, session,
      // break): announce them together instead of overwriting each other.
      pending.current.push(announcement(event));
      if (flush !== null) return;
      flush = window.setTimeout(() => {
        flush = null;
        const region = document.getElementById(STUDY_LIVE_ID);
        if (region) region.textContent = pending.current.join(' ');
        pending.current = [];
      }, 0);
    });

    return () => {
      unsubscribe();
      if (flush !== null) window.clearTimeout(flush);
    };
  }, [store]);
}
