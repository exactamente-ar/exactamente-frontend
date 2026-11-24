/// <reference types="astro/client" />

// Los paquetes de @fontsource-variable solo exportan CSS y no traen tipos,
// así que el import side-effect de Layout.astro no resuelve sin esto.
declare module '@fontsource-variable/*';

// gtag lo inyecta GoogleAnalytics.astro con un script inline; puede no estar
// (bloqueadores, SSR), por eso es opcional.
interface Window {
  gtag?: (command: 'event', name: string, params?: Record<string, unknown>) => void;
}
