import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/features/study/domain/settings';
import type { StudySession } from '@/features/study/domain/sessions';
import type { TimerState } from '@/features/study/domain/timer';
import {
  STUDY_GOALS_KEY,
  STUDY_LAST_CAREER_KEY,
  STUDY_SESSIONS_KEY,
  STUDY_SETTINGS_KEY,
  STUDY_TIMER_KEY,
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
} from './studyStorage';

const SUBJECT = {
  careerId: 'c1',
  careerName: 'Ing. en Sistemas',
  subjectId: 's1',
  subjectName: 'Cálculo II',
};

const SESSION: StudySession = {
  id: 'a',
  startedAt: '2026-11-12T13:00:00.000Z',
  endedAt: '2026-11-12T13:58:00.000Z',
  minutes: 58,
  recordedMinutes: 58,
  endReason: 'break',
  ...SUBJECT,
  updatedAt: '2026-11-12T13:58:00.000Z',
};

const FOCUS: TimerState = {
  phase: 'focus',
  focusId: 'f1',
  subject: SUBJECT,
  startedAt: 1000,
  targetMs: 50 * 60_000,
  runningSince: 1000,
  accumulatedMs: 0,
  targetNotified: false,
};

const raw = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('claves versionadas', () => {
  it('usa las claves de la arquitectura', () => {
    expect(STUDY_TIMER_KEY).toBe('exactamente:studyTimer:v2');
    expect(STUDY_SESSIONS_KEY).toBe('exactamente:studySessions:v2');
    expect(STUDY_SETTINGS_KEY).toBe('exactamente:studySettings:v2');
    expect(STUDY_GOALS_KEY).toBe('exactamente:studyGoals:v1');
    expect(STUDY_LAST_CAREER_KEY).toBe('exactamente:studyLastCareer:v1');
  });

  it('sesiones y metas van en un envoltorio con versión', () => {
    writeSessions([SESSION]);
    writeGoals({ weekly: [{ from: '2026-11-10', hours: 10 }], bySubject: {} });

    expect(raw(STUDY_SESSIONS_KEY)).toEqual({ version: 2, sessions: [SESSION] });
    expect(raw(STUDY_GOALS_KEY)).toEqual({
      version: 1,
      weekly: [{ from: '2026-11-10', hours: 10 }],
      bySubject: {},
    });
  });
});

describe('ida y vuelta', () => {
  it('timer, sesiones, metas, preferencias y última carrera', () => {
    const goals = {
      weekly: [{ from: '2026-11-10', hours: 10 }],
      bySubject: {
        s1: { subjectName: 'Cálculo II', entries: [{ from: '2026-11-10', hours: null }] },
      },
    };
    writeTimer(FOCUS);
    writeSessions([SESSION]);
    writeGoals(goals);
    writeSettings({ ...DEFAULT_SETTINGS, focusMin: 25 });
    writeLastCareer({ careerId: 'c1', careerName: 'Ing. en Sistemas' });

    expect(readTimer()).toEqual(FOCUS);
    expect(readSessions()).toEqual([SESSION]);
    expect(readGoals()).toEqual(goals);
    expect(readSettings()).toEqual({ ...DEFAULT_SETTINGS, focusMin: 25 });
    expect(readLastCareer()).toEqual({ careerId: 'c1', careerName: 'Ing. en Sistemas' });
  });

  it('timer en reposo y en descanso', () => {
    writeTimer({ phase: 'idle', subject: null });
    expect(readTimer()).toEqual({ phase: 'idle', subject: null });

    const breakState: TimerState = {
      phase: 'break',
      subject: SUBJECT,
      startedAt: 5,
      targetMs: 600_000,
    };
    writeTimer(breakState);
    expect(readTimer()).toEqual(breakState);
  });
});

describe('lectura defensiva', () => {
  it('sin nada guardado devuelve vacío', () => {
    expect(readTimer()).toBeNull();
    expect(readSessions()).toEqual([]);
    expect(readGoals()).toEqual({ weekly: [], bySubject: {} });
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
    expect(readLastCareer()).toBeNull();
  });

  it('JSON corrupto se lee como nada guardado', () => {
    for (const key of [STUDY_TIMER_KEY, STUDY_SESSIONS_KEY, STUDY_GOALS_KEY]) {
      localStorage.setItem(key, '{no es json');
    }

    expect(readTimer()).toBeNull();
    expect(readSessions()).toEqual([]);
    expect(readGoals()).toEqual({ weekly: [], bySubject: {} });
  });

  it('un timer con la forma del spike (v1) no se lee', () => {
    localStorage.setItem(
      STUDY_TIMER_KEY,
      JSON.stringify({ mode: 'focus', running: true, endAt: 5, remainingMs: 1, durationMs: 1 }),
    );

    expect(readTimer()).toBeNull();
  });

  it('un foco sin materia o con números inválidos no se lee', () => {
    localStorage.setItem(STUDY_TIMER_KEY, JSON.stringify({ ...FOCUS, subject: null }));
    expect(readTimer()).toBeNull();

    localStorage.setItem(STUDY_TIMER_KEY, JSON.stringify({ ...FOCUS, accumulatedMs: 'x' }));
    expect(readTimer()).toBeNull();
  });

  it('descarta sesiones con forma vieja o inválida y conserva las buenas', () => {
    localStorage.setItem(
      STUDY_SESSIONS_KEY,
      JSON.stringify({
        version: 2,
        sessions: [
          SESSION,
          { id: 'old', startedAt: SESSION.startedAt, minutes: 25, ...SUBJECT },
          { ...SESSION, id: 'b', minutes: 0 },
          { ...SESSION, id: 'c', minutes: 70 },
          { ...SESSION, id: 'd', endReason: 'whatever' },
          { ...SESSION, id: 'e', startedAt: 'ayer' },
        ],
      }),
    );

    expect(readSessions()).toEqual([SESSION]);
  });

  it('un envoltorio de otra versión se ignora', () => {
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify({ version: 1, sessions: [SESSION] }));

    expect(readSessions()).toEqual([]);
  });

  it('metas inválidas se descartan entrada por entrada', () => {
    localStorage.setItem(
      STUDY_GOALS_KEY,
      JSON.stringify({
        version: 1,
        weekly: [{ from: '2026-11-10', hours: 10 }, { from: 'x', hours: 3 }, { hours: 2 }],
        bySubject: { s1: { subjectName: 'Física', entries: [{ from: '2026-11-10', hours: -1 }] } },
      }),
    );

    expect(readGoals()).toEqual({
      weekly: [{ from: '2026-11-10', hours: 10 }],
      bySubject: { s1: { subjectName: 'Física', entries: [] } },
    });
  });

  it('con storage bloqueado no lanza errores', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => writeSessions([SESSION])).not.toThrow();
    expect(() => writeTimer(FOCUS)).not.toThrow();
    expect(readSessions()).toEqual([]);
    expect(readTimer()).toBeNull();
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
