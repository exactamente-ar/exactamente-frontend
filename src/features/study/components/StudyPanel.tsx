import { useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { FOCUS_PRESETS } from '@/features/study/domain/settings';
import type { StudyStore } from '@/features/study/store/studyStore';
import type { StudyView } from '@/features/study/hooks/useStudy';
import { FOCUS_RING, GRADIENT_FILL } from '@/features/study/constants/styles';
import {
  formatClock,
  formatHours,
  formatMinutes,
  formatOvertime,
} from '@/features/study/utils/format';
import { primeAudio } from '@/features/study/utils/alerts';
import SubjectPicker from './SubjectPicker';

type Props = {
  study: StudyView;
  store: StudyStore;
  id: string;
  onClose: () => void;
  /** Footer slot, filled by the chip (settings entry, story 1.6). */
  footerExtra?: ReactNode;
};

const MIN = 60_000;

const PRIMARY =
  'min-h-11 w-full cursor-pointer rounded-xl bg-white px-4 text-sm font-bold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50';
const SECONDARY =
  'min-h-11 flex-1 cursor-pointer rounded-xl border border-white/15 px-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5';

type Action = { label: string; onClick: () => void };

function clockOf(study: StudyView): { clock: string; label: string; tone: string } {
  const { timer, settings, remainingMs, overtimeMs, inOvertime } = study;
  if (timer.phase === 'idle') {
    return {
      clock: formatClock(settings.focusMin * MIN),
      label: `Foco · ${settings.focusMin} min`,
      tone: 'text-[#efefef]',
    };
  }
  if (timer.phase === 'break') {
    return {
      clock: formatClock(remainingMs),
      label: `Descanso · ${Math.round(timer.targetMs / MIN)} min`,
      tone: 'text-[#38b2ac]',
    };
  }
  const paused = timer.runningSince === null;
  if (inOvertime) {
    return {
      clock: formatOvertime(overtimeMs),
      label: paused ? 'En pausa · tiempo extra' : 'Tiempo extra',
      tone: paused ? 'text-zinc-400' : 'text-[#f6e05e]',
    };
  }
  return {
    clock: formatClock(remainingMs),
    label: paused ? 'En pausa' : `Foco · ${Math.round(timer.targetMs / MIN)} min`,
    tone: paused ? 'text-zinc-400' : 'text-[#efefef]',
  };
}

function actionsOf(study: StudyView, store: StudyStore): { primary: Action; secondary: Action[] } {
  const { timer, inOvertime } = study;
  const end = { label: 'Terminar foco', onClick: store.endFocus };
  const pause = { label: 'Pausar', onClick: store.pause };
  const toBreak = { label: 'Arrancar descanso', onClick: store.startBreak };

  if (timer.phase === 'break') {
    return { primary: { label: 'Saltar descanso', onClick: store.skipBreak }, secondary: [] };
  }
  if (timer.phase === 'focus') {
    if (timer.runningSince === null) {
      return { primary: { label: 'Reanudar', onClick: store.resume }, secondary: [end] };
    }
    return inOvertime
      ? { primary: toBreak, secondary: [end, pause] }
      : { primary: pause, secondary: [end, toBreak] };
  }
  return {
    primary: {
      label: 'Arrancar foco',
      onClick: () => {
        // Inside the click, so autoplay policies let the end-of-focus sound play later.
        primeAudio();
        store.start();
      },
    },
    secondary: [],
  };
}

export default function StudyPanel({ study, store, id, onClose, footerExtra }: Props) {
  const [changing, setChanging] = useState(false);
  const { timer, settings, todayMinutes, weekMinutes, weeklyGoal, canStart, lastCareer } = study;
  const subject = timer.subject;
  const inFocus = timer.phase === 'focus';
  const picking = !inFocus && (subject === null || changing);
  const { clock, label, tone } = clockOf(study);
  const { primary, secondary } = actionsOf(study, store);
  const goalMinutes = weeklyGoal === null ? null : weeklyGoal * 60;
  const progress = goalMinutes ? Math.min(100, Math.round((weekMinutes / goalMinutes) * 100)) : 0;

  return (
    <div id={id} className='flex flex-col gap-4'>
      <h2 className='sr-only'>Modo estudio</h2>

      <div className='flex flex-col gap-2'>
        {subject && !picking && (
          <div className='flex items-center justify-between gap-3 text-sm'>
            <span className='min-w-0 truncate font-medium text-white'>
              {`${subject.subjectName} · ${subject.careerName}`}
            </span>
            {!inFocus && (
              <button
                type='button'
                onClick={() => setChanging(true)}
                className={cn(
                  'shrink-0 cursor-pointer text-xs font-semibold text-zinc-300 underline-offset-4 hover:text-white hover:underline',
                  FOCUS_RING,
                )}
              >
                Cambiar
              </button>
            )}
          </div>
        )}
        {picking && (
          <SubjectPicker
            value={subject}
            preferredCareerId={lastCareer?.careerId ?? null}
            onCareerChange={store.setLastCareer}
            onChange={(next) => {
              store.setSubject(next);
              if (next) setChanging(false);
            }}
          />
        )}
        {subject && picking && (
          <p className='text-xs text-zinc-400'>{`${subject.subjectName} · ${subject.careerName}`}</p>
        )}
      </div>

      <div className='flex flex-col items-center gap-1 py-1'>
        <span
          aria-hidden='true'
          className={cn('text-[40px] leading-none font-medium tabular-nums', tone)}
        >
          {clock}
        </span>
        <span className='text-xs text-zinc-400'>{label}</span>
      </div>

      {timer.phase === 'idle' && (
        <div
          role='radiogroup'
          aria-label='Duración del foco'
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
      )}

      <div className='flex flex-col gap-2'>
        <button
          type='button'
          onClick={primary.onClick}
          disabled={timer.phase === 'idle' && !canStart}
          className={cn(PRIMARY, FOCUS_RING)}
        >
          {primary.label}
        </button>
        {timer.phase === 'idle' && !subject && (
          <p className='text-center text-xs text-zinc-400'>Elegí una materia para arrancar</p>
        )}
        {secondary.length > 0 && (
          <div className='flex gap-2'>
            {secondary.map((action) => (
              <button
                key={action.label}
                type='button'
                onClick={action.onClick}
                className={cn(SECONDARY, FOCUS_RING)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className='flex flex-col gap-2 border-t border-white/10 pt-3 text-[13px] text-zinc-400'>
        <p>
          Hoy: <span className='font-semibold text-white'>{formatMinutes(todayMinutes)}</span>
        </p>
        {weeklyGoal === null ? (
          <p className='flex items-center justify-between gap-2'>
            <span>
              Semana: <span className='font-semibold text-white'>{formatMinutes(weekMinutes)}</span>
            </span>
            <a
              href='/estudio'
              className={cn(
                'font-medium text-zinc-200 underline-offset-4 hover:underline',
                FOCUS_RING,
              )}
            >
              Definir meta
            </a>
          </p>
        ) : (
          <div className='flex flex-col gap-1.5'>
            <p>
              Semana:{' '}
              <span className='font-semibold text-white'>
                {formatMinutes(weekMinutes)} de {formatHours(weeklyGoal)}
              </span>
              {progress >= 100 && <span className='ml-2 text-zinc-300'>Meta cumplida</span>}
            </p>
            <div
              role='progressbar'
              aria-label='Meta semanal'
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className='h-1.5 overflow-hidden rounded-full bg-white/8'
            >
              <div
                className={cn('h-full rounded-full', GRADIENT_FILL)}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className='flex items-center justify-between gap-2'>
        <a
          href='/estudio'
          onClick={onClose}
          className={cn(
            'flex min-h-11 items-center text-[13px] font-medium text-zinc-200 underline-offset-4 hover:text-white hover:underline',
            FOCUS_RING,
          )}
        >
          Ver métricas
        </a>
        {footerExtra}
      </div>
    </div>
  );
}
