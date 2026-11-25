import { startOfWeek, type StudySession } from '@/features/study/domain/sessions';

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
