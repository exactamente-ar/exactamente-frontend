import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudySession } from '@/features/study/domain/sessions';
import { DEFAULT_SETTINGS } from '@/features/study/domain/settings';
import type { StudySubject, TimerState } from '@/features/study/domain/timer';
import {
  STUDY_GOALS_KEY,
  STUDY_SESSIONS_KEY,
  STUDY_TIMER_KEY,
  readGoals,
  readLastCareer,
  readSessions,
  readTimer,
  writeSessions,
  writeSettings,
  writeTimer,
} from '@/features/study/utils/studyStorage';
import { createStudyStore } from './studyStore';

const MIN = 60_000;
const SUBJECT: StudySubject = {
  careerId: 'c1',
  careerName: 'Ing. en Sistemas',
  subjectId: 's1',
  subjectName: 'Cálculo II',
};

let clock = 0;
let ids = 0;
const deps = () => ({ now: () => clock, newId: () => `focus-${++ids}` });

beforeEach(() => {
  localStorage.clear();
  ids = 0;
  clock = new Date(2026, 10, 24, 10, 0).getTime();
});

function storageEvent(key: string) {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue: localStorage.getItem(key) }));
}

function runningStore() {
  const store = createStudyStore(deps());
  store.setSubject(SUBJECT);
  store.start();
  return store;
}

function sessionOf(overrides: Partial<StudySession> = {}): StudySession {
  return {
    id: 'a',
    startedAt: new Date(clock - 60 * MIN).toISOString(),
    endedAt: new Date(clock - 2 * MIN).toISOString(),
    minutes: 58,
    recordedMinutes: 58,
    endReason: 'break',
    ...SUBJECT,
    updatedAt: new Date(clock).toISOString(),
    ...overrides,
  };
}

describe('studyStore — acciones', () => {
  it('arranca un foco con la materia y lo persiste', () => {
    const store = runningStore();
    const { timer } = store.getSnapshot();

    expect(timer.phase).toBe('focus');
    expect(readTimer()).toEqual(timer);
  });

  it('elegir materia guarda la carrera como última elegida', () => {
    const store = createStudyStore(deps());
    store.setSubject(SUBJECT);

    expect(readLastCareer()).toEqual({ careerId: 'c1', careerName: 'Ing. en Sistemas' });
    expect(store.getSnapshot().lastCareer).toEqual({
      careerId: 'c1',
      careerName: 'Ing. en Sistemas',
    });
  });

  it('pausa, reanuda y termina, registrando lo corrido', () => {
    const store = runningStore();
    clock += 10 * MIN;
    store.pause();
    clock += 5 * MIN;
    store.resume();
    clock += 3 * MIN;
    store.endFocus();

    expect(store.getSnapshot().timer).toEqual({ phase: 'idle', subject: SUBJECT });
    expect(readSessions()).toHaveLength(1);
    expect(readSessions()[0]).toMatchObject({ minutes: 13, endReason: 'manual' });
  });

  it('un foco demasiado corto no registra y deja aviso too-short', () => {
    const store = runningStore();
    clock += 10_000;
    store.endFocus();

    expect(readSessions()).toEqual([]);
    expect(store.getSnapshot().completion).toEqual({ kind: 'too-short' });
  });

  it('startBreak registra, emite el evento y deja la confirmación con el total del día', () => {
    writeSessions([sessionOf({ id: 'old', minutes: 42, recordedMinutes: 42 })]);
    const store = runningStore();
    const onEvent = vi.fn();
    store.onEvent(onEvent);

    clock += 58 * MIN;
    store.tick();
    store.startBreak();

    expect(store.getSnapshot().timer.phase).toBe('break');
    expect(readSessions()).toHaveLength(2);
    const completion = store.getSnapshot().completion;
    expect(completion).toMatchObject({ kind: 'recorded', todayMinutes: 100 });
    expect(completion?.kind === 'recorded' && completion.session.minutes).toBe(58);
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'session-recorded' }));
    expect(onEvent).toHaveBeenCalledWith({ type: 'break-started' });
  });

  it('skipBreak vuelve a reposo con la misma materia', () => {
    const store = runningStore();
    clock += 20 * MIN;
    store.startBreak();
    store.skipBreak();

    expect(store.getSnapshot().timer).toEqual({ phase: 'idle', subject: SUBJECT });
  });

  it('un preset cambia la duración del próximo foco, no la del que corre', () => {
    const store = createStudyStore(deps());
    store.setFocusMinutes(25);
    store.setSubject(SUBJECT);
    store.start();
    store.setFocusMinutes(60);

    const { timer, settings } = store.getSnapshot();
    expect(settings.focusMin).toBe(60);
    expect(timer.phase === 'focus' && timer.targetMs).toBe(25 * MIN);
  });

  it('tick emite focus-ended una sola vez al llegar a la duración', () => {
    const store = runningStore();
    const onEvent = vi.fn();
    store.onEvent(onEvent);

    clock += 50 * MIN;
    store.tick();
    clock += MIN;
    store.tick();

    expect(onEvent.mock.calls.filter(([e]) => e.type === 'focus-ended')).toHaveLength(1);
    expect(readTimer()).toMatchObject({ targetNotified: true });
  });

  it('editSession, deleteSession y metas actualizan snapshot, storage y suscriptores', () => {
    writeSessions([sessionOf()]);
    const store = createStudyStore(deps());
    const listener = vi.fn();
    store.subscribe(listener);

    expect(store.editSession('a', { minutes: 43 })).toBe(true);
    expect(store.getSnapshot().sessions[0].minutes).toBe(43);
    expect(readSessions()[0].minutes).toBe(43);
    expect(store.editSession('a', { minutes: 0 })).toBe(false);

    store.setWeeklyGoal(12);
    expect(store.getSnapshot().goals.weekly).toEqual([{ from: '2026-11-23', hours: 12 }]);
    expect(readGoals().weekly).toEqual([{ from: '2026-11-23', hours: 12 }]);

    store.setSubjectGoal({ subjectId: 's1', subjectName: 'Cálculo II' }, 5);
    expect(readGoals().bySubject.s1.entries).toEqual([{ from: '2026-11-23', hours: 5 }]);

    store.deleteSession('a');
    expect(store.getSnapshot().sessions).toEqual([]);
    expect(readSessions()).toEqual([]);

    expect(listener).toHaveBeenCalledTimes(4);
  });

  it('el snapshot es estable mientras no cambia nada', () => {
    const store = createStudyStore(deps());

    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it('el snapshot del servidor no toca storage', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const store = createStudyStore(deps());
    store.getServerSnapshot();

    expect(getItem).not.toHaveBeenCalled();
    getItem.mockRestore();
  });

  it('con storage bloqueado el timer funciona en la pestaña', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const store = runningStore();
    clock += 20 * MIN;
    store.endFocus();

    expect(store.getSnapshot().sessions).toHaveLength(1);
    setItem.mockRestore();
  });
});

describe('studyStore — hidratación (pestaña cerrada)', () => {
  it('un foco corriendo desde hace 2 h con 50 min registra el tope (110 min) y queda en reposo', () => {
    const focus: TimerState = {
      phase: 'focus',
      focusId: 'f-old',
      subject: SUBJECT,
      startedAt: clock - 120 * MIN,
      targetMs: 50 * MIN,
      runningSince: clock - 120 * MIN,
      accumulatedMs: 0,
      targetNotified: false,
    };
    writeTimer(focus);
    const store = createStudyStore(deps());

    expect(store.getSnapshot().timer).toEqual({ phase: 'idle', subject: SUBJECT });
    expect(readSessions()).toEqual([
      expect.objectContaining({ id: 'f-old', minutes: 110, endReason: 'cap' }),
    ]);
    expect(store.getSnapshot().completion).toMatchObject({ kind: 'recorded' });
  });

  it('lee la configuración guardada', () => {
    writeSettings({ ...DEFAULT_SETTINGS, focusMin: 25 });

    expect(createStudyStore(deps()).getSnapshot().settings.focusMin).toBe(25);
  });
});

describe('studyStore — pestañas', () => {
  it('pausar en una pestaña pausa la otra con el mismo tiempo', () => {
    const tabA = runningStore();
    const tabB = createStudyStore(deps());
    tabB.getSnapshot();

    clock += 10 * MIN;
    tabA.pause();
    storageEvent(STUDY_TIMER_KEY);

    expect(tabB.getSnapshot().timer).toEqual(tabA.getSnapshot().timer);
    expect(tabB.getSnapshot().timer).toMatchObject({ runningSince: null, accumulatedMs: 10 * MIN });
  });

  it('dos pestañas que arrancan el descanso a la vez dejan una sola sesión y un solo evento', () => {
    const tabA = runningStore();
    const tabB = createStudyStore(deps());
    tabB.getSnapshot();
    const onA = vi.fn();
    const onB = vi.fn();
    tabA.onEvent(onA);
    tabB.onEvent(onB);

    clock += 58 * MIN;
    tabA.startBreak();
    tabB.startBreak();

    const recorded = (fn: typeof onA) =>
      fn.mock.calls.filter(([e]) => e.type === 'session-recorded').length;
    expect(readSessions()).toHaveLength(1);
    expect(recorded(onA) + recorded(onB)).toBe(1);
    expect(tabB.getSnapshot().timer.phase).toBe('break');
    expect(tabB.getSnapshot().completion).toBeNull();
  });

  it('dos pestañas con el mismo foco en el tope registran una sola vez', () => {
    const tabA = runningStore();
    const tabB = createStudyStore(deps());
    tabB.getSnapshot();

    clock += 111 * MIN;
    tabA.tick();
    tabB.tick();

    expect(readSessions()).toHaveLength(1);
    expect(tabB.getSnapshot().completion).toBeNull();
  });

  it('una edición de sesiones o metas en otra pestaña llega por el evento storage', () => {
    const tabB = createStudyStore(deps());
    tabB.getSnapshot();
    const tabA = createStudyStore(deps());
    writeSessions([sessionOf()]);
    storageEvent(STUDY_SESSIONS_KEY);
    expect(tabB.getSnapshot().sessions).toHaveLength(1);

    tabA.setWeeklyGoal(8);
    storageEvent(STUDY_GOALS_KEY);
    expect(tabB.getSnapshot().goals.weekly[0].hours).toBe(8);
  });
});

describe('studyStore — paneles y visor', () => {
  it('abrir el visor cierra el panel del header', () => {
    const store = createStudyStore(deps());
    store.togglePanel('header');
    expect(store.getSnapshot().openPanel).toBe('header');

    store.setViewerOpen(true);
    expect(store.getSnapshot()).toMatchObject({ viewerOpen: true, openPanel: null });

    store.togglePanel('viewer');
    store.setViewerOpen(false);
    expect(store.getSnapshot()).toMatchObject({ viewerOpen: false, openPanel: null });
  });
});
