import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, type StudySettings } from './settings';
import {
  OVERTIME_CAP_MS,
  canStart,
  createIdle,
  elapsedMs,
  endFocus,
  isRunning,
  overtimeMs,
  pause,
  remainingMs,
  resume,
  setSubject,
  skipBreak,
  start,
  startBreak,
  tick,
  type StudySubject,
  type TimerState,
} from './timer';

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 24, 13, 0);
const SUBJECT: StudySubject = {
  careerId: 'c1',
  careerName: 'Ing. en Sistemas',
  subjectId: 's1',
  subjectName: 'Cálculo II',
};
const settings: StudySettings = DEFAULT_SETTINGS;
const newId = () => 'focus-1';

function focusAt(now = T0, s: StudySettings = settings) {
  return start(createIdle(SUBJECT), s, now, newId);
}

type Focus = Extract<TimerState, { phase: 'focus' }>;
function asFocus(state: TimerState): Focus {
  if (state.phase !== 'focus') throw new Error(`expected focus, got ${state.phase}`);
  return state;
}

describe('start', () => {
  it('desde reposo con materia arranca un foco con id nuevo y la duración configurada', () => {
    const state = asFocus(focusAt());

    expect(state).toEqual({
      phase: 'focus',
      focusId: 'focus-1',
      subject: SUBJECT,
      startedAt: T0,
      targetMs: 50 * MIN,
      runningSince: T0,
      accumulatedMs: 0,
      targetNotified: false,
    });
    expect(isRunning(state)).toBe(true);
  });

  it('sin materia no cambia el estado', () => {
    const idle = createIdle();

    expect(canStart(idle)).toBe(false);
    expect(start(idle, settings, T0, newId)).toBe(idle);
  });

  it('con un foco en curso no hace nada', () => {
    const state = focusAt();

    expect(start(state, settings, T0 + MIN, newId)).toBe(state);
  });
});

describe('elapsed, pausas y reanudación', () => {
  it('10 min corriendo, 5 pausado y 3 más corriendo suman 13 min', () => {
    let state = focusAt();
    state = pause(state, T0 + 10 * MIN);
    expect(isRunning(state)).toBe(false);
    expect(elapsedMs(state, T0 + 15 * MIN)).toBe(10 * MIN);

    state = resume(state, T0 + 15 * MIN);

    expect(elapsedMs(state, T0 + 18 * MIN)).toBe(13 * MIN);
    expect(remainingMs(state, T0 + 18 * MIN)).toBe(37 * MIN);
  });

  it('pausar un foco pausado o reanudar uno corriendo no cambia nada', () => {
    const running = focusAt();
    const paused = pause(running, T0 + MIN);

    expect(resume(running, T0 + MIN)).toBe(running);
    expect(pause(paused, T0 + 2 * MIN)).toBe(paused);
  });
});

describe('tick en foco', () => {
  it('antes de la duración no cambia nada', () => {
    const state = focusAt();
    const result = tick(state, settings, T0 + 10 * MIN);

    expect(result.state).toBe(state);
    expect(result.registered).toBeNull();
    expect(result.alert).toBeNull();
  });

  it('pasada la duración sin arranque automático entra en tiempo extra y avisa una vez', () => {
    const result = tick(focusAt(), settings, T0 + 58 * MIN);
    const state = asFocus(result.state);

    expect(state.targetNotified).toBe(true);
    expect(overtimeMs(state, T0 + 58 * MIN)).toBe(8 * MIN);
    expect(remainingMs(state, T0 + 58 * MIN)).toBe(0);
    expect(result.registered).toBeNull();
    expect(result.alert).toBe('focus-ended');

    const again = tick(state, settings, T0 + 59 * MIN);
    expect(again.alert).toBeNull();
    expect(again.state).toBe(state);
  });

  it('al llegar al tope de tiempo extra registra duración + 60 min y pasa a reposo', () => {
    const result = tick(focusAt(), settings, T0 + 50 * MIN + OVERTIME_CAP_MS);

    expect(result.state).toEqual({ phase: 'idle', subject: SUBJECT });
    expect(result.registered).toMatchObject({
      id: 'focus-1',
      minutes: 110,
      recordedMinutes: 110,
      endReason: 'cap',
      startedAt: new Date(T0).toISOString(),
      endedAt: new Date(T0 + 110 * MIN).toISOString(),
      ...SUBJECT,
    });
  });

  it('al hidratar horas después registra solo hasta el tope', () => {
    const result = tick(focusAt(), settings, T0 + 5 * 60 * MIN);

    expect(result.state.phase).toBe('idle');
    expect(result.registered?.minutes).toBe(110);
    expect(result.registered?.endedAt).toBe(new Date(T0 + 110 * MIN).toISOString());
  });

  it('con arranque automático registra exactamente la duración y arranca el descanso', () => {
    const auto = { ...settings, autoStartBreak: true };
    const result = tick(focusAt(T0, auto), auto, T0 + 50 * MIN + 500);

    expect(result.registered).toMatchObject({ minutes: 50, endReason: 'auto-break' });
    expect(result.alert).toBe('focus-ended');
    expect(result.state).toEqual({
      phase: 'break',
      subject: SUBJECT,
      startedAt: T0 + 50 * MIN,
      targetMs: 10 * MIN,
    });
  });

  it('con arranque automático y la pestaña cerrada mucho tiempo, el descanso ya venció', () => {
    const auto = { ...settings, autoStartBreak: true };
    const result = tick(focusAt(T0, auto), auto, T0 + 3 * 60 * MIN);

    expect(result.registered?.minutes).toBe(50);
    expect(result.state).toEqual({ phase: 'idle', subject: SUBJECT });
  });

  it('un foco pausado hace 3 días sigue pausado y no registra', () => {
    const paused = pause(focusAt(), T0 + 20 * MIN);
    const result = tick(paused, settings, T0 + 3 * 24 * 60 * MIN);

    expect(result.state).toBe(paused);
    expect(result.registered).toBeNull();
  });
});

describe('endFocus y startBreak', () => {
  it('endFocus en tiempo extra registra lo corrido y vuelve a reposo con la materia', () => {
    const state = tick(focusAt(), settings, T0 + 58 * MIN).state;
    const result = endFocus(state, T0 + 58 * MIN + 10_000);

    expect(result.state).toEqual({ phase: 'idle', subject: SUBJECT });
    expect(result.registered).toMatchObject({
      minutes: 58,
      recordedMinutes: 58,
      endReason: 'manual',
    });
    expect(result.skipped).toBeNull();
  });

  it('startBreak en tiempo extra registra lo corrido y arranca el descanso', () => {
    const state = tick(focusAt(), settings, T0 + 58 * MIN).state;
    const result = startBreak(state, settings, T0 + 58 * MIN);

    expect(result.registered).toMatchObject({ minutes: 58, endReason: 'break' });
    expect(result.state).toEqual({
      phase: 'break',
      subject: SUBJECT,
      startedAt: T0 + 58 * MIN,
      targetMs: 10 * MIN,
    });
  });

  it('terminar antes registra solo lo corrido, sin pausas', () => {
    let state = focusAt();
    state = pause(state, T0 + 10 * MIN);
    state = resume(state, T0 + 30 * MIN);
    const result = endFocus(state, T0 + 35 * MIN);

    expect(result.registered?.minutes).toBe(15);
  });

  it('terminar un foco pausado registra lo acumulado', () => {
    const paused = pause(focusAt(), T0 + 12 * MIN);

    expect(endFocus(paused, T0 + 60 * MIN).registered?.minutes).toBe(12);
  });

  it('un foco de menos de 1 min no se registra e informa too-short', () => {
    const result = endFocus(focusAt(), T0 + 29_000);

    expect(result.registered).toBeNull();
    expect(result.skipped).toBe('too-short');
    expect(result.state).toEqual({ phase: 'idle', subject: SUBJECT });
  });

  it('desde reposo no hacen nada', () => {
    const idle = createIdle(SUBJECT);

    expect(endFocus(idle, T0).state).toBe(idle);
    expect(startBreak(idle, settings, T0).state).toBe(idle);
  });
});

describe('descanso', () => {
  const inBreak = () => startBreak(focusAt(), settings, T0 + 50 * MIN).state;

  it('cuenta hacia atrás desde su duración', () => {
    expect(remainingMs(inBreak(), T0 + 53 * MIN)).toBe(7 * MIN);
    expect(isRunning(inBreak())).toBe(true);
  });

  it('skipBreak vuelve a reposo con la materia', () => {
    expect(skipBreak(inBreak())).toEqual({ phase: 'idle', subject: SUBJECT });
  });

  it('cuando vence, tick vuelve a reposo y avisa', () => {
    const result = tick(inBreak(), settings, T0 + 60 * MIN);

    expect(result.state).toEqual({ phase: 'idle', subject: SUBJECT });
    expect(result.alert).toBe('break-ended');
    expect(result.registered).toBeNull();
  });
});

describe('setSubject', () => {
  it('cambia la materia en reposo', () => {
    expect(setSubject(createIdle(), SUBJECT)).toEqual({ phase: 'idle', subject: SUBJECT });
  });

  it('no cambia la materia de un foco en curso', () => {
    const state = focusAt();
    const other = { ...SUBJECT, subjectId: 's2', subjectName: 'Física' };

    expect(setSubject(state, other)).toBe(state);
  });
});

describe('hallazgos de revisión', () => {
  it('activar el arranque automático ya en tiempo extra no corta el foco ni repite el aviso', () => {
    const overtime = tick(focusAt(), settings, T0 + 58 * MIN).state;
    const auto = { ...settings, autoStartBreak: true };
    const result = tick(overtime, auto, T0 + 59 * MIN);

    expect(result.state).toBe(overtime);
    expect(result.registered).toBeNull();
    expect(result.alert).toBeNull();
  });

  it('pausar después del tope no acumula más que duración + tope', () => {
    const paused = asFocus(pause(focusAt(), T0 + 5 * 60 * MIN));

    expect(paused.accumulatedMs).toBe(50 * MIN + OVERTIME_CAP_MS);
  });

  it('terminar después del tope registra como máximo duración + tope', () => {
    const result = endFocus(focusAt(), T0 + 5 * 60 * MIN);

    expect(result.registered?.minutes).toBe(110);
  });

  it('los minutos se truncan: 30 s no se registran y 1 min 50 s cuenta 1', () => {
    expect(endFocus(focusAt(), T0 + 30_000).skipped).toBe('too-short');
    expect(endFocus(focusAt(), T0 + 110_000).registered?.minutes).toBe(1);
  });
});
