import React from 'react';
import IconDownload from '@/assets/icons/react/IconDownload';
import IconVisibility from '@/assets/icons/react/IconVisibility';
import IconVisibilityOff from '@/assets/icons/react/IconVisibilityOff';
import HeaderCardResource from './HeaderCardResource';
import ContainerLink from '../common/ContainerLink';
import { usePreviewDrive } from '@/hooks/usePreviewDrive';

interface Props {
  title: string;
  urlDrive: string;
  type: string;
  mostRecent: boolean;
}

const CardResource: React.FC<Props> = ({ title, urlDrive, type, mostRecent }) => {
  const partsTitle = title.split('.');

  const {
    fileId,
    previewUrl,
    downloadUrl,
    previewOpen,
    iframeLoaded,
    iframeRef,
    togglePreview,
    handleIframeLoad,
  } = usePreviewDrive(urlDrive);

  return (
    <div className='flex flex-col bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-zinc-800/60 rounded-xl hover:border-zinc-700/80 transition-all duration-300 group overflow-hidden'>
      <HeaderCardResource
        fileFormat={partsTitle[1]}
        title={partsTitle[0]}
        mostRecent={mostRecent}
        type={type}
      />

      {/* Vista previa */}
      {previewOpen && (
        <div className='mx-6 mb-4 preview-container transition-all'>
          <div className='bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden'>
            <div className='relative bg-zinc-900/50'>
              {!iframeLoaded && (
                <div className='absolute inset-0 flex items-center justify-center text-zinc-400 gap-3 z-10'>
                  <div className='w-6 h-6 border-2 border-zinc-600 border-t-yellow-400 rounded-full animate-spin'></div>
                  <span className='text-sm'>Cargando vista previa...</span>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className={`preview-iframe w-full h-96 transition-opacity duration-500 ${
                  iframeLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                frameBorder='0'
                onLoad={handleIframeLoad}
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className='px-6 pb-6'>
        <div className='flex gap-2 justify-between items-end flex-col sm:flex-row'>
          <div className='flex gap-3 items-center flex-col sm:flex-row w-full sm:w-min'>
            <ContainerLink
              url={downloadUrl}
              className='group/download w-full sm:w-max bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40'
              target='_blank'
              rel='noopener noreferrer'
            >
              <IconDownload size={20} className='fill-primary-foreground' />
              Descargar
            </ContainerLink>

            <button
              onClick={togglePreview}
              className={`preview-toggle cursor-pointer group/preview w-full sm:w-max font-bold flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 border ${
                previewOpen
                  ? 'bg-red-800/50 hover:bg-red-700/60 border-red-700 hover:border-red-600 text-white'
                  : 'bg-zinc-800/50 hover:bg-zinc-700/60 border-zinc-700 hover:border-zinc-600 text-zinc-200'
              }`}
              disabled={!fileId}
            >
              {previewOpen ? (
                <IconVisibilityOff size={20} className='fill-foreground' />
              ) : (
                <IconVisibility size={20} className='fill-foreground' />
              )}
              <span>{previewOpen ? 'Ocultar Vista' : 'Vista Previa'}</span>
            </button>
          </div>

          {mostRecent && (
            <p className='hidden sm:flex text-sm py-2 px-4 bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 rounded-full font-medium'>
              Más reciente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardResource;
