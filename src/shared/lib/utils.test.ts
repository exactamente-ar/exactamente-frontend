import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('junta clases sueltas', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('deja ganar a la última cuando dos clases de tailwind chocan', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('descarta valores falsy de los condicionales', () => {
    expect(cn('base', false && 'nope', undefined, null, 'extra')).toBe('base extra');
  });
});
