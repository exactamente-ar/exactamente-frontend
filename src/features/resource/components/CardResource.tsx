import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import IconDownload from '@/shared/components/icons/react/IconDownload';
import IconLink from '@/shared/components/icons/react/IconLink';
import IconVisibility from '@/shared/components/icons/react/IconVisibility';
import IconVisibilityOff from '@/shared/components/icons/react/IconVisibilityOff';
import HeaderCardResource from './HeaderCardResource';
import { usePreview } from '@/features/resource/hooks/usePreview';

interface Props {
  title: string;
  fileUrl: string;
  type: string;
  subtype: string | null;
  examYear: number | null;
  examMonth: number | null;
  topic: number | null;
  mostRecent: boolean;
}

const CardResource: React.FC<Props> = ({ title, fileUrl, type, subtype, examYear, examMonth, topic, mostRecent }) => {
  const {
    previewOpen,
    iframeLoaded,
    iframeRef,
    togglePreview,
    handleIframeLoad,
  } = usePreview(fileUrl);

  const [downloading, setDownloading] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!fullscreenOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    closeBtnRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreenOpen]);

  const getDownloadName = useCallback(() => {
    const base = title?.trim() || 'recurso';
    return /\.pdf$/i.test(base) ? base : `${base}.pdf`;
  }, [title]);

  const handleDownload = useCallback(async () => {
    if (!fileUrl || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getDownloadName();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = getDownloadName();
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloading(false);
    }
  }, [fileUrl, downloading, getDownloadName]);

  return (
    <div className='flex flex-col bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-zinc-800/60 rounded-xl hover:border-zinc-700/80 transition-all duration-300 group overflow-hidden'>
      <HeaderCardResource
        title={title}
        type={type}
        subtype={subtype}
        examYear={examYear}
        examMonth={examMonth}
        topic={topic}
        mostRecent={mostRecent}
      />

      {/* Vista previa */}
      {previewOpen && !fullscreenOpen && (
        <div className='mx-6 mb-4 preview-container transition-all'>
          <div className='bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden'>
            <div className='flex items-center justify-between gap-3 px-4 py-2 border-b border-zinc-700/50 bg-zinc-900/40'>
              <span className='text-xs font-medium text-zinc-400 uppercase tracking-wide'>Vista previa</span>
              <button
                onClick={() => setFullscreenOpen(true)}
                aria-label='Ver completo'
                title='Ver completo'
                className='cursor-pointer flex items-center justify-center p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-all duration-200'
              >
                <IconLink size={18} />
              </button>
            </div>
            <div className='relative bg-zinc-900/50'>
              {!iframeLoaded && (
                <div className='absolute inset-0 flex items-center justify-center text-zinc-400 gap-3 z-10'>
                  <div className='w-6 h-6 border-2 border-zinc-600 border-t-yellow-400 rounded-full animate-spin'></div>
                  <span className='text-sm'>Cargando vista previa...</span>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={fileUrl}
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
            <button
              onClick={handleDownload}
              disabled={!fileUrl || downloading}
              className='group/download cursor-pointer w-full sm:w-max text-white font-bold flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 gradient-border disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100'
            >
              {downloading ? (
                <div className='w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin' />
              ) : (
                <IconDownload size={20} className='fill-white' />
              )}
              {downloading ? 'Descargando...' : 'Descargar'}
            </button>

            <button
              onClick={togglePreview}
              className={`preview-toggle cursor-pointer group/preview w-full sm:w-max font-bold flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 border ${
                previewOpen
                  ? 'bg-red-800/50 hover:bg-red-700/60 border-red-700 hover:border-red-600 text-white'
                  : 'bg-zinc-800/50 hover:bg-zinc-700/60 border-zinc-700 hover:border-zinc-600 text-zinc-200'
              }`}
              disabled={!fileUrl}
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

      {fullscreenOpen && (
        <div
          role='dialog'
          aria-modal='true'
          aria-label={`Vista completa: ${title}`}
          className='fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col p-4 sm:p-6'
        >
          <div className='flex items-center justify-between gap-4 mb-3'>
            <h2 className='text-white font-medium text-sm sm:text-base truncate'>{title}</h2>
            <button
              ref={closeBtnRef}
              onClick={() => setFullscreenOpen(false)}
              aria-label='Cerrar vista completa'
              className='cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 text-zinc-300 hover:text-white transition-all duration-200 shrink-0'
            >
              <X size={20} />
            </button>
          </div>
          <iframe
            src={fileUrl}
            title={title}
            className='flex-1 w-full rounded-xl bg-zinc-900 border border-zinc-800'
            frameBorder='0'
          />
        </div>
      )}
    </div>
  );
};

export default CardResource;
