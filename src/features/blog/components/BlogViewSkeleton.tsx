function PostCardSkeleton() {
  return (
    <li className='flex flex-col rounded-2xl p-4'>
      <div className='flex gap-2'>
        <div className='flex w-8 shrink-0 flex-col items-center'>
          <div className='h-16 w-8 rounded-lg bg-gradient-to-b from-zinc-800 via-zinc-700 to-zinc-800 shimmer' />
        </div>
        <div className='flex min-w-0 flex-1 flex-col gap-2 mt-1.5'>
          <div className='flex items-baseline justify-between gap-2'>
            <div className='h-3 w-24 rounded bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 shimmer' />
            <div className='h-3 w-16 rounded bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 shimmer' />
          </div>
          <div className='h-4 w-full rounded bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 shimmer' />
          <div className='h-4 w-3/4 rounded bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 shimmer' />
        </div>
      </div>
    </li>
  );
}

export default function BlogViewSkeleton() {
  return (
    <div
      role='status'
      aria-label='Cargando publicaciones'
      className='mt-6 relative flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-800/50 overflow-hidden'
    >
      <div className='absolute inset-0 bg-zinc-950/80 pointer-events-none' />

      <div className='relative z-10 flex min-h-0 flex-1 flex-col md:pb-3'>
        <header className='md:px-4 md:py-6 w-full bg-black/10 rounded-2xl border-b-1 border-b-gray-700'>
          <div className='h-9 w-48 rounded-lg bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 shimmer md:m-1' />
          <div className='flex flex-wrap gap-1.5 md:mt-4'>
            {['w-20', 'w-28', 'w-24', 'w-16'].map((width, i) => (
              <div
                key={i}
                className={`h-8 ${width} rounded-full bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 shimmer`}
              />
            ))}
          </div>
        </header>

        <div className='relative flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1 overflow-y-auto pb-18'>
            <ul className='flex flex-col gap-4'>
              {[0, 1, 2].map((i) => (
                <PostCardSkeleton key={i} />
              ))}
            </ul>
          </div>

          <div className='shrink-0 border-t border-zinc-800 pt-3 mx-3'>
            <div className='h-12 rounded-xl bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 shimmer' />
          </div>
        </div>
      </div>
    </div>
  );
}
