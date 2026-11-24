// Cache del CDN de Vercel para el índice y el sitemap de materias: una hora
// fresco y hasta un día sirviendo la versión vieja mientras se revalida.
export const SUBJECTS_INDEX_CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';
