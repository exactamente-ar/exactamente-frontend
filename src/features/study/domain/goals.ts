/**
 * A goal is a history of entries, each valid from a week (its Monday, local
 * `YYYY-MM-DD`) until the next one. Changing a goal writes an entry for the
 * current week, so past weeks keep the goal they had.
 */
export type GoalEntry = { from: string; hours: number | null };

export type SubjectGoals = { subjectName: string; entries: GoalEntry[] };

export type StudyGoals = {
  weekly: GoalEntry[];
  bySubject: Record<string, SubjectGoals>;
};

export const EMPTY_GOALS: StudyGoals = { weekly: [], bySubject: {} };

/** A week has 168 hours; anything beyond that is a typo. */
const MAX_GOAL_HOURS = 168;

/** Goals are edited in half hours. Zero, negative or missing means "no goal". */
export function normalizeGoalHours(hours: number | null): number | null {
  if (hours === null || !Number.isFinite(hours)) return null;
  const rounded = Math.round(hours * 2) / 2;
  if (rounded <= 0) return null;
  return Math.min(MAX_GOAL_HOURS, rounded);
}

/** ISO dates compare correctly as strings. */
export function goalFor(entries: GoalEntry[], weekStart: string): number | null {
  let match: GoalEntry | null = null;
  for (const entry of entries) {
    if (entry.from <= weekStart && (match === null || entry.from > match.from)) match = entry;
  }
  return match?.hours ?? null;
}

function withEntry(entries: GoalEntry[], weekStart: string, hours: number | null): GoalEntry[] {
  const next = entries.filter((e) => e.from !== weekStart);
  next.push({ from: weekStart, hours: normalizeGoalHours(hours) });
  return next.sort((a, b) => a.from.localeCompare(b.from));
}

export function weeklyGoalFor(goals: StudyGoals, weekStart: string): number | null {
  return goalFor(goals.weekly, weekStart);
}

export function setWeeklyGoal(
  goals: StudyGoals,
  weekStart: string,
  hours: number | null,
): StudyGoals {
  return { ...goals, weekly: withEntry(goals.weekly, weekStart, hours) };
}

export function subjectGoalFor(
  goals: StudyGoals,
  subjectId: string,
  weekStart: string,
): number | null {
  const subject = goals.bySubject[subjectId];
  return subject ? goalFor(subject.entries, weekStart) : null;
}

export function setSubjectGoal(
  goals: StudyGoals,
  subject: { subjectId: string; subjectName: string },
  weekStart: string,
  hours: number | null,
): StudyGoals {
  const current = goals.bySubject[subject.subjectId]?.entries ?? [];
  return {
    ...goals,
    bySubject: {
      ...goals.bySubject,
      [subject.subjectId]: {
        subjectName: subject.subjectName,
        entries: withEntry(current, weekStart, hours),
      },
    },
  };
}
