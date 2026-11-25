import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { StudyCompletion } from '@/features/study/store/studyStore';
import { FOCUS_RING, TOAST_GRADIENT_BORDER } from '@/features/study/constants/styles';
import { toastMessage } from '@/features/study/utils/alerts';

const VISIBLE_MS = 6000;

type Props = { completion: StudyCompletion; onDismiss: () => void; className?: string };

/** Confirmation under the visible chip. Pauses while hovered or focused (UX-DR4). */
export default function StudyToast({ completion, onDismiss, className }: Props) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const held = hovered || focused;

  useEffect(() => {
    if (held) return;
    const id = window.setTimeout(onDismiss, VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [completion, onDismiss, held]);

  const { title, detail } = toastMessage(completion);
  const recorded = completion.kind === 'recorded';

  return (
    <div
      role='status'
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className={cn(
        'flex items-start gap-3 rounded-2xl px-4 py-3 text-left shadow-2xl shadow-black/50',
        TOAST_GRADIENT_BORDER,
        className,
      )}
    >
      {recorded && (
        <span
          aria-hidden='true'
          className='mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10'
        >
          <Check size={14} className='text-white' strokeWidth={2.5} />
        </span>
      )}
      <span className='flex min-w-0 flex-1 flex-col gap-1 text-sm leading-snug'>
        <span className='font-medium text-white'>{title}</span>
        {detail && <span className='text-xs text-zinc-400'>{detail}</span>}
        {recorded && (
          <a
            href='/estudio'
            className={cn(
              'self-start text-xs font-semibold text-zinc-200 underline underline-offset-2',
              FOCUS_RING,
            )}
          >
            Ver
          </a>
        )}
      </span>
      <button
        type='button'
        onClick={onDismiss}
        aria-label='Cerrar'
        className={cn(
          'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white',
          FOCUS_RING,
        )}
      >
        <X size={14} aria-hidden='true' />
      </button>
    </div>
  );
}
