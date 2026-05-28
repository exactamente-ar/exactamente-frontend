import { Skeleton } from '@/shared/components/ui/skeleton';

const CardResourceLoading = () => {
  return (
    <div className='flex flex-col bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-zinc-800/60 rounded-xl overflow-hidden relative'>
      <div className='p-6 pb-4'>
        <div className='flex justify-between flex-col-reverse sm:flex-row'>
          <Skeleton className='h-7 w-48 rounded-lg mb-2 sm:mb-0' />
          <div className='flex justify-between items-start mb-4'>
            <div className='flex gap-2'>
              <Skeleton className='h-8 w-20 rounded-full' />
              <Skeleton className='h-8 w-12 rounded-full' />
            </div>
            <Skeleton className='sm:hidden h-6 w-24 rounded-full' />
          </div>
        </div>
      </div>
      <div className='px-6 pb-6'>
        <div className='flex gap-2 justify-between items-end flex-col sm:flex-row'>
          <div className='flex gap-3 items-center flex-col sm:flex-row w-full sm:w-min'>
            <Skeleton className='w-full sm:w-36 h-12 rounded-xl' />
            <Skeleton className='w-full sm:w-40 h-12 rounded-xl' />
          </div>
          <Skeleton className='hidden sm:flex h-8 w-28 rounded-full' />
        </div>
      </div>
    </div>
  );
};

export default CardResourceLoading;
