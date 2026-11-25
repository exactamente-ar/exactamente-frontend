import {
  EMPTY_GOALS,
  setSubjectGoal,
  setWeeklyGoal,
  type StudyGoals,
} from '@/features/study/domain/goals';
import {
  appendSession,
  deleteSession,
  editSession,
  localDayKey,
  minutesOnDay,
  weekKey,
  type SessionPatch,
  type StudySession,
} from '@/features/study/domain/sessions';
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  type StudySettings,
} from '@/features/study/domain/settings';
import {
  createIdle,
  endFocus,
  pause,
  resume,
  setSubject,
  skipBreak,
  start,
  startBreak,
  tick,
  type StudySubject,
  type TimerState,
  type Transition,
} from '@/features/study/domain/timer';
import {
  STUDY_GOALS_KEY,
  STUDY_LAST_CAREER_KEY,
  STUDY_SESSIONS_KEY,
  STUDY_SETTINGS_KEY,
  STUDY_TIMER_KEY,
  isStorageAvailable,
  readGoals,
  readLastCareer,
  readSessions,
  readSettings,
  readTimer,
  writeGoals,
  writeLastCareer,
  writeSessions,
  writeSettings,
  writeTimer,
  type LastCareer,
} from '@/features/study/utils/studyStorage';

/** What the confirmation toast shows. Only the tab that wrote the session gets one. */
export type StudyCompletion =
  { kind: 'recorded'; session: StudySession; todayMinutes: number } | { kind: 'too-short' };

/** Transitions, for alerts and the live region. Emitted only by the tab that caused them. */
export type StudyEvent =
  | { type: 'focus-started' }
  | { type: 'focus-ended'; targetMinutes: number }
  | { type: 'break-started' }
  | { type: 'break-ended' }
  | { type: 'session-recorded'; session: StudySession; todayMinutes: number }
  | { type: 'session-skipped' };

export type PanelPlacement = 'header' | 'viewer';

export type StudySnapshot = {
  timer: TimerState;
  settings: StudySettings;
  sessions: StudySession[];
  goals: StudyGoals;
  lastCareer: LastCareer | null;
  /** Clock of the last tick; every derived time is computed against it. 0 on the server. */
  now: number;
  completion: StudyCompletion | null;
  /** Per tab, never persisted: the panel does not stay open across pages. */
  openPanel: PanelPlacement | null;
  /** Per tab: while the resource viewer is open, its chip is the only visible one. */
  viewerOpen: boolean;
};

export type StudyStore = ReturnType<typeof createStudyStore>;

type Deps = { now?: () => number; newId?: () => string };

export function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function initialSnapshot(): StudySnapshot {
  return {
    timer: createIdle(),
    settings: DEFAULT_SETTINGS,
    sessions: [],
    goals: EMPTY_GOALS,
    lastCareer: null,
    now: 0,
    completion: null,
    openPanel: null,
    viewerOpen: false,
  };
}

/** Same phase of the same focus, in the same running state: safe to transition from. */
function samePhase(a: TimerState, b: TimerState): boolean {
  if (a.phase !== b.phase) return false;
  if (a.phase === 'focus' && b.phase === 'focus') {
    return (
      a.focusId === b.focusId &&
      a.runningSince === b.runningSince &&
      a.accumulatedMs === b.accumulatedMs &&
      a.targetNotified === b.targetNotified
    );
  }
  if (a.phase === 'break' && b.phase === 'break') return a.startedAt === b.startedAt;
  return true;
}

/**
 * Module-level store shared by every island on the page (Astro islands are
 * separate React trees, but they import the same ES module). Other tabs are
 * kept in sync through the `storage` event. Every mutation re-reads storage
 * first, so a tab that missed an event never transitions from a stale state.
 */
export function createStudyStore(deps: Deps = {}) {
  const now = deps.now ?? (() => Date.now());
  const newId = deps.newId ?? randomId;
  const serverSnapshot = initialSnapshot();
  const listeners = new Set<() => void>();
  const eventListeners = new Set<(event: StudyEvent) => void>();
  let snapshot = serverSnapshot;
  let hydrated = false;
  let persistent = false;

  function emit() {
    for (const listener of listeners) listener();
  }

  function notify(event: StudyEvent) {
    for (const listener of eventListeners) listener(event);
  }

  function set(patch: Partial<StudySnapshot>) {
    snapshot = { ...snapshot, ...patch };
    emit();
  }

  function latestTimer(): TimerState | null {
    return persistent ? readTimer() : null;
  }

  function latestSessions(): StudySession[] {
    return persistent ? readSessions() : snapshot.sessions;
  }

  function latestGoals(): StudyGoals {
    return persistent ? readGoals() : snapshot.goals;
  }

  function todayMinutes(sessions: StudySession[], at: number) {
    return minutesOnDay(sessions, localDayKey(new Date(at)));
  }

  function onStorage(event: StorageEvent) {
    const current = now();
    if (event.key === null) {
      set({ ...readAll(), now: current });
    } else if (event.key === STUDY_TIMER_KEY) {
      set({ timer: readTimer() ?? createIdle(snapshot.timer.subject), now: current });
    } else if (event.key === STUDY_SESSIONS_KEY) {
      set({ sessions: readSessions() });
    } else if (event.key === STUDY_SETTINGS_KEY) {
      set({ settings: readSettings() });
    } else if (event.key === STUDY_GOALS_KEY) {
      set({ goals: readGoals() });
    } else if (event.key === STUDY_LAST_CAREER_KEY) {
      set({ lastCareer: readLastCareer() });
    }
  }

  function readAll() {
    return {
      timer: readTimer() ?? createIdle(),
      settings: readSettings(),
      sessions: readSessions(),
      goals: readGoals(),
      lastCareer: readLastCareer(),
    };
  }

  function hydrate() {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    persistent = isStorageAvailable();
    snapshot = { ...snapshot, ...readAll(), now: now() };
    window.addEventListener('storage', onStorage);
    // Same rule as the live clock (closed-tab rule): a focus that went past its
    // cap while nobody was looking is recorded up to the cap, without emitting
    // during render. Listeners attach later and read the snapshot.
    runTick(false);
  }

  /**
   * Writes a transition: the timer, and the session it registered (idempotent
   * by id, re-reading the stored list). Returns whether this tab added it.
   */
  function commit(result: Transition, at: number, shouldEmit: boolean): StudySession | null {
    writeTimer(result.state);
    const patch: Partial<StudySnapshot> = { timer: result.state, now: at };
    let added: StudySession | null = null;

    if (result.registered) {
      const latest = latestSessions();
      const appended = appendSession(latest, result.registered);
      if (appended.added) {
        writeSessions(appended.sessions);
        added = result.registered;
        patch.completion = {
          kind: 'recorded',
          session: added,
          todayMinutes: todayMinutes(appended.sessions, at),
        };
      }
      patch.sessions = appended.sessions;
    } else if (result.skipped === 'too-short') {
      patch.completion = { kind: 'too-short' };
    }

    snapshot = { ...snapshot, ...patch };
    if (shouldEmit) emit();
    if (shouldEmit && added && patch.completion?.kind === 'recorded') {
      notify({
        type: 'session-recorded',
        session: added,
        todayMinutes: patch.completion.todayMinutes,
      });
    }
    if (shouldEmit && result.skipped === 'too-short') notify({ type: 'session-skipped' });
    return added;
  }

  /**
   * Read-latest → pure transition → write. If another tab already moved the
   * timer to another phase, adopt what it stored instead of transitioning.
   */
  function transition(fn: (timer: TimerState, at: number) => Transition): boolean {
    hydrate();
    const at = now();
    const stored = latestTimer();
    if (stored && !samePhase(stored, snapshot.timer)) {
      set({ timer: stored, sessions: latestSessions(), now: at });
      return false;
    }
    const base = stored ?? snapshot.timer;
    const result = fn(base, at);
    if (result.state === base && !result.registered && !result.skipped) return false;
    commit(result, at, true);
    return true;
  }

  function runTick(shouldEmit: boolean) {
    const at = now();
    const { timer, settings } = snapshot;
    const result = tick(timer, settings, at);
    if (result.state === timer && !result.registered) {
      snapshot = { ...snapshot, now: at };
      if (shouldEmit) emit();
      return;
    }

    const stored = latestTimer();
    if (stored && !samePhase(stored, timer)) {
      snapshot = { ...snapshot, timer: stored, sessions: latestSessions(), now: at };
      if (shouldEmit) emit();
      return;
    }

    commit(result, at, shouldEmit);
    if (!shouldEmit) return;
    if (result.alert === 'focus-ended' && timer.phase === 'focus') {
      notify({ type: 'focus-ended', targetMinutes: Math.round(timer.targetMs / 60_000) });
    }
    if (result.state.phase === 'break' && timer.phase !== 'break')
      notify({ type: 'break-started' });
    if (result.alert === 'break-ended') notify({ type: 'break-ended' });
  }

  function updateSettings(patch: Partial<StudySettings>) {
    hydrate();
    const settings = normalizeSettings({ ...snapshot.settings, ...patch });
    writeSettings(settings);
    set({ settings });
  }

  function currentWeek() {
    return weekKey(new Date(now()));
  }

  function writeGoalsAndSet(goals: StudyGoals) {
    writeGoals(goals);
    set({ goals });
  }

  return {
    getSnapshot(): StudySnapshot {
      hydrate();
      return snapshot;
    },
    getServerSnapshot(): StudySnapshot {
      return serverSnapshot;
    },
    subscribe(listener: () => void) {
      hydrate();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    onEvent(listener: (event: StudyEvent) => void) {
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },
    tick() {
      hydrate();
      runTick(true);
    },
    start() {
      const started = transition((timer, at) => ({
        state: start(timer, snapshot.settings, at, newId),
        registered: null,
        skipped: null,
      }));
      if (started) notify({ type: 'focus-started' });
    },
    pause() {
      transition((timer, at) => ({ state: pause(timer, at), registered: null, skipped: null }));
    },
    resume() {
      transition((timer, at) => ({ state: resume(timer, at), registered: null, skipped: null }));
    },
    endFocus() {
      transition((timer, at) => endFocus(timer, at));
    },
    startBreak() {
      const started = transition((timer, at) => startBreak(timer, snapshot.settings, at));
      if (started && snapshot.timer.phase === 'break') notify({ type: 'break-started' });
    },
    skipBreak() {
      transition((timer) => ({ state: skipBreak(timer), registered: null, skipped: null }));
    },
    setSubject(subject: StudySubject | null) {
      const changed = transition((timer) => ({
        state: setSubject(timer, subject),
        registered: null,
        skipped: null,
      }));
      if (changed && subject) {
        const lastCareer = { careerId: subject.careerId, careerName: subject.careerName };
        writeLastCareer(lastCareer);
        set({ lastCareer });
      }
    },
    setLastCareer(lastCareer: LastCareer) {
      hydrate();
      writeLastCareer(lastCareer);
      set({ lastCareer });
    },
    /** Presets and settings apply to the next focus, never the one running. */
    setFocusMinutes(minutes: number) {
      updateSettings({ focusMin: minutes });
    },
    updateSettings,
    editSession(id: string, patch: SessionPatch): boolean {
      hydrate();
      const sessions = editSession(latestSessions(), id, patch, new Date(now()));
      if (!sessions) return false;
      writeSessions(sessions);
      set({ sessions });
      return true;
    },
    deleteSession(id: string) {
      hydrate();
      const sessions = deleteSession(latestSessions(), id);
      writeSessions(sessions);
      set({ sessions });
    },
    setWeeklyGoal(hours: number | null) {
      hydrate();
      writeGoalsAndSet(setWeeklyGoal(latestGoals(), currentWeek(), hours));
    },
    setSubjectGoal(subject: { subjectId: string; subjectName: string }, hours: number | null) {
      hydrate();
      writeGoalsAndSet(setSubjectGoal(latestGoals(), subject, currentWeek(), hours));
    },
    togglePanel(placement: PanelPlacement) {
      hydrate();
      set({ openPanel: snapshot.openPanel === placement ? null : placement });
    },
    setPanelOpen(placement: PanelPlacement, open: boolean) {
      hydrate();
      if (open) set({ openPanel: placement });
      else if (snapshot.openPanel === placement) set({ openPanel: null });
    },
    setViewerOpen(viewerOpen: boolean) {
      hydrate();
      if (snapshot.viewerOpen === viewerOpen) return;
      const closing = viewerOpen ? 'header' : 'viewer';
      set({
        viewerOpen,
        openPanel: snapshot.openPanel === closing ? null : snapshot.openPanel,
      });
    },
    dismissCompletion() {
      if (snapshot.completion) set({ completion: null });
    },
  };
}

export const studyStore = createStudyStore();
