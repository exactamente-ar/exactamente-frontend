import { describe, expect, it } from 'vitest';
import { formatDateTime, snippetOf } from './format';

describe('snippetOf', () => {
  it('recorta el texto cuando supera el máximo', () => {
    const text = 'Recordatorio a todos los alumnos sobre el parcial del sábado';
    const result = snippetOf(text, 30);
    expect(result.length).toBeLessThanOrEqual(31);
    expect(result.endsWith('…')).toBe(true);
    expect(result.startsWith('Recordatorio a todos los alum')).toBe(true);
  });

  it('mantiene el texto intacto cuando es corto', () => {
    expect(snippetOf('Hola')).toBe('Hola');
  });

  it('colapsa los espacios múltiples', () => {
    expect(snippetOf('  hola   mundo  ')).toBe('hola mundo');
  });
});

describe('formatDateTime', () => {
  it('devuelve string vacío para una fecha inválida', () => {
    expect(formatDateTime('no-es-una-fecha')).toBe('');
  });

  it('devuelve un texto con fecha y hora para una fecha válida', () => {
    const result = formatDateTime('2026-08-12T14:30:00Z');
    expect(result.length).toBeGreaterThan(0);
  });
});
