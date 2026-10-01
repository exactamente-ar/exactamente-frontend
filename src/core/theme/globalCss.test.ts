import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_FACULTY_SLUG, FACULTY_PALETTES, paletteToCssVars } from './facultyPalettes';

const css = readFileSync(resolve(__dirname, '../global.css'), 'utf8').replaceAll('"', "'");

// Devuelve las declaraciones `--theme-*` del primer bloque que arranca con el selector.
function themeVarsOf(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  expect(start, `falta el bloque ${selector}`).toBeGreaterThanOrEqual(0);
  const body = css.slice(start, css.indexOf('}', start));
  const vars: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/(--theme-[\w-]+):\s*([^;]+);/g)) {
    vars[name] = value.trim().toLowerCase();
  }
  return vars;
}

describe('global.css y facultyPalettes', () => {
  it('los defaults de :root coinciden con la paleta por defecto', () => {
    expect(themeVarsOf(':root')).toEqual(paletteToCssVars(FACULTY_PALETTES[DEFAULT_FACULTY_SLUG]));
  });

  for (const [slug, palette] of Object.entries(FACULTY_PALETTES)) {
    it(`html[data-faculty="${slug}"] coincide con la paleta de TS`, () => {
      expect(themeVarsOf(`html[data-faculty='${slug}']`)).toEqual(paletteToCssVars(palette));
    });
  }

  it('los gradientes no tienen colores fijos de la paleta vieja', () => {
    for (const old of ['#6b46c1', '#b83280', '#38b2ac', '#6d1a40', '#0d4a47']) {
      expect(css.toLowerCase()).not.toContain(old);
    }
  });
});
