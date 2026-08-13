import type { CSSProperties } from 'react';

/** Margen izquierdo de la línea vertical del hilo de comentarios (Tailwind class). */
export const THREAD_LINE_ML = 'ml-[14px]';

/** Constante de tiempo (en ms) para la animación de las líneas de los hilos de comentarios. */
export const HOVER_DURATION_MS = 150;

/** Activa o desactiva el efecto glow (resplandor) en los hilos al hacer hover. */
export const ENABLE_LINE_GLOW = true;

export function getLineColor(active: boolean): string {
  return active ? 'border-zinc-300 z-10' : 'border-zinc-600 z-0';
}

export function getLineStyle(active: boolean): CSSProperties {
  return {
    transitionDuration: `${HOVER_DURATION_MS}ms`,
    ...(ENABLE_LINE_GLOW
      ? {
          filter: active
            ? 'drop-shadow(0 0 3px rgba(228, 228, 231, 0.6))'
            : 'drop-shadow(0 0 0px rgba(228, 228, 231, 0))',
        }
      : {}),
  };
}
