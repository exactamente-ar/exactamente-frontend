import React from 'react';

interface SubjectCardSkeletonProps {
  className?: string;
}

const SubjectCardSkeleton: React.FC<SubjectCardSkeletonProps> = ({ className = '' }) => {
  return (
    <>
      <div
        className={`group bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl relative animate-pulse ${className}`}
      >
        {/* Header Section */}
        <div className='relative flex-1 flex flex-col bg-gradient-to-br from-zinc-800/40 to-zinc-900/60 px-6 py-8 border-b border-zinc-800/50 flex-grow'>
          <div className='relative z-10'>
            {/* Subject title skeleton */}
            <div className='h-8 md:h-9 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-lg mb-3 w-3/4 shimmer'></div>

            {/* Career skeleton */}
            <div className='h-6 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-lg w-1/2 shimmer'></div>
          </div>
        </div>

        {/* Content Section */}
        <div className='flex flex-col items-start gap-6 p-6 flex-shrink-0'>
          {/* Semester and Year Info */}
          <div className='flex w-full justify-between items-center'>
            {/* Semester info skeleton */}
            <div className='flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-700/50'>
              <div className='h-4 w-4 bg-zinc-600 rounded animate-pulse'></div>
              <div className='h-4 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded w-24 shimmer'></div>
            </div>

            {/* Year badge skeleton */}
            <div className='h-8 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-full w-16 shimmer'></div>
          </div>

          {/* Resources Section */}
          <div className='w-full'>
            {/* Resources title skeleton */}
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-2 h-2 bg-zinc-600 rounded-full animate-pulse'></div>
              <div className='h-5 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded w-40 shimmer'></div>
            </div>

            {/* Resources list skeleton */}
            <div className='flex flex-col space-y-3 w-full'>
              {[
                { width: 'w-20', delay: '0s' },
                { width: 'w-16', delay: '0.1s' },
                { width: 'w-14', delay: '0.2s' },
                { width: 'w-18', delay: '0.3s' },
                { width: 'w-22', delay: '0.4s' },
              ].map((item, index) => (
                <div
                  key={index}
                  className='rounded-xl px-5 py-3 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 flex items-center justify-between shimmer'
                  style={{ animationDelay: item.delay }}
                >
                  <div className='flex items-center gap-3'>
                    {/* Icon skeleton */}
                    <div className='w-5 h-5 bg-zinc-600 rounded animate-pulse'></div>
                    {/* Text skeleton */}
                    <div
                      className={`h-4 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 rounded shimmer ${item.width}`}
                    ></div>
                  </div>

                  {/* Arrow icon skeleton */}
                  <div className='w-5 h-5 bg-zinc-600 rounded animate-pulse'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubjectCardSkeleton;
