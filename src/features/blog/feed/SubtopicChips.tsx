import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BlogSubtopic } from '../types/blog';

interface Props {
  subtopics: BlogSubtopic[];
  selected: string;
  onChange: (id: string) => void;
}

export default function SubtopicChips({ subtopics, selected, onChange }: Props) {
  const orderedSubtopics = [...subtopics].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateOverflow = () => {
      const remaining = element.scrollWidth - element.clientWidth - element.scrollLeft;
      setCanScrollLeft(element.scrollLeft > 1);
      setCanScrollRight(element.scrollWidth > element.clientWidth && remaining > 1);
    };

    updateOverflow();
    element.addEventListener('scroll', updateOverflow, { passive: true });
    window.addEventListener('resize', updateOverflow);

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateOverflow) : null;
    observer?.observe(element);

    return () => {
      element.removeEventListener('scroll', updateOverflow);
      window.removeEventListener('resize', updateOverflow);
      observer?.disconnect();
    };
  }, [subtopics]);

  function scrollByPage(direction: -1 | 1) {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction * Math.max(element.clientWidth * 0.75, 120),
      behavior: 'smooth',
    });
  }

  return (
    <div className='relative min-w-0'>
      <div
        ref={scrollRef}
        className='flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        onScroll={() => {
          const element = scrollRef.current;
          if (!element) return;
          setCanScrollLeft(element.scrollLeft > 1);
          setCanScrollRight(element.scrollWidth - element.clientWidth - element.scrollLeft > 1);
        }}
        role='group'
        aria-label='Subtema del blog'
      >
        {orderedSubtopics.map((chip) => {
          const active = selected === chip.id;
          return (
            <button
              key={chip.id}
              type='button'
              onClick={() => onChange(chip.id)}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-zinc-500/20 text-zinc-200'
                  : 'border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              {chip.name}
            </button>
          );
        })}
      </div>

      {canScrollLeft && (
        <button
          type='button'
          onClick={() => scrollByPage(-1)}
          aria-label='Ver subtemas anteriores'
          className='absolute left-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/95 text-zinc-300 shadow-lg transition-colors hover:bg-zinc-800 hover:text-white'
        >
          <ChevronLeft size={16} aria-hidden='true' />
        </button>
      )}

      {canScrollRight && (
        <button
          type='button'
          onClick={() => scrollByPage(1)}
          aria-label='Ver más subtemas'
          className='absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/95 text-zinc-300 shadow-lg transition-colors hover:bg-zinc-800 hover:text-white'
        >
          <ChevronRight size={16} aria-hidden='true' />
        </button>
      )}
    </div>
  );
}
