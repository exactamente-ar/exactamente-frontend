const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const SUBTYPE_LABELS: Record<string, string> = {
  parcial: 'Parcial',
  recuperatorio: 'Recuperatorio',
  prefinal: 'Pre-final',
  parcialito: 'Parcialito',
};

interface Props {
  title: string;
  type: string;
  subtype: string | null;
  examYear: number | null;
  examMonth: number | null;
  topic: number | null;
  mostRecent: boolean;
}

const ResourceHeader: React.FC<Props> = ({ title, type, subtype, examYear, examMonth, topic, mostRecent }) => {
  const dateLabel =
    examYear && examMonth
      ? `${MONTHS_SHORT[examMonth - 1]} ${examYear}`
      : null;

  return (
    <div className='p-6 pb-4'>
      <div className='flex justify-between flex-col-reverse sm:flex-row'>
        <h5 className='font-bold text-white text-xl group-hover:text-yellow-100 transition-colors'>
          {title}
        </h5>
        <div className='flex justify-between items-start mb-4'>
          <div className='flex gap-2 flex-wrap'>
            {type === 'parcial' && subtype && (
              <span className='w-max py-2 px-4 bg-gradient-to-r capitalize from-yellow-500/15 to-yellow-600/15 border border-yellow-500/30 text-yellow-200 font-semibold rounded-full text-sm'>
                {SUBTYPE_LABELS[subtype] ?? subtype}
              </span>
            )}
            {dateLabel && (
              <span className='w-max py-2 px-4 bg-gradient-to-r from-zinc-700/40 to-zinc-800/40 border border-zinc-600/40 text-zinc-300 font-semibold rounded-full text-sm'>
                {dateLabel}
              </span>
            )}
            {topic != null && (
              <span className='w-max py-2 px-4 bg-gradient-to-r from-blue-500/15 to-blue-600/15 border border-blue-500/30 text-blue-200 font-semibold rounded-full text-sm'>
                Tema {topic}
              </span>
            )}
          </div>
          {mostRecent && (
            <p className='sm:hidden text-sm py-1 bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 rounded-full px-3'>
              Más reciente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceHeader;
