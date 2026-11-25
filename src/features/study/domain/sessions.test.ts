import { describe, expect, it } from 'vitest';
import {
  appendSession,
  deleteSession,
  editSession,
  localDayKey,
  minutesOnDay,
  sessionDayKey,
  startOfWeek,
  weekKey,
  type StudySession,
} from './sessions';

function session(overrides: Partial<StudySession> = {}): StudySession {
  return {
    id: 'a',
    startedAt: new Date(2026, 10, 12, 10, 0).toISOString(),
    endedAt: new Date(2026, 10, 12, 10, 58).toISOString(),
    minutes: 58,
    recordedMinutes: 58,
    endReason: 'break',
    careerId: 'c1',
    careerName: 'Ing. en Sistemas',
    subjectId: 's1',
    subjectName: 'Cálculo II',
    updatedAt: new Date(2026, 10, 12, 10, 58).toISOString(),
    ...overrides,
  };
}

const NOW = new Date(2026, 10, 13, 9, 0);

describe('día y semana locales', () => {
  it('localDayKey usa la fecha local', () => {
    expect(localDayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('la sesión cuenta para el día en que empezó, aunque termine al día siguiente', () => {
    const s = session({
      startedAt: new Date(2026, 10, 16, 23, 40).toISOString(),
      endedAt: new Date(2026, 10, 17, 0, 30).toISOString(),
    });

    expect(sessionDayKey(s)).toBe('2026-11-16');
  });

  it('la semana arranca el lunes a las 00:00 locales', () => {
    // 15/11/2026 is a Sunday; 9/11 and 16/11 are Mondays.
    expect(startOfWeek(new Date(2026, 10, 15, 23, 40))).toEqual(new Date(2026, 10, 9));
    expect(startOfWeek(new Date(2026, 10, 16, 0, 0))).toEqual(new Date(2026, 10, 16));
    expect(weekKey(new Date(2026, 10, 12))).toBe('2026-11-09');
  });

  it('minutesOnDay suma solo las sesiones de ese día', () => {
    const sessions = [
      session({ id: 'a', minutes: 20 }),
      session({ id: 'b', minutes: 30 }),
      session({ id: 'c', startedAt: new Date(2026, 10, 13, 8).toISOString(), minutes: 99 }),
    ];

    expect(minutesOnDay(sessions, '2026-11-12')).toBe(50);
  });
});

describe('appendSession', () => {
  it('agrega una sesión nueva', () => {
    const result = appendSession([], session());

    expect(result.added).toBe(true);
    expect(result.sessions).toHaveLength(1);
  });

  it('una sesión con un id ya guardado no cambia la lista', () => {
    const sessions = [session({ id: 'X' })];
    const result = appendSession(sessions, session({ id: 'X', minutes: 10 }));

    expect(result.added).toBe(false);
    expect(result.sessions).toBe(sessions);
  });

  it('no hay tope diario de minutos', () => {
    const long = Array.from({ length: 10 }, (_, i) =>
      session({ id: `s${i}`, minutes: 110, recordedMinutes: 110 }),
    );
    const sessions = long.reduce<StudySession[]>((acc, s) => appendSession(acc, s).sessions, []);

    expect(minutesOnDay(sessions, '2026-11-12')).toBe(1100);
  });
});

describe('editSession', () => {
  it('acepta minutos entre 1 y lo registrado, y rechaza 0 o más', () => {
    const sessions = [session()];

    expect(editSession(sessions, 'a', { minutes: 43 }, NOW)?.[0].minutes).toBe(43);
    expect(editSession(sessions, 'a', { minutes: 1 }, NOW)?.[0].minutes).toBe(1);
    expect(editSession(sessions, 'a', { minutes: 58 }, NOW)?.[0].minutes).toBe(58);
    expect(editSession(sessions, 'a', { minutes: 0 }, NOW)).toBeNull();
    expect(editSession(sessions, 'a', { minutes: 70 }, NOW)).toBeNull();
    expect(editSession(sessions, 'a', { minutes: 12.5 }, NOW)).toBeNull();
  });

  it('nunca cambia el inicio ni lo registrado', () => {
    const before = session();
    const [after] = editSession([before], 'a', { minutes: 43 }, NOW)!;

    expect(after.startedAt).toBe(before.startedAt);
    expect(after.recordedMinutes).toBe(58);
    expect(after.updatedAt).toBe(NOW.toISOString());
  });

  it('cambiar la materia guarda juntos ids y nombres de materia y carrera', () => {
    const [after] = editSession(
      [session()],
      'a',
      {
        subject: {
          careerId: 'c2',
          careerName: 'Lic. en Física',
          subjectId: 's9',
          subjectName: 'Física I',
        },
      },
      NOW,
    )!;

    expect(after).toMatchObject({
      careerId: 'c2',
      careerName: 'Lic. en Física',
      subjectId: 's9',
      subjectName: 'Física I',
      minutes: 58,
      updatedAt: NOW.toISOString(),
    });
  });

  it('un id inexistente devuelve null', () => {
    expect(editSession([session()], 'nope', { minutes: 10 }, NOW)).toBeNull();
  });
});

describe('deleteSession', () => {
  it('borra la sesión con ese id', () => {
    const sessions = [session({ id: 'a' }), session({ id: 'b' })];

    expect(deleteSession(sessions, 'a').map((s) => s.id)).toEqual(['b']);
  });
});
