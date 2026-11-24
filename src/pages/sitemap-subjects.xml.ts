import type { APIRoute } from 'astro';
import { subjectsSitemapResponse } from '@/features/subjects-index/services/subjectsSitemapResponse';

// SSR: el catálogo cambia sin redeploy, así que se arma en cada request (con
// cache del CDN) en vez de congelarlo en el build.
export const prerender = false;

export const GET: APIRoute = () => subjectsSitemapResponse(import.meta.env.SITE);
