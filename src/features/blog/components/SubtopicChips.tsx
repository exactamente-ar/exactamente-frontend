import { ALL_SUBTOPICS_ID } from '../utils/feed';
import type { BlogSubtopic } from '../types/blog';

interface Props {
  subtopics: BlogSubtopic[];
  selected: string;
  onChange: (id: string) => void;
}

export default function SubtopicChips({ subtopics, selected, onChange }: Props) {
  const chips = [{ id: ALL_SUBTOPICS_ID, name: 'General' }, ...subtopics];

  return (
    <div className='flex flex-wrap gap-1.5' role='group' aria-label='Subtema del blog'>
      {chips.map((chip) => {
        const active = selected === chip.id;
        return (
          <button
            key={chip.id}
            type='button'
            onClick={() => onChange(chip.id)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
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
  );
}
