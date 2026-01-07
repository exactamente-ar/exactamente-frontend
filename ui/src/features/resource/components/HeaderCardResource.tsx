interface Props {
  title: string;
  type: string;
  mostRecent: boolean;
  fileFormat: string;
}

const ResourceHeader: React.FC<Props> = ({ title, type, mostRecent, fileFormat }) => {
  return (
    <div className='p-6 pb-4'>
      <div className='flex justify-between flex-col-reverse sm:flex-row'>
        <h5 className='font-bold text-white text-xl group-hover:text-yellow-100 transition-colors'>
          {title}
        </h5>
        <div className='flex justify-between items-start mb-4'>
          <div className='flex gap-2'>
            <span className='w-max py-2 px-4 bg-gradient-to-r capitalize from-yellow-500/15 to-yellow-600/15 border border-yellow-500/30 text-yellow-200 font-semibold rounded-full text-sm'>
              {parseInt(title.split(' ')[1]) < 2024 ? 'Plan 2011' : 'Plan 2024'}
            </span>
            <span className='w-min py-2 px-4 bg-gradient-to-r uppercase from-blue-500/15 to-blue-600/15 border border-blue-500/30 text-blue-200 font-semibold rounded-full text-sm'>
              {fileFormat}
            </span>
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
