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
