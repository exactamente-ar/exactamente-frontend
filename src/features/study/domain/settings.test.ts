import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, FOCUS_PRESETS, clampSetting, normalizeSettings } from './settings';

describe('normalizeSettings', () => {
  it('sin nada guardado devuelve los defaults: 50 / 10 / apagado / encendido / apagado', () => {
    const expected = {
      focusMin: 50,
      breakMin: 10,
      autoStartBreak: false,
      sound: true,
      notify: false,
    };

    expect(DEFAULT_SETTINGS).toEqual(expected);
    expect(normalizeSettings(null)).toEqual(expected);
    expect(normalizeSettings(undefined)).toEqual(expected);
    expect(normalizeSettings('basura')).toEqual(expected);
    expect(normalizeSettings({})).toEqual(expected);
  });

  it('completa con los defaults lo que falta', () => {
    expect(normalizeSettings({ focusMin: 25 })).toEqual({ ...DEFAULT_SETTINGS, focusMin: 25 });
  });

  it('acota el foco a 5–120 y el descanso a 1–30, redondeando', () => {
    expect(normalizeSettings({ focusMin: 999, breakMin: 0 })).toMatchObject({
      focusMin: 120,
      breakMin: 1,
    });
    expect(normalizeSettings({ focusMin: 1, breakMin: 99 })).toMatchObject({
      focusMin: 5,
      breakMin: 30,
    });
    expect(normalizeSettings({ focusMin: 24.6 })).toMatchObject({ focusMin: 25 });
  });

  it('descarta valores de tipo inválido', () => {
    const settings = normalizeSettings({
      focusMin: '60',
      breakMin: Number.NaN,
      autoStartBreak: 'yes',
      sound: 'bell',
      notify: 1,
    });

    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('respeta los booleanos válidos', () => {
    expect(normalizeSettings({ autoStartBreak: true, sound: false, notify: true })).toMatchObject({
      autoStartBreak: true,
      sound: false,
      notify: true,
    });
  });

  it('ignora campos del formato viejo del spike', () => {
    const settings = normalizeSettings({ shortBreakMin: 5, longBreakMin: 15, corner: 'x' });

    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings).not.toHaveProperty('longBreakMin');
  });
});

describe('clampSetting', () => {
  it('acota y redondea por campo', () => {
    expect(clampSetting('focusMin', 3)).toBe(5);
    expect(clampSetting('breakMin', 45)).toBe(30);
  });
});

describe('FOCUS_PRESETS', () => {
  it('ofrece 25, 50 y 60 minutos', () => {
    expect(FOCUS_PRESETS).toEqual([25, 50, 60]);
  });
});
