import { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import {
  isValidMinutes,
  sessionDayKey,
  type SessionSubject,
  type StudySession,
} from '@/features/study/domain/sessions';
import type { StudyStore } from '@/features/study/store/studyStore';
import { FOCUS_RING } from '@/features/study/constants/styles';
import { formatMinutes } from '@/features/study/utils/format';
import SubjectPicker from '@/features/study/components/SubjectPicker';

const PAGE_SIZE = 20;

const DAY_LABEL = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const TIME_LABEL = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const TEXT_BUTTON = cn(
  'min-h-11 cursor-pointer px-1 text-xs font-semibold text-zinc-300 underline-offset-4 hover:text-white hover:underline',
  FOCUS_RING,
);
const PRIMARY = cn(
  'min-h-11 cursor-pointer rounded-xl bg-white px-3 text-xs font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50',
  FOCUS_RING,
);
const SECONDARY = cn(
  'min-h-11 cursor-pointer rounded-xl border border-white/15 px-3 text-xs font-medium text-zinc-200',
  FOCUS_RING,
);

function EditForm({
  session,
  onSave,
  onCancel,
}: {
  session: StudySession;
  onSave: (minutes: number, subject: SessionSubject) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(String(session.minutes));
  const [subject, setSubject] = useState<SessionSubject | null>({
    careerId: session.careerId,
    careerName: session.careerName,
    subjectId: session.subjectId,
    subjectName: session.subjectName,
  });
  const minutes = Number(text);
  const valid = text.trim() !== '' && isValidMinutes(session, minutes) && subject !== null;

  return (
    <form
      className='flex flex-col gap-3 pt-2'
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && subject) onSave(minutes, subject);
      }}
    >
      <label className='flex items-center gap-2 text-xs text-zinc-400'>
        Minutos
        <input
          type='number'
          inputMode='numeric'
          min={1}
          max={session.recordedMinutes}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={cn(
            'min-h-11 w-20 rounded-[10px] border border-white/15 bg-[#0b0b0d] px-3 text-sm font-semibold text-white tabular-nums',
            FOCUS_RING,
          )}
        />
        <span>{`máx. ${session.recordedMinutes}`}</span>
      </label>
      <SubjectPicker value={subject} onChange={setSubject} />
      <div className='flex gap-2'>
        <button type='submit' disabled={!valid} className={PRIMARY}>
          Guardar
        </button>
        <button type='button' onClick={onCancel} className={SECONDARY}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function SessionRow({ session, store }: { session: StudySession; store: StudyStore }) {
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const started = new Date(session.startedAt);

  return (
    <li className='flex flex-col border-t border-white/8 py-2 first:border-t-0'>
      <div className='flex flex-wrap items-center justify-between gap-x-3 text-sm'>
        <span className='flex min-w-0 items-baseline gap-3'>
          <span className='text-zinc-400 tabular-nums'>{TIME_LABEL.format(started)}</span>
          <span className='min-w-0 truncate font-medium'>{session.subjectName}</span>
          <span className='text-zinc-300 tabular-nums'>{formatMinutes(session.minutes)}</span>
        </span>
        {mode === 'view' && (
          <span className='flex gap-2'>
            <button type='button' onClick={() => setMode('edit')} className={TEXT_BUTTON}>
              Editar
            </button>
            <button type='button' onClick={() => setMode('delete')} className={TEXT_BUTTON}>
              Borrar
            </button>
          </span>
        )}
      </div>
      {mode === 'delete' && (
        <div className='flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-300'>
          <span>¿Borrar esta sesión?</span>
          <button
            type='button'
            onClick={() => store.deleteSession(session.id)}
            className={cn(SECONDARY, 'border-red-500/50 text-red-200')}
          >
            Sí, borrar
          </button>
          <button type='button' onClick={() => setMode('view')} className={SECONDARY}>
            Cancelar
          </button>
        </div>
      )}
      {mode === 'edit' && (
        <EditForm
          session={session}
          onCancel={() => setMode('view')}
          onSave={(minutes, subject) => {
            if (store.editSession(session.id, { minutes, subject })) setMode('view');
          }}
        />
      )}
    </li>
  );
}

/** Editable history, grouped by local day, newest first (FR-12, FR-18). */
export default function SessionList({
  sessions,
  store,
}: {
  sessions: StudySession[];
  store: StudyStore;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const groups = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    const page = sorted.slice(0, visible);
    const byDay = new Map<string, StudySession[]>();
    for (const s of page) {
      const key = sessionDayKey(s);
      byDay.set(key, [...(byDay.get(key) ?? []), s]);
    }
    return [...byDay.entries()];
  }, [sessions, visible]);

  return (
    <div className='flex flex-col gap-4'>
      {groups.map(([dayKey, daySessions]) => (
        <div key={dayKey} className='flex flex-col gap-1'>
          <h3 className='text-xs font-semibold tracking-wide text-zinc-400 uppercase'>
            {DAY_LABEL.format(new Date(daySessions[0].startedAt))}
          </h3>
          <ul className='flex flex-col'>
            {daySessions.map((s) => (
              <SessionRow key={s.id} session={s} store={store} />
            ))}
          </ul>
        </div>
      ))}
      {sessions.length > visible && (
        <button
          type='button'
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className={cn(SECONDARY, 'self-start')}
        >
          Ver más
        </button>
      )}
    </div>
  );
}
