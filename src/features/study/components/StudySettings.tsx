import { useEffect, useId, useState, type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  FOCUS_PRESETS,
  SETTINGS_LIMITS,
  clampSetting,
  type StudySettings as Settings,
} from '@/features/study/domain/settings';
import type { StudyStore } from '@/features/study/store/studyStore';
import { FOCUS_RING } from '@/features/study/constants/styles';
import {
  notificationPermission,
  primeAudio,
  requestNotificationPermission,
} from '@/features/study/utils/alerts';

type Props = {
  settings: Settings;
  store: StudyStore;
  onBack: () => void;
};

type DurationKey = keyof typeof SETTINGS_LIMITS;

const FIELD =
  'min-h-11 w-20 rounded-[10px] border border-white/15 bg-[#0b0b0d] px-3 text-sm font-semibold text-white tabular-nums';

function Switch({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const helpId = useId();
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex min-h-11 items-center justify-between gap-3 text-sm'>
        <span id={`${helpId}-label`}>{label}</span>
        <button
          type='button'
          role='switch'
          aria-checked={checked}
          aria-labelledby={`${helpId}-label`}
          aria-describedby={help ? helpId : undefined}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors',
            checked ? 'bg-[#38b2accc]' : 'bg-white/15',
            FOCUS_RING,
          )}
        >
          <span
            aria-hidden='true'
            className={cn(
              'absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform motion-reduce:transition-none',
              checked && 'translate-x-4',
            )}
          />
        </button>
      </div>
      {help && (
        <p id={helpId} className='text-xs leading-relaxed text-zinc-400'>
          {help}
        </p>
      )}
    </div>
  );
}

function DurationField({
  field,
  label,
  value,
  onCommit,
}: {
  field: DurationKey;
  label: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  // Edited as text so the field can be emptied while typing; clamped on blur.
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const { min, max } = SETTINGS_LIMITS[field];

  return (
    <label className='flex min-h-11 items-center justify-between gap-3 text-sm'>
      {label}
      <span className='flex items-center gap-2 text-xs text-zinc-400'>
        <input
          type='number'
          inputMode='numeric'
          min={min}
          max={max}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const number = Number(e.target.value);
            // Saves at once while the value is valid (UX-DR3).
            if (e.target.value.trim() !== '' && number >= min && number <= max) onCommit(number);
          }}
          onBlur={() => {
            const number = Number(text);
            const next =
              text.trim() !== '' && Number.isFinite(number) ? clampSetting(field, number) : value;
            setText(String(next));
            if (next !== value) onCommit(next);
          }}
          className={cn(FIELD, FOCUS_RING)}
        />
        min
      </span>
    </label>
  );
}

export default function StudySettings({ settings, store, onBack }: Props) {
  const [notifyBlocked, setNotifyBlocked] = useState(false);

  const onNotify = async (checked: boolean) => {
    setNotifyBlocked(false);
    if (!checked) return store.updateSettings({ notify: false });
    if (notificationPermission() === 'unsupported') return setNotifyBlocked(true);
    const granted = await requestNotificationPermission();
    store.updateSettings({ notify: granted });
    setNotifyBlocked(!granted);
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-1'>
        <button
          type='button'
          onClick={onBack}
          aria-label='Volver'
          className={cn(
            '-ml-2 flex size-11 cursor-pointer items-center justify-center rounded-[10px] text-zinc-400 hover:bg-white/5 hover:text-white',
            FOCUS_RING,
          )}
        >
          <ChevronLeft size={18} aria-hidden='true' />
        </button>
        <h2 className='text-base font-semibold'>Configuración</h2>
      </div>

      <div className='flex flex-col gap-2'>
        <div
          role='radiogroup'
          aria-label='Presets de foco'
          className='grid grid-cols-3 gap-1 rounded-xl bg-[#0b0b0d] p-1'
        >
          {FOCUS_PRESETS.map((minutes) => {
            const active = settings.focusMin === minutes;
            return (
              <button
                key={minutes}
                type='button'
                role='radio'
                aria-checked={active}
                onClick={() => store.setFocusMinutes(minutes)}
                className={cn(
                  'min-h-10 cursor-pointer rounded-[9px] text-sm transition-colors',
                  active
                    ? 'border border-[#b83280cc] bg-zinc-800 font-semibold text-white'
                    : 'border border-transparent font-medium text-zinc-400 hover:text-white',
                  FOCUS_RING,
                )}
              >
                {`${minutes} min`}
              </button>
            );
          })}
        </div>
        <DurationField
          field='focusMin'
          label='Duración del foco'
          value={settings.focusMin}
          onCommit={(focusMin) => store.updateSettings({ focusMin })}
        />
        <DurationField
          field='breakMin'
          label='Duración del descanso'
          value={settings.breakMin}
          onCommit={(breakMin) => store.updateSettings({ breakMin })}
        />
      </div>

      <div className='flex flex-col gap-1 border-t border-white/10 pt-3'>
        <Switch
          label='Arrancar el descanso solo al terminar el foco'
          help='Con esto activado no hay tiempo extra: el foco se cierra al cumplir su duración.'
          checked={settings.autoStartBreak}
          onChange={(autoStartBreak) => store.updateSettings({ autoStartBreak })}
        />
        <Switch
          label='Sonido al terminar'
          checked={settings.sound}
          onChange={(sound) => {
            if (sound) primeAudio();
            store.updateSettings({ sound });
          }}
        />
        <Switch
          label='Notificación del navegador'
          checked={settings.notify}
          onChange={(checked) => void onNotify(checked)}
        />
        {notifyBlocked && (
          <p role='alert' className='text-xs text-amber-200'>
            Tu navegador bloqueó las notificaciones.
          </p>
        )}
      </div>

      <p className='text-xs text-zinc-400'>Tus horas se guardan en este navegador.</p>
    </div>
  );
}
