import { useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { FOCUS_RING, GRADIENT_FILL } from '@/features/study/constants/styles';
import { formatHours, formatMinutes } from '@/features/study/utils/format';
import type { HeatCell, SubjectRow } from '@/features/study/utils/metrics';

const CARD = 'flex min-w-0 flex-col gap-4 rounded-2xl border border-white/8 bg-[#18181b] p-5';
const TEXT_BUTTON = cn(
  'cursor-pointer text-xs font-semibold text-zinc-300 underline-offset-4 hover:text-white hover:underline',
  FOCUS_RING,
);

export function MetricCard({
  title,
  aside,
  className,
  children,
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className={cn(CARD, className)}>
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='text-base font-semibold'>{title}</h2>
        {aside && <span className='text-xs text-zinc-400'>{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/** 6 px bar against a goal. Past the goal it stays full and says so, without fanfare. */
export function GoalBar({
  minutes,
  goal,
  label,
}: {
  minutes: number;
  goal: number;
  label: string;
}) {
  const percent = Math.min(100, Math.round((minutes / (goal * 60)) * 100));
  return (
    <div className='flex flex-col gap-1'>
      <div
        role='progressbar'
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className='h-1.5 overflow-hidden rounded-full bg-white/8'
      >
        <div
          className={cn('h-full rounded-full', GRADIENT_FILL)}
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent >= 100 && <span className='text-xs text-zinc-300'>Meta cumplida</span>}
    </div>
  );
}

/** Inline goal editing in half hours: define, change or remove, no modal (FR-13, FR-14). */
export function GoalEditor({
  goal,
  onSave,
  removable = true,
}: {
  goal: number | null;
  onSave: (hours: number | null) => void;
  removable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');

  const open = () => {
    setText(goal === null ? '' : String(goal));
    setEditing(true);
  };

  if (!editing) {
    return (
      <span className='flex shrink-0 gap-3'>
        <button type='button' onClick={open} className={TEXT_BUTTON}>
          {goal === null ? 'Definir meta' : 'Cambiar'}
        </button>
        {goal !== null && removable && (
          <button type='button' onClick={() => onSave(null)} className={TEXT_BUTTON}>
            Quitar
          </button>
        )}
      </span>
    );
  }

  const hours = Number(text.replace(',', '.'));
  const valid = text.trim() !== '' && Number.isFinite(hours) && hours > 0;

  return (
    <form
      className='flex flex-wrap items-center gap-2'
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSave(hours);
        setEditing(false);
      }}
    >
      <label className='flex items-center gap-2 text-xs text-zinc-400'>
        <span className='sr-only'>Meta en horas</span>
        <input
          type='number'
          inputMode='decimal'
          min={0.5}
          step={0.5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={cn(
            'min-h-11 w-20 rounded-[10px] border border-white/15 bg-[#0b0b0d] px-3 text-sm font-semibold text-white tabular-nums',
            FOCUS_RING,
          )}
        />
        h
      </label>
      <button
        type='submit'
        disabled={!valid}
        className={cn(
          'min-h-11 cursor-pointer rounded-xl bg-white px-3 text-xs font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50',
          FOCUS_RING,
        )}
      >
        Guardar
      </button>
      <button
        type='button'
        onClick={() => setEditing(false)}
        className={cn(
          'min-h-11 cursor-pointer rounded-xl border border-white/15 px-3 text-xs font-medium text-zinc-200',
          FOCUS_RING,
        )}
      >
        Cancelar
      </button>
    </form>
  );
}

const WEEKDAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export function WeekChart({ days }: { days: { label: string; minutes: number }[] }) {
  const max = Math.max(60, ...days.map((d) => d.minutes));
  return (
    <ul className='grid h-48 grid-cols-7 items-end gap-2 sm:gap-3'>
      {days.map((d, i) => (
        <li
          key={d.label}
          className='flex h-full flex-col items-center justify-end gap-2'
          aria-label={`${WEEKDAY_NAMES[i]}: ${d.minutes ? formatMinutes(d.minutes) : 'sin estudio'}`}
        >
          <span aria-hidden='true' className='text-center text-[11px] text-zinc-300 tabular-nums'>
            {d.minutes ? formatMinutes(d.minutes) : '—'}
          </span>
          <div
            aria-hidden='true'
            className='w-full max-w-10 rounded-t-md rounded-b-[3px] bg-[#6b46c1cc]'
            style={{ height: `${Math.max(4, Math.round((d.minutes / max) * 120))}px` }}
          />
          <span aria-hidden='true' className='text-xs text-zinc-400'>
            {d.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SubjectBars({
  rows,
  onGoal,
}: {
  rows: SubjectRow[];
  onGoal: (row: SubjectRow, hours: number | null) => void;
}) {
  if (rows.length === 0) {
    return <p className='text-sm text-zinc-400'>Sin horas esta semana.</p>;
  }
  const max = Math.max(...rows.map((r) => r.minutes), 1);
  return (
    <ul className='flex flex-col gap-4'>
      {rows.map((row) => (
        <li key={row.subjectId} aria-label={row.subjectName} className='flex flex-col gap-1.5'>
          <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm'>
            <span className='min-w-0 truncate font-medium'>{row.subjectName}</span>
            <span className='flex items-baseline gap-3'>
              <span className='text-zinc-300 tabular-nums'>
                {row.goal === null
                  ? formatMinutes(row.minutes)
                  : `${formatMinutes(row.minutes)} de ${formatHours(row.goal)}`}
              </span>
              <GoalEditor goal={row.goal} onSave={(hours) => onGoal(row, hours)} />
            </span>
          </div>
          {row.goal === null ? (
            <div aria-hidden='true' className='h-1.5 overflow-hidden rounded-full bg-white/8'>
              <div
                className='h-full rounded-full bg-white/30'
                style={{ width: `${Math.round((row.minutes / max) * 100)}%` }}
              />
            </div>
          ) : (
            <GoalBar minutes={row.minutes} goal={row.goal} label={`Meta de ${row.subjectName}`} />
          )}
        </li>
      ))}
    </ul>
  );
}

// 0 = no study; then the teal brand color in four steps.
const HEAT_RAMP = [
  'bg-white/6',
  'bg-[#38b2ac40]',
  'bg-[#38b2ac80]',
  'bg-[#38b2acbf]',
  'bg-[#38b2ac]',
];

const DATE_LABEL = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export function Heatmap({ cells }: { cells: HeatCell[] }) {
  return (
    <>
      <div className='overflow-x-auto pb-1'>
        <div className='grid w-max grid-flow-col gap-[3px] [grid-auto-columns:10px] [grid-template-rows:repeat(7,10px)]'>
          {cells.map((c) =>
            c.future ? (
              <div key={c.dayKey} aria-hidden='true' className='size-2.5' />
            ) : (
              <div
                key={c.dayKey}
                role='img'
                aria-label={`${DATE_LABEL.format(c.date)}: ${c.minutes ? formatMinutes(c.minutes) : 'sin estudio'}`}
                title={`${DATE_LABEL.format(c.date)}: ${c.minutes ? formatMinutes(c.minutes) : 'sin estudio'}`}
                className={cn('size-2.5 rounded-[2px]', HEAT_RAMP[c.level])}
              />
            ),
          )}
        </div>
      </div>
      <div aria-hidden='true' className='flex items-center gap-1.5 text-xs text-zinc-400'>
        <span>Menos</span>
        {HEAT_RAMP.map((color) => (
          <div key={color} className={cn('size-2.5 rounded-[2px]', color)} />
        ))}
        <span>Más</span>
      </div>
    </>
  );
}
