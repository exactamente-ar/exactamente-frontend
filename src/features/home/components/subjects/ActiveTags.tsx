import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { DraftFilters, FilterOptions } from '@/features/home/types/filter';
import { Badge } from '@/shared/components/ui/badge';

interface ActiveTagsProps {
  displayedFilters: DraftFilters;
  options: FilterOptions;
  onRemove: (key: keyof DraftFilters) => void;
  onClearAll: () => void;
}

type Tag = { key: keyof DraftFilters; label: string };

function buildTags(filters: DraftFilters, options: FilterOptions): Tag[] {
  const tags: Tag[] = [];

  if (filters.universityId) {
    const label = options.universities.find((u) => u.id === filters.universityId)?.label;
    if (label) tags.push({ key: 'universityId', label });
  }
  if (filters.facultyId) {
    const label = options.faculties.find((f) => f.id === filters.facultyId)?.label;
    if (label) tags.push({ key: 'facultyId', label });
  }
  if (filters.careerId) {
    const label = options.careers.find((c) => c.id === filters.careerId)?.label;
    if (label) tags.push({ key: 'careerId', label });
  }
  if (filters.planId) {
    const label = options.plans.find((p) => p.id === filters.planId)?.label;
    if (label) tags.push({ key: 'planId', label });
  }
  if (filters.year !== 0) {
    tags.push({ key: 'year', label: `${filters.year}º año` });
  }
  if (filters.quadmester !== 0) {
    tags.push({ key: 'quadmester', label: `${filters.quadmester}º cuatrimestre` });
  }

  return tags;
}

const ActiveTags: React.FC<ActiveTagsProps> = ({
  displayedFilters,
  options,
  onRemove,
  onClearAll,
}) => {
  const tags = useMemo(() => buildTags(displayedFilters, options), [displayedFilters, options]);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflowCount, setOverflowCount] = useState(0);

  // Detect overflow on desktop (max 2 rows via offsetTop)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || expanded) {
      setOverflowCount(0);
      return;
    }
    const check = () => {
      const containerRect = container.getBoundingClientRect();
      const maxBottom = containerRect.top + 72; // 2 rows × ~32px + gap
      const allChildren = Array.from(container.children) as HTMLElement[];
      // Only count actual tag chips (exclude the "+N más" and ClearAll buttons)
      const tagChildren = allChildren.slice(0, tags.length);
      const hidden = tagChildren.filter(
        (el) => el.getBoundingClientRect().bottom > maxBottom
      );
      setOverflowCount(hidden.length);
    };
    const observer = new ResizeObserver(check);
    observer.observe(container);
    check();
    return () => observer.disconnect();
  }, [tags.length, expanded]);

  useEffect(() => {
    if (tags.length === 0) setExpanded(false);
  }, [tags.length]);

  if (tags.length === 0) return null;

  return (
    <div className='mt-3 flex flex-col gap-2'>
      {/* Mobile: scroll horizontal */}
      <div className='flex lg:hidden items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap'>
        {tags.map((tag) => (
          <TagChip key={tag.key} label={tag.label} onRemove={() => onRemove(tag.key)} />
        ))}
        <ClearAllButton onClick={onClearAll} />
      </div>

      {/* Desktop: flex wrap con colapso */}
      <div className='hidden lg:flex flex-col gap-2'>
        {/* Tags container — siempre renderiza todos los chips para que el slice DOM sea correcto */}
        <div
          ref={containerRef}
          className='flex flex-wrap gap-2'
          style={!expanded && overflowCount > 0 ? { maxHeight: '72px', overflow: 'hidden' } : undefined}
        >
          {tags.map((tag) => (
            <TagChip key={tag.key} label={tag.label} onRemove={() => onRemove(tag.key)} />
          ))}
        </div>

        {/* Controles fuera del contenedor con overflow para que siempre sean visibles */}
        <div className='flex items-center gap-2'>
          {!expanded && overflowCount > 0 && (
            <button
              type='button'
              onClick={() => setExpanded(true)}
              className='text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-full border border-zinc-700 hover:border-zinc-500 transition-colors whitespace-nowrap'
            >
              +{overflowCount} más
            </button>
          )}
          <ClearAllButton onClick={onClearAll} />
        </div>
      </div>
    </div>
  );
};

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge className='flex items-center gap-1 pl-3 pr-1.5 py-1 text-sm bg-zinc-700/60 border border-zinc-600 rounded-full text-zinc-200 whitespace-nowrap hover:bg-zinc-700/60'>
      {label}
      <button
        type='button'
        onClick={onRemove}
        aria-label={`Eliminar filtro ${label}`}
        className='ml-0.5 flex items-center justify-center w-4 h-4 rounded-full hover:bg-zinc-500 transition-colors'
      >
        <svg width='10' height='10' viewBox='0 0 24 24' fill='none'>
          <path
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            d='M6 6l12 12M18 6L6 18'
          />
        </svg>
      </button>
    </Badge>
  );
}

function ClearAllButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='text-xs text-zinc-400 hover:text-red-400 transition-colors whitespace-nowrap underline underline-offset-2'
    >
      Limpiar todo
    </button>
  );
}

export default ActiveTags;
