import { describe, expect, it } from 'vitest';
import { FACULTY_PALETTES } from './facultyPalettes';
import { contrastRatio } from './contrast';

// Fondos reales del sitio: --color-background y --color-primary-foreground (body).
const DARK_BACKGROUNDS = ['#0f172a', '#131314'];
const WCAG_AA_TEXT = 4.5;

describe('contrastRatio', () => {
  it('blanco sobre negro es 21:1', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
  });

  it('es simétrico y 1:1 con el mismo color', () => {
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
    expect(contrastRatio('#336699', '#000000')).toBeCloseTo(contrastRatio('#000000', '#336699'), 5);
  });
});

describe('contraste WCAG AA de las paletas sobre el fondo oscuro', () => {
  for (const [slug, palette] of Object.entries(FACULTY_PALETTES)) {
    for (const bg of DARK_BACKGROUNDS) {
      it(`${slug}: acento y stops de texto >= 4.5 sobre ${bg}`, () => {
        for (const color of [palette.accent, ...palette.stops]) {
          expect(contrastRatio(color, bg), `${color} sobre ${bg}`).toBeGreaterThanOrEqual(
            WCAG_AA_TEXT,
          );
        }
      });
    }
  }
});
