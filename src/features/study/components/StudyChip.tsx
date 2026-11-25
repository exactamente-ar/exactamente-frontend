import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Pause, Settings, Timer } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  studyStore,
  type PanelPlacement,
  type StudyStore,
} from '@/features/study/store/studyStore';
import { useStudy, type StudyView } from '@/features/study/hooks/useStudy';
import { useStudyEngine } from '@/features/study/hooks/useStudyEngine';
import { useStudyAlerts } from '@/features/study/hooks/useStudyAlerts';
import { useMediaQuery } from '@/features/study/hooks/useMediaQuery';
import {
  BREAK_BORDER,
  FOCUS_RING,
  GRADIENT_BORDER,
  GRADIENT_FILL,
  IDLE_BORDER,
  LAYER_SHEET,
  PANEL_GRADIENT_BORDER,
  PAUSED_BORDER,
} from '@/features/study/constants/styles';
import { formatClock, formatOvertime, spokenDuration } from '@/features/study/utils/format';
import { readPageContext, resolveContextSubject } from '@/features/study/context';
import StudyPanel from './StudyPanel';
import StudySettings from './StudySettings';
import StudyToast from './StudyToast';

type Props = {
  placement: PanelPlacement;
  store?: StudyStore;
};

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ChipLook = {
  name: string;
  clock: string | null;
  mode: string;
  indicator: 'idle' | 'focus' | 'overtime' | 'paused' | 'break';
};

function lookOf(study: StudyView): ChipLook {
  const { timer, remainingMs, overtimeMs, inOvertime } = study;
  if (timer.phase === 'idle') {
    return { name: 'Modo estudio: estudiar', clock: null, mode: 'Estudiar', indicator: 'idle' };
  }
  if (timer.phase === 'break') {
    return {
      name: `Modo estudio: descanso, quedan ${spokenDuration(remainingMs)}`,
      clock: formatClock(remainingMs),
      mode: 'Descanso',
      indicator: 'break',
    };
  }
  const paused = timer.runningSince === null;
  if (inOvertime) {
    return {
      name: `Modo estudio: ${paused ? 'en pausa, ' : ''}foco cumplido, tiempo extra ${spokenDuration(overtimeMs, true)}`,
      clock: formatOvertime(overtimeMs),
      mode: paused ? 'Pausa' : 'Extra',
      indicator: paused ? 'paused' : 'overtime',
    };
  }
  return {
    name: `Modo estudio: ${paused ? 'en pausa' : 'foco'}, quedan ${spokenDuration(remainingMs)}`,
    clock: formatClock(remainingMs),
    mode: paused ? 'Pausa' : 'Foco',
    indicator: paused ? 'paused' : 'focus',
  };
}

const BORDER: Record<ChipLook['indicator'], string> = {
  idle: IDLE_BORDER,
  focus: GRADIENT_BORDER,
  overtime: GRADIENT_BORDER,
  paused: PAUSED_BORDER,
  break: BREAK_BORDER,
};

const CLOCK_TONE: Record<ChipLook['indicator'], string> = {
  idle: 'text-zinc-400',
  focus: 'text-[#efefef]',
  overtime: 'text-[#f6e05e]',
  paused: 'text-zinc-400',
  break: 'text-[#38b2ac]',
};

function Indicator({ indicator }: { indicator: ChipLook['indicator'] }) {
  if (indicator === 'idle') return <Timer size={16} aria-hidden='true' className='text-zinc-400' />;
  if (indicator === 'paused')
    return <Pause size={14} aria-hidden='true' className='text-zinc-400' />;
  const dot =
    indicator === 'focus'
      ? GRADIENT_FILL
      : indicator === 'overtime'
        ? 'bg-[#f6e05e]'
        : 'bg-[#38b2ac]';
  return (
    <>
      <Timer size={16} aria-hidden='true' className='text-zinc-300 sm:hidden' />
      <span aria-hidden='true' className={cn('hidden size-1.5 rounded-full sm:block', dot)} />
    </>
  );
}

/** The one clock per page lives in the header chip, present on every page (AD-8). */
function HeaderEngine({ store }: { store: StudyStore }) {
  useStudyEngine(store);
  useStudyAlerts(store);
  return null;
}

export default function StudyChip({ placement, store = studyStore }: Props) {
  const study = useStudy(store);
  const desktop = useMediaQuery('(min-width: 640px)', true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = `study-panel-${placement}`;
  // With the viewer open, the header chip is covered and keeps its panel closed (FR-4).
  const suppressed = placement === 'header' && study.viewerOpen;
  const open = study.openPanel === placement && !suppressed;
  const look = lookOf(study);
  const [view, setView] = useState<'timer' | 'settings'>('timer');
  // The chip shows the toast only while it is the visible one.
  const completion = suppressed ? null : study.completion;

  // Every opening starts on the timer view.
  useEffect(() => {
    if (!open) setView('timer');
  }, [open]);

  const toggle = () => {
    const opening = !open;
    if (opening && study.timer.phase === 'idle') {
      // On a subject page, that subject becomes the active one (FR-1). A focus in
      // progress keeps its own subject.
      const context = readPageContext();
      const subject = context && resolveContextSubject(context, study.lastCareer);
      const current = study.timer.subject;
      if (
        subject &&
        (current?.subjectId !== subject.subjectId || current?.careerId !== subject.careerId)
      ) {
        store.setSubject(subject);
      }
    }
    store.setPanelOpen(placement, opening);
  };

  const close = (returnFocus: boolean) => {
    store.setPanelOpen(placement, false);
    if (returnFocus) chipRef.current?.focus();
  };

  // Focus the first control on open. The panel never opens on page load.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      // Comboboxes inside the panel portal their list to <body>.
      if (target.closest('[data-radix-popper-content-wrapper]')) return;
      store.setPanelOpen(placement, false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, placement, store]);

  // A native listener on the panel itself: Escape inside a portaled combobox
  // lives outside this subtree, so it closes the combobox, not the panel. It
  // also stops the event so the resource viewer does not close with it.
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        store.setPanelOpen(placement, false);
        chipRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || desktop) return;
      // Mobile sheet is modal: keep focus inside it.
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener('keydown', onKeyDown);
    return () => panel.removeEventListener('keydown', onKeyDown);
  }, [open, desktop, placement, store]);

  const toast = completion && (
    <StudyToast completion={completion} onDismiss={store.dismissCompletion} />
  );

  const panelBody =
    view === 'settings' ? (
      <StudySettings settings={study.settings} store={store} onBack={() => setView('timer')} />
    ) : (
      <StudyPanel
        study={study}
        store={store}
        id={`${panelId}-content`}
        onClose={() => close(false)}
        footerExtra={
          <button
            type='button'
            onClick={() => setView('settings')}
            aria-label='Configuración'
            className={cn(
              'flex size-11 cursor-pointer items-center justify-center rounded-[10px] text-zinc-400 hover:bg-white/5 hover:text-white',
              FOCUS_RING,
            )}
          >
            <Settings size={18} aria-hidden='true' />
          </button>
        }
      />
    );

  let panel: ReactNode = null;
  if (open && desktop) {
    panel = (
      <div
        ref={panelRef}
        id={panelId}
        role='dialog'
        aria-label='Modo estudio'
        className={cn(
          'absolute top-full right-0 mt-2 w-[340px] rounded-2xl p-4 text-left text-foreground shadow-2xl shadow-black/50',
          LAYER_SHEET,
          PANEL_GRADIENT_BORDER,
        )}
      >
        {toast && <div className='mb-3'>{toast}</div>}
        {panelBody}
      </div>
    );
  } else if (open) {
    panel = createPortal(
      <div className={cn('fixed inset-0 flex items-end', LAYER_SHEET)}>
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-black/50'
          onClick={() => close(true)}
        />
        <div
          ref={panelRef}
          id={panelId}
          role='dialog'
          aria-modal='true'
          aria-label='Modo estudio'
          className={cn(
            'relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl px-4 pt-3 pb-6 text-foreground shadow-2xl shadow-black/50',
            PANEL_GRADIENT_BORDER,
          )}
        >
          <div aria-hidden='true' className='mx-auto mb-3 h-1 w-8 rounded-full bg-white/20' />
          {toast && <div className='mb-3'>{toast}</div>}
          {panelBody}
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div ref={wrapperRef} className='relative'>
      {placement === 'header' && <HeaderEngine store={store} />}
      <button
        ref={chipRef}
        type='button'
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={look.name}
        className={cn(
          // 36 px visual height with a 44 px touch area.
          "relative flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-white transition-colors before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] hover:brightness-125",
          look.clock ? 'min-w-[88px] sm:min-w-[132px]' : 'min-w-9 sm:min-w-[108px]',
          BORDER[look.indicator],
          FOCUS_RING,
        )}
      >
        <Indicator indicator={look.indicator} />
        {look.clock && (
          <span aria-hidden='true' className={cn('tabular-nums', CLOCK_TONE[look.indicator])}>
            {look.clock}
          </span>
        )}
        <span aria-hidden='true' className='hidden text-zinc-300 sm:inline'>
          {look.mode}
        </span>
      </button>
      {panel}
      {!open && toast && (
        <div
          className={cn(
            'absolute top-full right-0 mt-2 w-[min(340px,calc(100vw-2rem))]',
            LAYER_SHEET,
          )}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
