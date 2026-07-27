import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library no desmonta solo cuando `globals: true` viene de Vitest
// en vez de su propio auto-cleanup, así que lo hacemos explícito.
afterEach(() => {
  cleanup();
});
