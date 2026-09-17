import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Some Node/jsdom combinations expose no localStorage in the test environment.
if (typeof window !== 'undefined') {
  if (!window.localStorage) {
    const values = new Map<string, string>();
    const storage = {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      key: (index: number) => [...values.keys()][index] ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, String(value)),
    };

    Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
  }

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: window.localStorage,
  });
}

// Testing Library no desmonta solo cuando `globals: true` viene de Vitest
// en vez de su propio auto-cleanup, así que lo hacemos explícito.
afterEach(() => {
  cleanup();
});
