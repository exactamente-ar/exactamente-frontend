import IconOpenBook from '@/shared/components/icons/react/IconOpenBook';
import IconUniversity from '@/shared/components/icons/react/IconUniversity';
import IconDownload from '@/shared/components/icons/react/IconDownload';
import IconDocument from '@/shared/components/icons/react/IconDocument';
import IconLink from '@/shared/components/icons/react/IconLink';
import IconMoodle from '@/shared/components/icons/react/IconMoodle';
import ContainerLink from '@/shared/components/ContainerLink.tsx';

type Props = {
  id: string;
  title: string;
  url: string;
  quadmester: number;
  year: number;
};

export default function Card({ id, title, url, quadmester, year }: Props) {
  const urlPrograma = '';
  const urlMoodle = '';
  return (
    <article className='group rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-border/60 overflow-hidden hover:border-zinc-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 flex flex-col '>
      {/* Header */}
      <div className='relative flex-1 flex flex-col bg-gradient-to-br from-zinc-800/40 to-zinc-900/60 px-6 py-8 border-b border-zinc-800/50 flex-grow'>
        {/* Added flex-grow here */}
        <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/5 to-transparent rounded-full blur-3xl' />
        <div className='relative z-10'>
          <h2 className='text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-yellow-100 transition-colors'>
            {title}
          </h2>
          <h3 className='text-zinc-400 font-medium text-lg'>Ingeniería en Sistemas</h3>
        </div>
      </div>
      {/* Content */}
      <div className='flex flex-col items-start gap-6 p-6 flex-shrink-0'>
        {' '}
        {/* Added flex-shrink-0 here */}
        {/* Info row */}
        <div className='flex w-full justify-between items-center flex-wrap gap-3'>
          <div className='text-zinc-400 flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-700/50'>
            <svg className='h-4 w-4 text-yellow-400' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18m11-9c0 6.075-4.925 11-11 11S1 18.075 1 12S5.925 1 12 1s11 4.925 11 11m-8 4.414l-4-4V5.5h2v6.086L16.414 15z'
              />
            </svg>
            <span className='text-zinc-200 font-medium'>{quadmester}º Cuatrimestre</span>
          </div>

          <div className='bg-gradient-to-r from-yellow-500/15 to-yellow-600/15 border border-yellow-500/30 text-yellow-200 font-semibold px-4 py-2 rounded-full'>
            {year}º año
          </div>
        </div>
        {/* Recursos */}
        <div className='w-full'>
          <h4 className='font-bold text-white text-lg mb-4 flex items-center gap-2'>
            <div className='w-2 h-2 bg-yellow-400 rounded-full' />
            Recursos disponibles:
          </h4>

          <div className='flx flex-col space-y-3 w-full'>
            <ContainerLink
              url={`.${url}/resumenes`}
              className='group/resource hover:scale-105 justify-between active:scale-95 grayscale-50 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 hover:text-emerald-100 font-semibold flex items-center gap-3 transition-all duration-200'
            >
              <div className='flex items-center gap-2'>
                <IconOpenBook size={20} className='fill-emerald-200' />
                <span> Resumenes </span>
              </div>
              <IconLink size={20} />
            </ContainerLink>

            <ContainerLink
              url={`.${url}/parciales`}
              className='group/resource hover:scale-105 justify-between active:scale-95 grayscale-50 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/40 hover:border-blue-400/60 text-blue-200 hover:text-blue-100 font-semibold flex items-center gap-3 transition-all duration-200'
            >
              <div className='flex items-center gap-2'>
                <IconDocument size={20} className='fill-blue-200' />
                <span> Parciales </span>
              </div>
              <IconLink size={20} />
            </ContainerLink>

            <ContainerLink
              url={`.${url}/finales`}
              className='group/resource hover:scale-105 justify-between active:scale-95 grayscale-50 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/40 hover:border-purple-400/60 text-purple-200 hover:text-purple-100 font-semibold flex items-center gap-3 transition-all duration-200'
            >
              <div className='flex items-center gap-2'>
                <IconUniversity size={20} className='fill-purple-200' />
                <span> Finales </span>
              </div>
              <IconLink size={20} />
            </ContainerLink>

            <ContainerLink
              url={urlMoodle}
              target='_blank'
              className={`${
                urlMoodle.length == 0
                  ? 'pointer-events-none grayscale-100 border-foreground-muted text-foreground-muted'
                  : 'border-foreground text-foreground'
              }  border  font-bold flex justify-between items-center`}
            >
              <div className='flex items-center gap-2'>
                <IconMoodle
                  size={20}
                  className={`${
                    urlPrograma.length == 0 ? 'fill-foreground-muted' : 'fill-foreground'
                  }`}
                />
                <span> Moodle </span>
              </div>
              <IconLink size={20} />
            </ContainerLink>

            <ContainerLink
              url={urlPrograma}
              target='_blank'
              className={`font-bold flex justify-between items-center border ${
                urlPrograma.length == 0
                  ? 'bg-gray-800 text-foreground-muted pointer-events-none grayscale-100 border-foreground-muted'
                  : ' border-primary bg-primary '
              }`}
            >
              <div className='flex items-center gap-2'>
                <IconDownload
                  size={20}
                  className={`${
                    urlPrograma.length == 0 ? 'fill-foreground-muted' : 'fill-primary-foreground'
                  }`}
                />
                <span> Programa </span>
              </div>
              <IconLink size={20} />
            </ContainerLink>
          </div>
        </div>
      </div>
    </article>
  );
}
