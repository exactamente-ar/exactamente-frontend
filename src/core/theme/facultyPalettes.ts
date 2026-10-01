export type FacultyPalette = {
  /** Color de acento / texto destacado. Debe cumplir WCAG AA sobre el fondo oscuro. */
  accent: string;
  /** 5 stops del gradiente animado (el último repite al primero para que cierre el ciclo). */
  stops: readonly [string, string, string, string, string];
  /** Versión oscura de los stops, para fondos (`.gradient-bg-dark`). */
  darkStops: readonly [string, string, string, string, string];
};

export const DEFAULT_FACULTY_SLUG = 'exactas';

export const FACULTY_PALETTES = {
  // Amarillo
  exactas: {
    accent: '#facc15',
    stops: ['#facc15', '#fde047', '#f6e05e', '#fbbf24', '#facc15'],
    darkStops: ['#5a4a00', '#6b5600', '#4a3d00', '#5c4300', '#5a4a00'],
  },
  // Violeta
  veterinarias: {
    accent: '#a78bfa',
    stops: ['#a78bfa', '#c4b5fd', '#c084fc', '#d8b4fe', '#a78bfa'],
    darkStops: ['#2d1b69', '#3b2a7a', '#4c1d95', '#33256b', '#2d1b69'],
  },
  // Naranja
  humanas: {
    accent: '#fb923c',
    stops: ['#fb923c', '#fdba74', '#f97316', '#fed7aa', '#fb923c'],
    darkStops: ['#6b2f0a', '#7c3a10', '#5a2a08', '#6e3410', '#6b2f0a'],
  },
  // Celeste
  economicas: {
    accent: '#38bdf8',
    stops: ['#38bdf8', '#7dd3fc', '#0ea5e9', '#bae6fd', '#38bdf8'],
    darkStops: ['#0c4a6e', '#075985', '#0b3f5c', '#0a4f74', '#0c4a6e'],
  },
} as const satisfies Record<string, FacultyPalette>;

export type FacultySlug = keyof typeof FACULTY_PALETTES;

export const FACULTY_SLUGS = Object.keys(FACULTY_PALETTES) as FacultySlug[];

export function isFacultySlug(slug: unknown): slug is FacultySlug {
  return typeof slug === 'string' && Object.hasOwn(FACULTY_PALETTES, slug);
}

/** Slug conocido → su slug; cualquier otra cosa → la facultad por defecto. */
export function resolveSlug(slug?: string | null): FacultySlug {
  return isFacultySlug(slug) ? slug : DEFAULT_FACULTY_SLUG;
}

export function resolvePalette(slug?: string | null): FacultyPalette {
  return FACULTY_PALETTES[resolveSlug(slug)];
}

/** Variables CSS que `global.css` declara por facultad (y la tabla de abajo tiene que seguir en sincronía). */
export function paletteToCssVars(palette: FacultyPalette): Record<string, string> {
  const vars: Record<string, string> = { '--theme-accent': palette.accent };
  palette.stops.forEach((c, i) => (vars[`--theme-${i + 1}`] = c));
  palette.darkStops.forEach((c, i) => (vars[`--theme-dark-${i + 1}`] = c));
  return vars;
}
