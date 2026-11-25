import type { StudySubject } from '@/features/study/domain/timer';
import type { LastCareer } from '@/features/study/utils/studyStorage';

/**
 * The subject a page is about, emitted by `Layout.astro` as JSON so every
 * island reads the same thing without prop drilling (AD-10).
 */
export type PageStudyContext = {
  subjectId: string;
  subjectName: string;
  careers: LastCareer[];
};

export const STUDY_CONTEXT_ID = 'study-context';

export function toStudyContext(subject: {
  id: string;
  title: string;
  careers: { careerId: string; careerName: string }[];
}): PageStudyContext {
  const careers = new Map<string, LastCareer>();
  for (const { careerId, careerName } of subject.careers) {
    if (!careers.has(careerId)) careers.set(careerId, { careerId, careerName });
  }
  return { subjectId: subject.id, subjectName: subject.title, careers: [...careers.values()] };
}

/** JSON safe to inline in a <script>: `<` is escaped so it can never close the tag. */
export function serializeStudyContext(context: PageStudyContext): string {
  return JSON.stringify(context).replace(/</g, '\\u003c');
}

const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

function parseContext(raw: unknown): PageStudyContext | null {
  if (!raw || typeof raw !== 'object') return null;
  const { subjectId, subjectName, careers } = raw as Record<string, unknown>;
  if (!isText(subjectId) || !isText(subjectName) || !Array.isArray(careers)) return null;
  const valid = careers.filter(
    (c): c is LastCareer =>
      !!c && typeof c === 'object' && isText(c.careerId) && isText(c.careerName),
  );
  return { subjectId, subjectName, careers: valid };
}

let cached: { value: PageStudyContext | null } | null = null;

/** Reads and memoizes the page context. Pages without a subject have none. */
export function readPageContext(): PageStudyContext | null {
  if (cached) return cached.value;
  if (typeof document === 'undefined') return null;
  let value: PageStudyContext | null = null;
  const element = document.getElementById(STUDY_CONTEXT_ID);
  if (element?.textContent) {
    try {
      value = parseContext(JSON.parse(element.textContent));
    } catch {
      value = null;
    }
  }
  cached = { value };
  return value;
}

/** For tests: the memo lives as long as the page does. */
export function resetPageContextCache(): void {
  cached = null;
}

/** Career: the last one chosen if the subject belongs to it, else the subject's first (FR-3). */
export function resolveContextSubject(
  context: PageStudyContext,
  lastCareer: LastCareer | null,
): StudySubject | null {
  const career =
    context.careers.find((c) => c.careerId === lastCareer?.careerId) ?? context.careers[0];
  if (!career) return null;
  return {
    careerId: career.careerId,
    careerName: career.careerName,
    subjectId: context.subjectId,
    subjectName: context.subjectName,
  };
}
