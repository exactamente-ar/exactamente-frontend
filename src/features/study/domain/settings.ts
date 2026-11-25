export type StudySettings = {
  /** Focus length in minutes, 5–120. */
  focusMin: number;
  /** Break length in minutes, 1–30. */
  breakMin: number;
  /** Start the break as soon as the focus reaches its length; there is no overtime then. */
  autoStartBreak: boolean;
  sound: boolean;
  notify: boolean;
};

export const DEFAULT_SETTINGS: StudySettings = {
  focusMin: 50,
  breakMin: 10,
  autoStartBreak: false,
  sound: true,
  notify: false,
};

export const FOCUS_PRESETS = [25, 50, 60] as const;

type NumericKey = 'focusMin' | 'breakMin';
type BooleanKey = 'autoStartBreak' | 'sound' | 'notify';

export const SETTINGS_LIMITS: Record<NumericKey, { min: number; max: number }> = {
  focusMin: { min: 5, max: 120 },
  breakMin: { min: 1, max: 30 },
};

const NUMERIC_KEYS = Object.keys(SETTINGS_LIMITS) as NumericKey[];
const BOOLEAN_KEYS: BooleanKey[] = ['autoStartBreak', 'sound', 'notify'];

export function clampSetting(key: NumericKey, value: number): number {
  const { min, max } = SETTINGS_LIMITS[key];
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Coerces anything read from storage (or a form) into valid settings. */
export function normalizeSettings(raw: unknown): StudySettings {
  const settings = { ...DEFAULT_SETTINGS };
  if (!raw || typeof raw !== 'object') return settings;
  const input = raw as Record<string, unknown>;

  for (const key of NUMERIC_KEYS) {
    const value = input[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      settings[key] = clampSetting(key, value);
    }
  }
  for (const key of BOOLEAN_KEYS) {
    const value = input[key];
    if (typeof value === 'boolean') settings[key] = value;
  }
  return settings;
}
