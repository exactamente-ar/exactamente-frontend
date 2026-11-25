import { EMPTY_GOALS, type GoalEntry, type StudyGoals } from '@/features/study/domain/goals';
import type { EndReason, StudySession } from '@/features/study/domain/sessions';
import { normalizeSettings, type StudySettings } from '@/features/study/domain/settings';
import type { StudySubject, TimerState } from '@/features/study/domain/timer';

// `exactamente:<name>:vN`. Changing a stored shape means bumping N; the spike's
// v1 keys are deliberately never read.
export const STUDY_TIMER_KEY = 'exactamente:studyTimer:v2';
export const STUDY_SESSIONS_KEY = 'exactamente:studySessions:v2';
export const STUDY_SETTINGS_KEY = 'exactamente:studySettings:v2';
export const STUDY_GOALS_KEY = 'exactamente:studyGoals:v1';
export const STUDY_LAST_CAREER_KEY = 'exactamente:studyLastCareer:v1';

export const STUDY_STORAGE_KEYS = [
  STUDY_TIMER_KEY,
  STUDY_SESSIONS_KEY,
  STUDY_SETTINGS_KEY,
  STUDY_GOALS_KEY,
  STUDY_LAST_CAREER_KEY,
] as const;

const SESSIONS_VERSION = 2;
const GOALS_VERSION = 1;

export type LastCareer = { careerId: string; careerName: string };

// Same contract as `storedFaculty`: storage is a convenience. Private mode,
// a full quota or blocked site data degrade to "nothing stored", never a crash.
function readRaw(key: string): unknown {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota full or private mode: keep going without persisting.
  }
}

const END_REASONS: EndReason[] = ['manual', 'break', 'cap', 'auto-break'];
const WEEK_KEY = /^\d{4}-\d{2}-\d{2}$/;

const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const isIsoDate = (v: unknown): v is string => isString(v) && !Number.isNaN(Date.parse(v));
const isWholeMinutes = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1;

function parseSubject(raw: unknown): StudySubject | null {
  if (!isRecord(raw)) return null;
  const { careerId, careerName, subjectId, subjectName } = raw;
  if (!isString(careerId) || !isString(careerName)) return null;
  if (!isString(subjectId) || !isString(subjectName)) return null;
  return { careerId, careerName, subjectId, subjectName };
}

export function parseTimer(raw: unknown): TimerState | null {
  if (!isRecord(raw)) return null;
  const subject = raw.subject === null ? null : parseSubject(raw.subject);
  if (raw.subject !== null && subject === null) return null;

  if (raw.phase === 'idle') return { phase: 'idle', subject };

  if (raw.phase === 'break') {
    const { startedAt, targetMs } = raw;
    if (!isNumber(startedAt) || !isNumber(targetMs)) return null;
    return { phase: 'break', subject, startedAt, targetMs };
  }

  if (raw.phase === 'focus') {
    const { focusId, startedAt, targetMs, runningSince, accumulatedMs, targetNotified } = raw;
    if (!subject || !isString(focusId) || !isNumber(startedAt) || !isNumber(targetMs)) {
      return null;
    }
    if (runningSince !== null && !isNumber(runningSince)) return null;
    if (!isNumber(accumulatedMs) || typeof targetNotified !== 'boolean') return null;
    return {
      phase: 'focus',
      focusId,
      subject,
      startedAt,
      targetMs,
      runningSince,
      accumulatedMs,
      targetNotified,
    };
  }

  return null;
}

function parseSession(raw: unknown): StudySession | null {
  if (!isRecord(raw)) return null;
  const subject = parseSubject(raw);
  const { id, startedAt, endedAt, minutes, recordedMinutes, endReason, updatedAt } = raw;
  if (!subject || !isString(id)) return null;
  if (!isIsoDate(startedAt) || !isIsoDate(endedAt) || !isIsoDate(updatedAt)) return null;
  if (!isWholeMinutes(minutes) || !isWholeMinutes(recordedMinutes)) return null;
  if (minutes > recordedMinutes) return null;
  if (!END_REASONS.includes(endReason as EndReason)) return null;
  return {
    id,
    startedAt,
    endedAt,
    minutes,
    recordedMinutes,
    endReason: endReason as EndReason,
    ...subject,
    updatedAt,
  };
}

export function parseSessions(raw: unknown): StudySession[] {
  if (!isRecord(raw) || raw.version !== SESSIONS_VERSION || !Array.isArray(raw.sessions)) {
    return [];
  }
  return raw.sessions.map(parseSession).filter((s): s is StudySession => s !== null);
}

function parseEntries(raw: unknown): GoalEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (e): e is GoalEntry =>
      isRecord(e) &&
      typeof e.from === 'string' &&
      WEEK_KEY.test(e.from) &&
      (e.hours === null || (isNumber(e.hours) && e.hours > 0)),
  );
}

export function parseGoals(raw: unknown): StudyGoals {
  if (!isRecord(raw) || raw.version !== GOALS_VERSION) return EMPTY_GOALS;
  const bySubject: StudyGoals['bySubject'] = {};
  if (isRecord(raw.bySubject)) {
    for (const [subjectId, value] of Object.entries(raw.bySubject)) {
      if (!isRecord(value) || !isString(value.subjectName)) continue;
      bySubject[subjectId] = {
        subjectName: value.subjectName,
        entries: parseEntries(value.entries),
      };
    }
  }
  return { weekly: parseEntries(raw.weekly), bySubject };
}

function parseLastCareer(raw: unknown): LastCareer | null {
  if (!isRecord(raw) || !isString(raw.careerId) || !isString(raw.careerName)) return null;
  return { careerId: raw.careerId, careerName: raw.careerName };
}

export function readTimer(): TimerState | null {
  return parseTimer(readRaw(STUDY_TIMER_KEY));
}

export function writeTimer(timer: TimerState): void {
  writeRaw(STUDY_TIMER_KEY, timer);
}

export function readSessions(): StudySession[] {
  return parseSessions(readRaw(STUDY_SESSIONS_KEY));
}

/** Versioned envelope so the backend migration can tell formats apart. */
export function writeSessions(sessions: StudySession[]): void {
  writeRaw(STUDY_SESSIONS_KEY, { version: SESSIONS_VERSION, sessions });
}

export function readGoals(): StudyGoals {
  return parseGoals(readRaw(STUDY_GOALS_KEY));
}

export function writeGoals(goals: StudyGoals): void {
  writeRaw(STUDY_GOALS_KEY, { version: GOALS_VERSION, ...goals });
}

export function readSettings(): StudySettings {
  return normalizeSettings(readRaw(STUDY_SETTINGS_KEY));
}

export function writeSettings(settings: StudySettings): void {
  writeRaw(STUDY_SETTINGS_KEY, settings);
}

export function readLastCareer(): LastCareer | null {
  return parseLastCareer(readRaw(STUDY_LAST_CAREER_KEY));
}

export function writeLastCareer(career: LastCareer): void {
  writeRaw(STUDY_LAST_CAREER_KEY, career);
}
