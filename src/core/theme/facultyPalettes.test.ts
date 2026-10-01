import { describe, expect, it } from 'vitest';
import { FACULTY_PALETTES, DEFAULT_FACULTY_SLUG, resolvePalette } from './facultyPalettes';

describe('resolvePalette', () => {
  it('tiene paleta para las 4 facultades', () => {
    expect(Object.keys(FACULTY_PALETTES).sort()).toEqual([
      'economicas',
      'exactas',
      'humanas',
      'veterinarias',
    ]);
  });

  it('devuelve la paleta de la facultad pedida', () => {
    expect(resolvePalette('veterinarias')).toBe(FACULTY_PALETTES.veterinarias);
    expect(resolvePalette('humanas')).toBe(FACULTY_PALETTES.humanas);
    expect(resolvePalette('economicas')).toBe(FACULTY_PALETTES.economicas);
  });

  it('cae en exactas con un slug desconocido', () => {
    expect(resolvePalette('inexistente')).toBe(FACULTY_PALETTES.exactas);
  });

  it('cae en exactas sin slug', () => {
    expect(resolvePalette(undefined)).toBe(FACULTY_PALETTES.exactas);
    expect(resolvePalette(null)).toBe(FACULTY_PALETTES.exactas);
    expect(DEFAULT_FACULTY_SLUG).toBe('exactas');
  });

  it('no resuelve propiedades heredadas del prototipo', () => {
    expect(resolvePalette('constructor')).toBe(FACULTY_PALETTES.exactas);
  });
});

describe('paletas', () => {
  it('cada paleta define 5 stops de gradiente que cierran el ciclo', () => {
    for (const palette of Object.values(FACULTY_PALETTES)) {
      expect(palette.stops).toHaveLength(5);
      expect(palette.stops[4]).toBe(palette.stops[0]);
      expect(palette.darkStops).toHaveLength(5);
    }
  });
});
