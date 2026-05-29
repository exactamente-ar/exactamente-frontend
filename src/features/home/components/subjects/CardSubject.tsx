import { memo } from 'react';
import IconOpenBook from '@/shared/components/icons/react/IconOpenBook';
import IconUniversity from '@/shared/components/icons/react/IconUniversity';
import IconDocument from '@/shared/components/icons/react/IconDocument';
import IconLink from '@/shared/components/icons/react/IconLink';
import ContainerLink from '@/shared/components/ContainerLink.tsx';
import type { SubjectCareer, ResourceCounts } from '@/features/home/types/subjects';

type Props = {
  id: string;
  title: string;
  shortName: string;
  url: string;
  quadmester: number;
  year: number;
  careers: SubjectCareer[];
  activeCareerId: string;
  resourceCounts: ResourceCounts;
};

type ResourceButtonProps = {
  resourceUrl: string;
  uploadUrl: string;
  count: number;
  label: string;
  Icon: React.ComponentType<{ size: number; className?: string }>;
  activeClass: string;
  activeIconClass: string;
};

function ResourceButton({ resourceUrl, uploadUrl, count, label, Icon, activeClass, activeIconClass }: ResourceButtonProps) {
  const isEmpty = count === 0;
  return (
    <ContainerLink
      url={isEmpty ? uploadUrl : resourceUrl}
      className={`group/resource hover:scale-105 justify-between active:scale-95 font-semibold flex items-center gap-3 transition-all duration-200 ${
        isEmpty
          ? 'bg-gradient-to-br from-zinc-800/30 to-zinc-900/20 border border-zinc-700/30 hover:border-zinc-600/50 text-zinc-500 hover:text-zinc-400'
          : `grayscale-50 ${activeClass}`
      }`}
    >
      <div className='flex items-center gap-2'>
        <Icon size={20} className={isEmpty ? 'fill-zinc-600' : activeIconClass} />
        <span>{label}</span>
      </div>
      <div className='flex items-center gap-1.5'>
        <span className='text-xs opacity-60'>{count}</span>
        <IconLink size={20} />
      </div>
    </ContainerLink>
  );
}

function formatPlanId (planId: string): string {
  const year = planId.match(/\d+$/)?.[0];
  return year ? `Plan ${year}` : planId;
}

const STOPWORDS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'en', 'y', 'e', 'o', 'u', 'a', 'por', 'con']);

function abbreviateUniversity (name: string): string {
  if (name.length <= 12) return name;
  const initials = name
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join('');
  return initials || name;
}

function Card ({ id, title, shortName, url, quadmester, year, careers, activeCareerId, resourceCounts }: Props) {
  const primaryCareer = careers.find((c) => c.careerId === activeCareerId) ?? careers[0];
  const displayYear = primaryCareer?.year ?? year;
  const displayQuadmester = primaryCareer?.quadmester ?? quadmester;
  const planLabel = primaryCareer ? formatPlanId(primaryCareer.planId) : null;
  const universityLabel = primaryCareer?.universityName;
  const facultyLabel = primaryCareer?.facultyName;
  const careerLabel = primaryCareer?.careerName;
  const planId = primaryCareer?.planId ?? '';
  const uploadBase = `/upload?careerId=${activeCareerId}&planId=${planId}&subjectId=${id}`;
  return (
    <article className='group rounded-xl bg-gradient-to-br from-zinc-900/50 to-zinc-950/95 border gradient-border  overflow-hidden hover:border-zinc-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 flex flex-col '>
      {/* Header */}
      <div className='relative mx-0.5 mt-0.5 rounded-xl flex-1 flex flex-col bg-gradient-to-br from-zinc-800/40 to-zinc-900/60 px-6 py-8 border-b border-zinc-800/50 flex-grow'>
        {/* Added flex-grow here */}
        <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/5 to-transparent rounded-full blur-3xl' />
        <div className='relative z-10'>
          {(universityLabel || facultyLabel || careerLabel) && (
            <div className='flex flex-wrap items-center gap-1 mb-2 text-xs text-zinc-500'>
              {universityLabel && <span>{abbreviateUniversity(universityLabel)}</span>}
              {universityLabel && facultyLabel && <span>·</span>}
              {facultyLabel && <span>{facultyLabel}</span>}
              {(universityLabel || facultyLabel) && careerLabel && <span>·</span>}
              {careerLabel && <span>{careerLabel}</span>}
            </div>
          )}
          <h2 className='text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-yellow-100 transition-colors'>
            {shortName || title}
          </h2>
          <div className='flex flex-wrap items-center gap-2 text-sm text-zinc-400'>
            {planLabel && (
              <span className='bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-semibold rounded-md px-2 py-0.5'>
                {planLabel}
              </span>
            )}
            {planLabel && <span className='text-zinc-600'>·</span>}
            <span>{displayQuadmester}º Cuatrimestre</span>
            <span className='text-zinc-600'>·</span>
            <span>{displayYear}º Año</span>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className='flex flex-col items-start gap-4 p-6 flex-shrink-0'>
        {/* Recursos */}
        <div className='w-full'>
          <h4 className='font-semibold tracking-widest text-zinc-500 text-xs uppercase mb-3'>
            Recursos
          </h4>

          <div className='flex flex-col space-y-3 w-full'>
            <ResourceButton
              resourceUrl={`./${id}/resumenes`}
              uploadUrl={`${uploadBase}&type=resumen`}
              count={resourceCounts.resumen}
              label='Resumenes'
              Icon={IconOpenBook}
              activeClass='bg-gradient-to-br from-emerald-500/50 to-emerald-600/10 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 hover:text-emerald-100'
              activeIconClass='fill-emerald-200'
            />
            <ResourceButton
              resourceUrl={`./${id}/parciales`}
              uploadUrl={`${uploadBase}&type=parcial`}
              count={resourceCounts.parcial}
              label='Parciales'
              Icon={IconDocument}
              activeClass='bg-gradient-to-br from-blue-500/50 to-blue-600/10 border border-blue-500/40 hover:border-blue-400/60 text-blue-200 hover:text-blue-100'
              activeIconClass='fill-blue-200'
            />
            <ResourceButton
              resourceUrl={`./${id}/finales`}
              uploadUrl={`${uploadBase}&type=final`}
              count={resourceCounts.final}
              label='Finales'
              Icon={IconUniversity}
              activeClass='bg-gradient-to-br from-purple-500/50 to-purple-600/10 border border-purple-500/40 hover:border-purple-400/60 text-purple-200 hover:text-purple-100'
              activeIconClass='fill-purple-200'
            />
            {/* 
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
            */}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(Card);
