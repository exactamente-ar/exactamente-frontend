import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

const jsdomWindow = (globalThis as typeof globalThis & { jsdom?: { window: Window } }).jsdom
  ?.window;

// Node 26 exposes an empty localStorage global that shadows jsdom's implementation.
if (jsdomWindow) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => jsdomWindow.localStorage,
  });
}

// Testing Library no desmonta solo cuando `globals: true` viene de Vitest
// en vez de su propio auto-cleanup, así que lo hacemos explícito.
afterEach(() => {
  cleanup();
});
