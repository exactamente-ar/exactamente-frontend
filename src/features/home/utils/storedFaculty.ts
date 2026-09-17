export const STORED_FACULTY_KEY = 'exactamente:selectedFaculty:v1';

export type StoredFaculty = {
  universityId: string;
  facultyId: string;
};

/**
 * Facultad que el usuario eligió la última vez, para que al volver caiga ahí y
 * no siempre en la facultad por defecto. Mismo criterio que el cache de
 * `useResolvedDefaultScope`: es una conveniencia, si `localStorage` falla se
 * sigue sin ella.
 */
export function readStoredFaculty(): StoredFaculty | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORED_FACULTY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredFaculty>;
    if (!parsed.universityId || !parsed.facultyId) return null;
    return { universityId: parsed.universityId, facultyId: parsed.facultyId };
  } catch {
    return null;
  }
}

export function writeStoredFaculty(scope: StoredFaculty): void {
  if (typeof window === 'undefined') return;
  if (!scope.universityId || !scope.facultyId) return;
  try {
    window.localStorage.setItem(STORED_FACULTY_KEY, JSON.stringify(scope));
  } catch {
    // Cuota llena o modo privado: se sigue sin persistir la elección.
  }
}
