import type { EndReason, StudySession } from './sessions';
import type { StudySettings } from './settings';

/** Real ids and names, so stored sessions can later be sent to the backend as-is. */
export type StudySubject = {
  careerId: string;
  careerName: string;
  subjectId: string;
  subjectName: string;
};

/**
 * Timestamp-based timer: the stored state never holds a counter. A running
 * focus keeps `runningSince`; pausing folds the run into `accumulatedMs`.
 * Everything else (remaining, overtime) is derived from `now`.
 */
export type TimerState =
  | { phase: 'idle'; subject: StudySubject | null }
  | {
      phase: 'focus';
      focusId: string;
      subject: StudySubject;
      startedAt: number;
      targetMs: number;
      runningSince: number | null;
      accumulatedMs: number;
      /** Set once the end-of-focus alert fired, so no tab or reload repeats it. */
      targetNotified: boolean;
    }
  // A break cannot be paused, only skipped, so its start and length are enough.
  | { phase: 'break'; subject: StudySubject | null; startedAt: number; targetMs: number };

type FocusState = Extract<TimerState, { phase: 'focus' }>;
type BreakState = Extract<TimerState, { phase: 'break' }>;

export type Transition = {
  state: TimerState;
  registered: StudySession | null;
  /** Why a finished focus was not registered. */
  skipped: 'too-short' | null;
};

export type TickResult = Transition & { alert: 'focus-ended' | 'break-ended' | null };

const MINUTE = 60_000;
/** Overtime stops counting after an hour: a forgotten tab must not inflate the stats. */
export const OVERTIME_CAP_MS = 60 * MINUTE;

export function createIdle(subject: StudySubject | null = null): TimerState {
  return { phase: 'idle', subject };
}

export function elapsedMs(state: TimerState, now: number): number {
  if (state.phase !== 'focus') return 0;
  const running = state.runningSince === null ? 0 : Math.max(0, now - state.runningSince);
  return state.accumulatedMs + running;
}

export function remainingMs(state: TimerState, now: number): number {
  if (state.phase === 'focus') return Math.max(0, state.targetMs - elapsedMs(state, now));
  if (state.phase === 'break') return Math.max(0, state.startedAt + state.targetMs - now);
  return 0;
}

export function overtimeMs(state: TimerState, now: number): number {
  if (state.phase !== 'focus') return 0;
  return Math.max(0, elapsedMs(state, now) - state.targetMs);
}

export function isRunning(state: TimerState): boolean {
  return state.phase === 'break' || (state.phase === 'focus' && state.runningSince !== null);
}

export function canStart(state: TimerState): boolean {
  return state.phase === 'idle' && state.subject !== null;
}

export function start(
  state: TimerState,
  settings: StudySettings,
  now: number,
  newId: () => string,
): TimerState {
  if (state.phase !== 'idle' || state.subject === null) return state;
  return {
    phase: 'focus',
    focusId: newId(),
    subject: state.subject,
    startedAt: now,
    targetMs: settings.focusMin * MINUTE,
    runningSince: now,
    accumulatedMs: 0,
    targetNotified: false,
  };
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.phase !== 'focus' || state.runningSince === null) return state;
  return { ...state, accumulatedMs: elapsedMs(state, now), runningSince: null };
}

export function resume(state: TimerState, now: number): TimerState {
  if (state.phase !== 'focus' || state.runningSince !== null) return state;
  return { ...state, runningSince: now };
}

/** The subject is fixed once a focus starts; it is corrected later by editing the session. */
export function setSubject(state: TimerState, subject: StudySubject | null): TimerState {
  if (state.phase === 'focus') return state;
  return { ...state, subject };
}

function buildSession(
  focus: FocusState,
  minutes: number,
  endedAt: number,
  endReason: EndReason,
): StudySession {
  const ended = new Date(endedAt).toISOString();
  return {
    id: focus.focusId,
    startedAt: new Date(focus.startedAt).toISOString(),
    endedAt: ended,
    minutes,
    recordedMinutes: minutes,
    endReason,
    ...focus.subject,
    updatedAt: ended,
  };
}

/** Closes a focus by hand or by starting a break: credits what actually ran. */
function closeFocus(
  focus: FocusState,
  now: number,
  endReason: 'manual' | 'break',
): Omit<Transition, 'state'> {
  const minutes = Math.round(elapsedMs(focus, now) / MINUTE);
  if (minutes < 1) return { registered: null, skipped: 'too-short' };
  return { registered: buildSession(focus, minutes, now, endReason), skipped: null };
}

function enterBreak(
  subject: StudySubject | null,
  settings: StudySettings,
  startedAt: number,
): BreakState {
  return { phase: 'break', subject, startedAt, targetMs: settings.breakMin * MINUTE };
}

export function endFocus(state: TimerState, now: number): Transition {
  if (state.phase !== 'focus') return { state, registered: null, skipped: null };
  return { state: createIdle(state.subject), ...closeFocus(state, now, 'manual') };
}

export function startBreak(state: TimerState, settings: StudySettings, now: number): Transition {
  if (state.phase !== 'focus') return { state, registered: null, skipped: null };
  return {
    state: enterBreak(state.subject, settings, now),
    ...closeFocus(state, now, 'break'),
  };
}

export function skipBreak(state: TimerState): TimerState {
  if (state.phase !== 'break') return state;
  return createIdle(state.subject);
}

/**
 * Runs every 250 ms while something runs, and once on hydration: a tab reopened
 * hours later gets exactly the result it would have had if it stayed open.
 */
export function tick(state: TimerState, settings: StudySettings, now: number): TickResult {
  const none: TickResult = { state, registered: null, skipped: null, alert: null };

  if (state.phase === 'break') {
    if (now < state.startedAt + state.targetMs) return none;
    return { ...none, state: createIdle(state.subject), alert: 'break-ended' };
  }

  if (state.phase !== 'focus' || state.runningSince === null) return none;

  const elapsed = elapsedMs(state, now);
  // While running, the instant `elapsed` reached `mark` is `now - (elapsed - mark)`.
  const instantOf = (mark: number) => now - (elapsed - mark);

  if (settings.autoStartBreak && elapsed >= state.targetMs) {
    const reachedAt = instantOf(state.targetMs);
    const minutes = Math.round(state.targetMs / MINUTE);
    const registered = buildSession(state, minutes, reachedAt, 'auto-break');
    const next = tick(enterBreak(state.subject, settings, reachedAt), settings, now);
    return { state: next.state, registered, skipped: null, alert: 'focus-ended' };
  }

  const capMs = state.targetMs + OVERTIME_CAP_MS;
  if (elapsed >= capMs) {
    const minutes = Math.round(capMs / MINUTE);
    return {
      ...none,
      state: createIdle(state.subject),
      registered: buildSession(state, minutes, instantOf(capMs), 'cap'),
    };
  }

  if (elapsed >= state.targetMs && !state.targetNotified) {
    return { ...none, state: { ...state, targetNotified: true }, alert: 'focus-ended' };
  }

  return none;
}
