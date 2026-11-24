import type { Subject } from '@/features/home/types/subjects';
import type {
  IndexCareer,
  IndexFaculty,
  IndexUniversity,
  IndexYear,
} from '@/features/subjects-index/types/subjectsIndex';

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'es');

function findOrPush<T>(list: T[], match: (item: T) => boolean, create: () => T): T {
  const found = list.find(match);
  if (found) return found;
  const item = create();
  list.push(item);
  return item;
}

/**
 * Arma el árbol universidad → facultad → carrera → año del índice de materias.
 *
 * Una materia compartida entre carreras aparece bajo cada una, con el año y el
 * cuatrimestre que tiene en esa carrera. Si figura en varios planes de la misma
 * carrera, se lista una sola vez (el primer plan que llega).
 */
export function groupSubjects(subjects: Subject[]): IndexUniversity[] {
  const universities: IndexUniversity[] = [];

  for (const subject of subjects) {
    for (const entry of subject.careers) {
      const university = findOrPush(
        universities,
        (u) => u.name === entry.universityName,
        () => ({ name: entry.universityName, faculties: [] }),
      );
      const faculty = findOrPush<IndexFaculty>(
        university.faculties,
        (f) => f.name === entry.facultyName,
        () => ({ name: entry.facultyName, careers: [] }),
      );
      const career = findOrPush<IndexCareer>(
        faculty.careers,
        (c) => c.careerId === entry.careerId,
        () => ({ careerId: entry.careerId, name: entry.careerName, years: [] }),
      );
      const alreadyListed = career.years.some((y) => y.subjects.some((s) => s.id === subject.id));
      if (alreadyListed) continue;
      const year = findOrPush<IndexYear>(
        career.years,
        (y) => y.year === entry.year,
        () => ({ year: entry.year, subjects: [] }),
      );
      year.subjects.push({
        id: subject.id,
        title: subject.title,
        quadmester: entry.quadmester,
        resourceCounts: subject.resourceCounts,
      });
    }
  }

  universities.sort(byName);
  for (const university of universities) {
    university.faculties.sort(byName);
    for (const faculty of university.faculties) {
      faculty.careers.sort(byName);
      for (const career of faculty.careers) {
        career.years.sort((a, b) => a.year - b.year);
        for (const year of career.years) {
          year.subjects.sort(
            (a, b) => a.quadmester - b.quadmester || a.title.localeCompare(b.title, 'es'),
          );
        }
      }
    }
  }

  return universities;
}
