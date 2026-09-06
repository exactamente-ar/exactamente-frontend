import { describe, expect, it } from 'vitest';
import { shouldShowSupportBanner } from './supportBanner';

describe('shouldShowSupportBanner', () => {
  const deadline = '2026-10-06';

  it('se muestra si no fue descartado y falta para la fecha límite', () => {
    expect(
      shouldShowSupportBanner({
        now: new Date('2026-09-10T12:00:00'),
        deadline,
        dismissedAt: null,
      }),
    ).toBe(true);
  });

  it('no se muestra una vez descartado', () => {
    expect(
      shouldShowSupportBanner({
        now: new Date('2026-09-10T12:00:00'),
        deadline,
        dismissedAt: '2026-09-09T08:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('no se muestra pasada la fecha límite aunque no se haya descartado', () => {
    expect(
      shouldShowSupportBanner({
        now: new Date('2026-10-07T00:30:00'),
        deadline,
        dismissedAt: null,
      }),
    ).toBe(false);
  });

  it('se muestra si la fecha límite está mal formada (un error de config no lo oculta)', () => {
    expect(
      shouldShowSupportBanner({
        now: new Date('2026-09-10T12:00:00'),
        deadline: 'no-es-una-fecha',
        dismissedAt: null,
      }),
    ).toBe(true);
  });
});
