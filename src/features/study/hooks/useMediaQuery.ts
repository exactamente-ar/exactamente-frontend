import { useSyncExternalStore } from 'react';

/**
 * Subscribes to a media query. Without `matchMedia` (server, old browsers,
 * jsdom) it reports `fallback`.
 */
export function useMediaQuery(query: string, fallback: boolean): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return () => {};
      }
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () =>
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(query).matches
        : fallback,
    () => fallback,
  );
}
