export type EndReason = 'manual' | 'break' | 'cap' | 'auto-break';

/**
 * One focus block, as it will later be sent to the backend. `id` is the focus
 * id, so it doubles as the idempotency key across tabs and for the migration.
 */
export type StudySession = {
  id: string;
  /** ISO 8601 UTC. Decides the local day and week the session counts for. */
  startedAt: string;
  /** ISO 8601 UTC, informative only. */
  endedAt: string;
  /** Whole minutes ≥ 1. Editable down to 1 and up to `recordedMinutes`. */
  minutes: number;
  /** What the timer recorded; the ceiling for edits. */
  recordedMinutes: number;
  endReason: EndReason;
  careerId: string;
  careerName: string;
  subjectId: string;
  subjectName: string;
  /** ISO 8601 UTC, for conflict resolution once sessions sync. */
  updatedAt: string;
};

export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Monday 00:00 local of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const offset = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
}

/** The week a date belongs to, as its Monday `YYYY-MM-DD` (local). */
export function weekKey(date: Date): string {
  return localDayKey(startOfWeek(date));
}

export function sessionDayKey(session: StudySession): string {
  return localDayKey(new Date(session.startedAt));
}

export function minutesOnDay(sessions: StudySession[], dayKey: string): number {
  return sessions.reduce(
    (total, s) => (sessionDayKey(s) === dayKey ? total + s.minutes : total),
    0,
  );
}

/** Idempotent by id: another tab that got there first leaves the list unchanged. */
export function appendSession(
  sessions: StudySession[],
  session: StudySession,
): { sessions: StudySession[]; added: boolean } {
  if (sessions.some((s) => s.id === session.id)) return { sessions, added: false };
  return { sessions: [...sessions, session], added: true };
}

export type SessionSubject = Pick<
  StudySession,
  'careerId' | 'careerName' | 'subjectId' | 'subjectName'
>;

export type SessionPatch = { minutes?: number; subject?: SessionSubject };

export function isValidMinutes(session: StudySession, minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= session.recordedMinutes;
}

/**
 * Edits can only lower the minutes (down to 1) or move the session to another
 * subject. The start never changes. Returns null when the edit is not allowed.
 */
export function editSession(
  sessions: StudySession[],
  id: string,
  patch: SessionPatch,
  now: Date,
): StudySession[] | null {
  const current = sessions.find((s) => s.id === id);
  if (!current) return null;
  if (patch.minutes !== undefined && !isValidMinutes(current, patch.minutes)) return null;

  const subject = patch.subject;
  const next: StudySession = {
    ...current,
    ...(patch.minutes !== undefined && { minutes: patch.minutes }),
    ...(subject && {
      careerId: subject.careerId,
      careerName: subject.careerName,
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
    }),
    updatedAt: now.toISOString(),
  };
  return sessions.map((s) => (s.id === id ? next : s));
}

export function deleteSession(sessions: StudySession[], id: string): StudySession[] {
  return sessions.filter((s) => s.id !== id);
}
