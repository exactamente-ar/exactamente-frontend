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
        className={`rounded px-2 py-1 text-sm transition-colors ${
          !canVote
            ? disabledClass
            : myVote === 1
              ? 'text-yellow-300'
              : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        ▲
      </button>
      <span className={`text-sm font-semibold ${scoreClass}`}>{netScore}</span>
      <button
        type='button'
        aria-label='Votar en contra'
        disabled={!canVote}
        onClick={(e) => {
          e.stopPropagation();
          onVote(-1);
        }}
        className={`rounded px-2 py-1 text-sm transition-colors ${
          !canVote
            ? disabledClass
            : myVote === -1
              ? 'text-yellow-300'
              : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        ▼
      </button>
    </div>
  );
}
