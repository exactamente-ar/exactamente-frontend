/**
 * Manda un evento a Google Analytics si gtag está disponible.
 *
 * Nunca tira: si gtag no cargó (bloqueador, SSR) o falla, el evento se pierde
 * en silencio. La analítica no puede romper la interacción que la dispara.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  } catch {
    // Ignorado a propósito: ver comentario de la función.
  }
}
