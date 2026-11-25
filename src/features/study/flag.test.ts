import { afterEach, describe, expect, it, vi } from 'vitest';
import { isStudyModeEnabled } from './flag';

afterEach(() => vi.unstubAllEnvs());

describe('isStudyModeEnabled', () => {
  it('está apagado sin la variable', () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', undefined);

    expect(isStudyModeEnabled()).toBe(false);
  });

  it.each(['false', '1', 'TRUE', 'yes', ''])('está apagado con %j', (value) => {
    vi.stubEnv('PUBLIC_STUDY_MODE', value);

    expect(isStudyModeEnabled()).toBe(false);
  });

  it("solo se prende con 'true'", () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', 'true');

    expect(isStudyModeEnabled()).toBe(true);
  });
});
