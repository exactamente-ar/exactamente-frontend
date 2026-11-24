/**
 * Origen canónico del sitio en producción. El apex redirige a `www`, así que
 * las URLs canónicas, de Open Graph y de datos estructurados usan este host.
 *
 * No se toma de `site` en `astro.config.mjs` a propósito: ahí está el apex.
 */
export const SITE_ORIGIN = 'https://www.exactamente.com.ar';

export const SITE_NAME = 'Exactamente';

/** Convierte un path del sitio en URL absoluta sobre el origen canónico. */
export function toAbsoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).href;
}
