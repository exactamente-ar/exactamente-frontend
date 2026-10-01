import { resolveSlug } from './facultyPalettes';

/** Aplica la paleta de la facultad seteando `data-faculty` en `<html>`; global.css hace el resto. */
export function applyFacultyTheme(slug?: string | null): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.faculty = resolveSlug(slug);
}
