import { describe, expect, it } from 'vitest';
import type { StudySession } from '@/features/study/domain/sessions';
import { EMPTY_GOALS, setSubjectGoal } from '@/features/study/domain/goals';
import { heatmap, streak, subjectRows, weekDays, weekMinutes } from './metrics';

function at(
  date: Date,
  minutes: number,
  id = date.toISOString(),
  subject: { subjectId: string; subjectName: string } = {
    subjectId: 's1',
    subjectName: 'Cálculo II',
  },
): StudySession {
  return {
    id,
    startedAt: date.toISOString(),
    endedAt: date.toISOString(),
    minutes,
    recordedMinutes: minutes,
    endReason: 'manual',
    careerId: 'c1',
    careerName: 'Ing. en Sistemas',
    ...subject,
    updatedAt: date.toISOString(),
  };
}

// Wednesday 25/11/2026; the week starts on Monday 23/11.
const NOW = new Date(2026, 10, 25, 12, 0);

describe('weekMinutes', () => {
  it('suma la semana actual (offset 0) y la anterior (offset -1)', () => {
    const sessions = [
      at(new Date(2026, 10, 23, 0, 0), 30),
      at(new Date(2026, 10, 25, 9, 0), 45),
      at(new Date(2026, 10, 22, 23, 59), 50),
      at(new Date(2026, 10, 16, 8, 0), 10),
      at(new Date(2026, 10, 15, 8, 0), 99),
    ];

    expect(weekMinutes(sessions, NOW, 0)).toBe(75);
    expect(weekMinutes(sessions, NOW, -1)).toBe(60);
  });
});

describe('semana del domingo a la noche', () => {
  it('una sesión que empezó el domingo 23:40 y terminó el lunes cuenta para el domingo', () => {
    const sunday = at(new Date(2026, 10, 22, 23, 40), 50);
    const monday = new Date(2026, 10, 23, 10);

    expect(weekMinutes([sunday], monday, 0)).toBe(0);
    expect(weekMinutes([sunday], monday, -1)).toBe(50);
    expect(weekDays([sunday], new Date(2026, 10, 22, 12)).at(-1)).toMatchObject({
      label: 'Dom',
      minutes: 50,
    });
  });
});

describe('weekDays', () => {
  it('devuelve lunes a domingo con sus minutos', () => {
    const days = weekDays([at(new Date(2026, 10, 25, 9), 40)], NOW);

    expect(days.map((d) => d.label)).toEqual(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']);
    expect(days[2].minutes).toBe(40);
  });
});

describe('subjectRows', () => {
  const FISICA = { subjectId: 'f', subjectName: 'Física' };
  const QUIMICA = { subjectId: 'q', subjectName: 'Química' };

  it('lista las materias de la semana con su meta, incluidas las que tienen meta y 0 h', () => {
    let goals = setSubjectGoal(EMPTY_GOALS, FISICA, '2026-11-23', 10);
    goals = setSubjectGoal(goals, QUIMICA, '2026-11-23', 3);
    const sessions = [
      at(new Date(2026, 10, 24, 9), 300, 'a', FISICA),
      at(new Date(2026, 10, 24, 15), 60, 'b'),
      at(new Date(2026, 10, 10, 9), 999, 'c', QUIMICA),
    ];

    expect(subjectRows(sessions, goals, NOW)).toEqual([
      { subjectId: 'f', subjectName: 'Física', minutes: 300, goal: 10 },
      { subjectId: 's1', subjectName: 'Cálculo II', minutes: 60, goal: null },
      { subjectId: 'q', subjectName: 'Química', minutes: 0, goal: 3 },
    ]);
  });

  it('una materia con la meta quitada y sin horas no aparece', () => {
    let goals = setSubjectGoal(EMPTY_GOALS, QUIMICA, '2026-11-16', 3);
    goals = setSubjectGoal(goals, QUIMICA, '2026-11-23', null);

    expect(subjectRows([], goals, NOW)).toEqual([]);
  });
});

describe('streak', () => {
  it('sesiones ayer y anteayer, ninguna hoy: racha de 2 que sigue viva', () => {
    const sessions = [at(new Date(2026, 10, 24, 22), 30), at(new Date(2026, 10, 23, 8), 30)];

    expect(streak(sessions, NOW)).toEqual({ current: 2, studiedToday: false });
  });

  it('con sesión hoy la cuenta y se corta en un día sin estudio', () => {
    const sessions = [
      at(new Date(2026, 10, 25, 8), 30),
      at(new Date(2026, 10, 24, 8), 30),
      at(new Date(2026, 10, 22, 8), 30),
    ];

    expect(streak(sessions, NOW)).toEqual({ current: 2, studiedToday: true });
  });

  it('sin estudio ayer ni hoy no hay racha', () => {
    expect(streak([at(new Date(2026, 10, 20, 8), 30)], NOW)).toEqual({
      current: 0,
      studiedToday: false,
    });
  });
});

describe('heatmap', () => {
  it('26 semanas completas por día, con 5 niveles, terminando en la semana actual', () => {
    const cells = heatmap(
      [
        at(new Date(2026, 10, 25, 8), 20),
        at(new Date(2026, 10, 24, 8), 45),
        at(new Date(2026, 10, 23, 8), 90),
        at(new Date(2026, 10, 22, 8), 200),
      ],
      NOW,
    );

    expect(cells).toHaveLength(26 * 7);
    expect(cells[0].dayKey).toBe('2026-06-01');
    expect(cells.at(-1)).toMatchObject({ dayKey: '2026-11-29', future: true, level: 0 });
    const byDay = Object.fromEntries(cells.map((c) => [c.dayKey, c.level]));
    expect(byDay['2026-11-25']).toBe(1);
    expect(byDay['2026-11-24']).toBe(2);
    expect(byDay['2026-11-23']).toBe(3);
    expect(byDay['2026-11-22']).toBe(4);
    expect(byDay['2026-11-21']).toBe(0);
  });
});
