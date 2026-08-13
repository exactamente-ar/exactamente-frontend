interface Props {
  netScore: number;
  myVote: number;
  canVote: boolean;
  onVote: (value: 1 | -1) => void;
}

export default function VoteControl({ netScore, myVote, canVote, onVote }: Props) {
  return (
    <div className='flex flex-col items-center gap-1 self-start'>
      {canVote && (
        <button
          type='button'
          aria-label='Votar a favor'
          onClick={() => onVote(1)}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            myVote === 1 ? 'text-yellow-300' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          ▲
        </button>
      )}
      <span className='text-sm font-semibold text-zinc-300'>{netScore}</span>
      {canVote && (
        <button
          type='button'
          aria-label='Votar en contra'
          onClick={() => onVote(-1)}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            myVote === -1 ? 'text-yellow-300' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          ▼
        </button>
      )}
    </div>
  );
}
