import ContainerLink from '@/shared/components/ContainerLink.tsx';

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

/**
 * Estado vacío reutilizable. El CTA es opcional: solo se renderiza cuando se
 * pasan `actionLabel` y `actionHref` juntos.
 */
export default function EmptyState({ title, description, actionLabel, actionHref }: Props) {
  return (
    <div className='flex flex-col items-center justify-center gap-4 rounded-xl  px-8 py-16 text-center'>
      <h3 className='text-xl font-semibold text-zinc-200'>{title}</h3>
      {description && <p className='max-w-md text-sm text-zinc-400'>{description}</p>}
      {actionLabel && actionHref && (
        <ContainerLink
          url={actionHref}
          className='mt-2 border border-yellow-500/40 font-semibold text-yellow-200'
        >
          {actionLabel}
        </ContainerLink>
      )}
    </div>
  );
}
