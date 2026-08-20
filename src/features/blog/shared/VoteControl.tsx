import IconArrowUp from '@/shared/components/icons/react/IconArrowUp';
import IconArrowDown from '@/shared/components/icons/react/IconArrowDown';
import RollingNumber from './RollingNumber';

interface Props {
  netScore: number;
  myVote: number;
  canVote: boolean;
  onVote: (value: 1 | -1) => void;
}

export default function VoteControl({ netScore, myVote, canVote, onVote }: Props) {
  const disabledClass = 'text-zinc-700 opacity-40 cursor-not-allowed';
  const scoreClass = canVote ? 'text-zinc-300' : 'text-zinc-600';

  return (
    <div className='flex flex-col items-center gap-1 self-start'>
      <button
        type='button'
        aria-label='Votar a favor'
        disabled={!canVote}
        onClick={(e) => {
          e.stopPropagation();
          onVote(1);
        }}
        className={`rounded p-1 transition-colors ${
          !canVote
            ? disabledClass
            : myVote === 1
              ? 'text-green-500'
              : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <IconArrowUp size={20} />
      </button>
      <RollingNumber value={netScore} className={`text-sm font-semibold ${scoreClass}`} />
      <button
        type='button'
        aria-label='Votar en contra'
        disabled={!canVote}
        onClick={(e) => {
          e.stopPropagation();
          onVote(-1);
        }}
        className={`rounded p-1 transition-colors ${
          !canVote
            ? disabledClass
            : myVote === -1
              ? 'text-red-500'
              : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <IconArrowDown size={20} />
      </button>
    </div>
  );
}
