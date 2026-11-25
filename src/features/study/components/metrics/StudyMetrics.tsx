import { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { weeklyGoalFor } from '@/features/study/domain/goals';
import { weekKey } from '@/features/study/domain/sessions';
import { studyStore, type StudyStore } from '@/features/study/store/studyStore';
import { useStudy } from '@/features/study/hooks/useStudy';
import { FOCUS_RING } from '@/features/study/constants/styles';
import { formatHours, formatMinutes, formatSignedDuration } from '@/features/study/utils/format';
import {
  addDays,
  heatmap,
  streak,
  subjectRows,
  weekDays,
  weekMinutes,
} from '@/features/study/utils/metrics';
import SessionList from './SessionList';
import { GoalBar, GoalEditor, Heatmap, MetricCard, SubjectBars, WeekChart } from './MetricsCharts';

type Props = { store?: StudyStore };

function comparison(delta: number): string {
  if (delta === 0) return 'Igual que la semana pasada';
  return `${formatSignedDuration(delta)} que la semana pasada`;
}

function streakTitle(days: number): string {
  if (days === 0) return '0 días';
  return days === 1 ? '1 día' : `${days} días seguidos`;
}

export default function StudyMetrics({ store = studyStore }: Props) {
  const { sessions, goals, now: tickedAt } = useStudy(store);
  // `now` only moves while a timer ticks; outside of that, the render time is enough.
  const now = useMemo(() => new Date(tickedAt || Date.now()), [tickedAt]);

  const data = useMemo(() => {
    const week = weekKey(now);
    const lastWeek = weekKey(addDays(now, -7));
    return {
      thisWeek: weekMinutes(sessions, now, 0),
      lastWeek: weekMinutes(sessions, now, -1),
      goal: weeklyGoalFor(goals, week),
      lastGoal: weeklyGoalFor(goals, lastWeek),
      streak: streak(sessions, now),
      days: weekDays(sessions, now),
      subjects: subjectRows(sessions, goals, now),
      heat: heatmap(sessions, now),
    };
  }, [sessions, goals, now]);

  if (sessions.length === 0) {
    return (
      <div className='flex flex-col gap-6 pt-28 pb-16'>
        <h1 className='text-3xl font-bold tracking-tight'>Tu estudio</h1>
        <div className='flex flex-col items-start gap-4 rounded-2xl border border-dashed border-white/20 p-6'>
          <p className='max-w-xl text-sm leading-relaxed text-zinc-300'>
            Acá vas a ver cuánto estudiás por semana y por materia. Abrí el reloj de arriba y
            arrancá tu primer foco.
          </p>
          <button
            type='button'
            onClick={() => {
              window.scrollTo({ top: 0 });
              store.setPanelOpen('header', true);
            }}
            className={cn(
              'min-h-11 cursor-pointer rounded-xl bg-white px-4 text-sm font-bold text-primary-foreground',
              FOCUS_RING,
            )}
          >
            Abrir el reloj
          </button>
          <p className='text-xs text-zinc-400'>Tus horas se guardan en este navegador.</p>
        </div>
      </div>
    );
  }

  const { thisWeek, lastWeek, goal, lastGoal } = data;

  return (
    <div className='flex flex-col gap-4 pt-28 pb-16'>
      <div className='flex flex-col gap-1 pb-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Tu estudio</h1>
        <p className='text-sm text-zinc-400'>Tus horas se guardan en este navegador.</p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <MetricCard title='Esta semana' className='lg:col-span-2'>
          <div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
            <span className='text-4xl font-bold tabular-nums'>{formatMinutes(thisWeek)}</span>
            <span className='text-sm text-zinc-300'>{comparison(thisWeek - lastWeek)}</span>
          </div>
          {goal === null ? (
            <p className='flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-400'>
              Todavía no tenés meta semanal.
              <GoalEditor goal={null} onSave={store.setWeeklyGoal} />
            </p>
          ) : (
            <div className='flex flex-col gap-2'>
              <div className='flex flex-wrap items-baseline justify-between gap-2 text-sm'>
                <span className='text-zinc-300'>{`${formatMinutes(thisWeek)} de ${formatHours(goal)}`}</span>
                <GoalEditor goal={goal} onSave={store.setWeeklyGoal} />
              </div>
              <GoalBar minutes={thisWeek} goal={goal} label='Meta semanal' />
            </div>
          )}
          <p className='text-xs text-zinc-400'>
            {lastGoal === null
              ? `La semana pasada: ${formatMinutes(lastWeek)}`
              : `La semana pasada: ${formatMinutes(lastWeek)} de ${formatHours(lastGoal)}`}
          </p>
        </MetricCard>

        <MetricCard title='Racha'>
          <span className='text-4xl font-bold tabular-nums'>
            {streakTitle(data.streak.current)}
          </span>
          {!data.streak.studiedToday && (
            <p className='text-sm text-zinc-300'>
              {data.streak.current > 0
                ? 'Estudiá hoy para sumar el día'
                : 'Estudiá hoy para arrancar una racha'}
            </p>
          )}
        </MetricCard>

        <MetricCard title='Por materia' aside='esta semana' className='lg:col-span-2'>
          <SubjectBars
            rows={data.subjects}
            onGoal={(row, hours) =>
              store.setSubjectGoal(
                { subjectId: row.subjectId, subjectName: row.subjectName },
                hours,
              )
            }
          />
        </MetricCard>

        <MetricCard title='Días de la semana'>
          <WeekChart days={data.days} />
        </MetricCard>

        <MetricCard
          title='Historial'
          aside='últimas 26 semanas · cada cuadro es un día'
          className='md:col-span-2 lg:col-span-3'
        >
          <Heatmap cells={data.heat} />
        </MetricCard>

        <MetricCard title='Sesiones' className='md:col-span-2 lg:col-span-3'>
          <SessionList sessions={sessions} store={store} />
        </MetricCard>
      </div>
    </div>
  );
}
