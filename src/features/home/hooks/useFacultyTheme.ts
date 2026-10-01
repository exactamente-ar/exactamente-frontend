import { useEffect } from 'react';
import { applyFacultyTheme } from '@/core/theme/applyFacultyTheme';
import type { Faculty } from '@/shared/services/api';
import { readStoredFaculty, writeStoredFaculty } from '@/features/home/utils/storedFaculty';

/**
 * Pinta el tema de la facultad activa (la elegida, la de la URL o la de arranque).
 * Si había una elección guardada de antes del slug, la completa para que el script
 * de `Layout.astro` pueda pintar el tema sin esperar a la API.
 */
export function useFacultyTheme(facultyId: string, faculties: Pick<Faculty, 'id' | 'slug'>[]) {
  useEffect(() => {
    const faculty = faculties.find((f) => f.id === facultyId);
    if (!faculty) return;
    applyFacultyTheme(faculty.slug);

    const stored = readStoredFaculty();
    if (stored && stored.facultyId === faculty.id && stored.slug !== faculty.slug) {
      writeStoredFaculty({ ...stored, slug: faculty.slug });
    }
  }, [facultyId, faculties]);
}
