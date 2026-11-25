import { subjectGoalFor, type StudyGoals } from '@/features/study/domain/goals';
import {
  localDayKey,
  startOfWeek,
  weekKey,
  type StudySession,
} from '@/features/study/domain/sessions';

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function totalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((total, s) => total + s.minutes, 0);
}

/** Sessions count for the local day and week they started in. */
export function minutesBetween(sessions: StudySession[], from: Date, to: Date): number {
  return totalMinutes(
    sessions.filter((s) => {
      const t = new Date(s.startedAt);
      return t >= from && t < to;
    }),
  );
}

/** Minutes in the week `offset` weeks away from the current one (0 = this week). */
export function weekMinutes(sessions: StudySession[], now: Date, offset: number): number {
  const from = addDays(startOfWeek(now), offset * 7);
  return minutesBetween(sessions, from, addDays(from, 7));
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function weekDays(sessions: StudySession[], now: Date) {
  const monday = startOfWeek(now);
  return DAY_LABELS.map((label, i) => {
    const from = addDays(monday, i);
    return {
      label,
      dayKey: localDayKey(from),
      date: from,
      minutes: minutesBetween(sessions, from, addDays(from, 1)),
    };
  });
}

export type SubjectRow = {
  subjectId: string;
  subjectName: string;
  minutes: number;
  goal: number | null;
};

/**
 * Subjects studied this week plus subjects with a goal this week (even at 0 h),
 * by minutes. Goals do not have to add up to the weekly goal (FR-14, FR-16).
 */
export function subjectRows(sessions: StudySession[], goals: StudyGoals, now: Date): SubjectRow[] {
  const from = startOfWeek(now);
  const to = addDays(from, 7);
  const week = weekKey(now);
  const rows = new Map<string, SubjectRow>();

  for (const s of sessions) {
    const t = new Date(s.startedAt);
    if (t < from || t >= to) continue;
    const row = rows.get(s.subjectId);
    if (row) row.minutes += s.minutes;
    else
      rows.set(s.subjectId, {
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        minutes: s.minutes,
        goal: null,
      });
  }
  for (const [subjectId, { subjectName }] of Object.entries(goals.bySubject)) {
    const goal = subjectGoalFor(goals, subjectId, week);
    const row = rows.get(subjectId);
    if (row) row.goal = goal;
    else if (goal !== null) rows.set(subjectId, { subjectId, subjectName, minutes: 0, goal });
  }
  return [...rows.values()].sort((a, b) => b.minutes - a.minutes || (b.goal ?? 0) - (a.goal ?? 0));
}

function studiedDays(sessions: StudySession[]): Set<string> {
  return new Set(sessions.map((s) => localDayKey(new Date(s.startedAt))));
}

/**
 * Consecutive studied days, local time. Still alive if the last studied day
 * was yesterday: today is not over yet.
 */
export function streak(
  sessions: StudySession[],
  now: Date,
): { current: number; studiedToday: boolean } {
  const days = studiedDays(sessions);
  let cursor = startOfDay(now);
  const studiedToday = days.has(localDayKey(cursor));
  if (!studiedToday) cursor = addDays(cursor, -1);
  let current = 0;
  while (days.has(localDayKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, studiedToday };
}

export type HeatCell = {
  dayKey: string;
  date: Date;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
};

function heatLevel(minutes: number): HeatCell['level'] {
  if (minutes <= 0) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  if (minutes <= 120) return 3;
  return 4;
}

/** Full weeks, Monday to Sunday, column by column; the last column is the current week. */
export function heatmap(sessions: StudySession[], now: Date, weeks = 26): HeatCell[] {
  const perDay = new Map<string, number>();
  for (const s of sessions) {
    const key = localDayKey(new Date(s.startedAt));
    perDay.set(key, (perDay.get(key) ?? 0) + s.minutes);
  }
  const today = startOfDay(now);
  const first = addDays(startOfWeek(now), -(weeks - 1) * 7);
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = addDays(first, i);
    const dayKey = localDayKey(date);
    const minutes = perDay.get(dayKey) ?? 0;
    return { dayKey, date, minutes, level: heatLevel(minutes), future: date > today };
  });
}
