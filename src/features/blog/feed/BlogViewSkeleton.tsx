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
      style={{
        backgroundImage: 'url("/images/materia-2.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'right',
      }}
    >
      {/* Fondo oscuro sobre la imagen */}
      <div className='absolute inset-0 bg-zinc-950/80 pointer-events-none' />

      {/* Borde giratorio con los mismos colores */}
      <div
        className='absolute inset-0 pointer-events-none rounded-2xl overflow-hidden z-0'
        style={{
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <div className='absolute left-1/2 top-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(#6b46c1,#b83280,#f6e05e,#38b2ac,#6b46c1)] opacity-40 animate-[spin_6s_linear_infinite]' />
      </div>

      {/* Inicio del contenido skeleton del blog */}
      <div className='relative z-10 flex min-h-0 flex-1 flex-col'>
        {/* Header fijo arriba con efecto Liquid Glass y borde inferior idéntico al real */}
        <header className='shrink-0 px-4 py-5 w-full rounded-b-2xl border-b border-white/20 bg-white/[0.02] backdrop-saturate-[120%] backdrop-brightness-[110%] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md'>
          {/* Brillo especular superior */}
          <div
            className='absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.10] to-transparent pointer-events-none rounded-t-2xl'
            aria-hidden='true'
          />

          <div className='relative z-10 h-9 w-48 rounded-lg bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 shimmer m-1' />

          <div className='relative z-10 flex flex-wrap gap-1.5 mt-4'>
            {['w-20', 'w-28', 'w-24', 'w-16'].map((width, i) => (
              <div
                key={i}
                className={`h-8 ${width} rounded-full border border-white/10 bg-white/5 backdrop-saturate-150 backdrop-brightness-110 shimmer`}
              />
            ))}
          </div>
        </header>

        {/* Scroll solo en el área de posts */}
        <div className='custom-scrollbar relative min-h-0 flex-1 overflow-y-auto p-4 pb-18'>
          <ul className='flex flex-col gap-4'>
            {[0, 1, 2].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </ul>
        </div>

        <div className='shrink-0 border-t border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl pt-3 pb-3 px-3'>
          <div className='h-12 rounded-xl bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 shimmer' />
        </div>
      </div>
    </div>
  );
}
