import React from 'react';

// Componente de loading para una sola card
const CardResourceLoading = () => {
  return (
    <div className='flex flex-col bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-zinc-800/60 rounded-xl overflow-hidden animate-pulse relative'>
      {/* Header de la card */}
      <div className='p-6 pb-4'>
        <div className='flex justify-between flex-col-reverse sm:flex-row'>
          {/* Título skeleton */}
          <div className='h-7 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-lg w-48 mb-2 sm:mb-0 shimmer'></div>

          <div className='flex justify-between items-start mb-4'>
            <div className='flex gap-2'>
              {/* Tags skeleton */}
              <div className='h-8 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-full w-20 shimmer'></div>
              <div className='h-8 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-full w-12 shimmer'></div>
            </div>

            {/* Badge "Más reciente" skeleton (solo móvil) */}
            <div className='sm:hidden h-6 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-full w-24 shimmer'></div>
          </div>
        </div>
      </div>

      {/* Botones de acción skeleton */}
      <div className='px-6 pb-6'>
        <div className='flex gap-2 justify-between items-end flex-col sm:flex-row'>
          <div className='flex gap-3 items-center flex-col sm:flex-row w-full sm:w-min'>
            {/* Botón de descarga skeleton */}
            <div className='w-full sm:w-max h-12 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-xl shimmer flex items-center justify-center gap-2 px-6'>
              {/* Icono skeleton */}
              <div className='w-5 h-5 bg-zinc-600 rounded-xl animate-pulse'></div>
              {/* Texto skeleton */}
              <div className='w-20 h-4 bg-zinc-600 rounded-xl animate-pulse'></div>
            </div>

            {/* Botón de vista previa skeleton */}
            <div className='w-full sm:w-max h-12 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-xl border border-zinc-700 shimmer flex items-center justify-center gap-2 px-6'>
              {/* Icono skeleton */}
              <div className='w-5 h-5 bg-zinc-600 rounded-full animate-pulse'></div>
              {/* Texto skeleton */}
              <div className='w-24 h-4 bg-zinc-600 rounded-full animate-pulse'></div>
            </div>
          </div>

          {/* Badge "Más reciente" skeleton (solo desktop) */}
          <div className='hidden sm:flex h-8 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-full w-28 shimmer'></div>
        </div>
      </div>
    </div>
  );
};

export default CardResourceLoading;
