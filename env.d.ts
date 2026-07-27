/// <reference types="astro/client" />

// Los paquetes de @fontsource-variable solo exportan CSS y no traen tipos,
// así que el import side-effect de Layout.astro no resuelve sin esto.
declare module '@fontsource-variable/*';
