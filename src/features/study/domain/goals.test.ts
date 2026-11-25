import { describe, expect, it } from 'vitest';
import {
  EMPTY_GOALS,
  goalFor,
  normalizeGoalHours,
  setSubjectGoal,
  setWeeklyGoal,
  subjectGoalFor,
  weeklyGoalFor,
} from './goals';

const SUBJECT = { subjectId: 's1', subjectName: 'Física I' };

describe('Meta Semanal con vigencia', () => {
  it('un cambio a mitad de semana aplica desde esa semana; las anteriores conservan la suya', () => {
    let goals = setWeeklyGoal(EMPTY_GOALS, '2026-11-03', 12);
    // Cambiada el miércoles 12/11: la semana en curso es la del lunes 10/11.
    goals = setWeeklyGoal(goals, '2026-11-10', 10);

    expect(weeklyGoalFor(goals, '2026-11-03')).toBe(12);
    expect(weeklyGoalFor(goals, '2026-11-10')).toBe(10);
    expect(weeklyGoalFor(goals, '2026-11-17')).toBe(10);
    expect(weeklyGoalFor(goals, '2026-12-29')).toBe(10);
  });

  it('antes de la primera meta no hay meta', () => {
    const goals = setWeeklyGoal(EMPTY_GOALS, '2026-11-10', 10);

    expect(weeklyGoalFor(goals, '2026-11-03')).toBeNull();
  });

  it('cambiarla dos veces en la misma semana reemplaza la entrada', () => {
    let goals = setWeeklyGoal(EMPTY_GOALS, '2026-11-10', 10);
    goals = setWeeklyGoal(goals, '2026-11-10', 8);

    expect(goals.weekly).toEqual([{ from: '2026-11-10', hours: 8 }]);
  });

  it('las entradas quedan ordenadas por semana aunque se escriban desordenadas', () => {
    const entries = [
      { from: '2026-11-17', hours: 5 },
      { from: '2026-11-03', hours: 9 },
    ];

    expect(goalFor(entries, '2026-11-10')).toBe(9);
    expect(goalFor(entries, '2026-11-24')).toBe(5);
  });
});

describe('Meta por Materia', () => {
  it('quitada en la semana en curso: la actual no tiene meta y la anterior conserva la suya', () => {
    let goals = setSubjectGoal(EMPTY_GOALS, SUBJECT, '2026-11-03', 10);
    goals = setSubjectGoal(goals, SUBJECT, '2026-11-10', null);

    expect(subjectGoalFor(goals, 's1', '2026-11-10')).toBeNull();
    expect(subjectGoalFor(goals, 's1', '2026-11-03')).toBe(10);
    expect(goals.bySubject.s1.subjectName).toBe('Física I');
  });

  it('una materia sin metas devuelve null', () => {
    expect(subjectGoalFor(EMPTY_GOALS, 'x', '2026-11-10')).toBeNull();
  });

  it('no depende de la Meta Semanal', () => {
    const goals = setSubjectGoal(
      setWeeklyGoal(EMPTY_GOALS, '2026-11-10', 2),
      SUBJECT,
      '2026-11-10',
      7,
    );

    expect(subjectGoalFor(goals, 's1', '2026-11-10')).toBe(7);
    expect(weeklyGoalFor(goals, '2026-11-10')).toBe(2);
  });
});

describe('normalizeGoalHours', () => {
  it('redondea a media hora y descarta valores no positivos', () => {
    expect(normalizeGoalHours(7.3)).toBe(7.5);
    expect(normalizeGoalHours(0)).toBeNull();
    expect(normalizeGoalHours(-2)).toBeNull();
    expect(normalizeGoalHours(Number.NaN)).toBeNull();
    expect(normalizeGoalHours(null)).toBeNull();
    expect(normalizeGoalHours(200)).toBe(168);
  });
});
