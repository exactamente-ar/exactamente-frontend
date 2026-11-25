import { describe, expect, it } from 'vitest';
import {
  formatClock,
  formatHours,
  formatMinutes,
  formatOvertime,
  formatSignedDuration,
  spokenDuration,
} from './format';

const MIN = 60_000;

describe('formatClock', () => {
  it('muestra mm:ss redondeando hacia arriba, sin envolver la hora', () => {
    expect(formatClock(49 * MIN + 59_001)).toBe('50:00');
    expect(formatClock(49 * MIN + 59_000)).toBe('49:59');
    expect(formatClock(60 * MIN)).toBe('60:00');
    expect(formatClock(-5)).toBe('00:00');
  });
});

describe('formatOvertime', () => {
  it('muestra +mm:ss redondeando hacia abajo', () => {
    expect(formatOvertime(8 * MIN + 12_900)).toBe('+08:12');
    expect(formatOvertime(0)).toBe('+00:00');
  });
});

describe('formatMinutes', () => {
  it('lee como "1 h 40 min", "25 min" o "1 h"', () => {
    expect(formatMinutes(100)).toBe('1 h 40 min');
    expect(formatMinutes(25)).toBe('25 min');
    expect(formatMinutes(60)).toBe('1 h');
    expect(formatMinutes(0)).toBe('0 min');
  });
});

describe('formatSignedDuration', () => {
  it('lleva signo + o − y nada en cero', () => {
    expect(formatSignedDuration(130)).toBe('+2 h 10 min');
    expect(formatSignedDuration(-45)).toBe('−45 min');
    expect(formatSignedDuration(0)).toBe('0 min');
  });
});

describe('formatHours', () => {
  it('usa coma decimal', () => {
    expect(formatHours(12)).toBe('12 h');
    expect(formatHours(7.5)).toBe('7,5 h');
  });
});

describe('spokenDuration', () => {
  it('lee minutos, y segundos si se piden', () => {
    expect(spokenDuration(49 * MIN + 10_000)).toBe('49 minutos');
    expect(spokenDuration(MIN)).toBe('1 minuto');
    expect(spokenDuration(20_000)).toBe('menos de un minuto');
    expect(spokenDuration(8 * MIN + 12_000, true)).toBe('8 minutos 12 segundos');
    expect(spokenDuration(61 * MIN, true)).toBe('1 hora 1 minuto');
  });
});
