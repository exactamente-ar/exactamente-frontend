import { useRef, useState } from 'react';

export const usePreviewDrive = (previewUrl: string, downloadUrl: string) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const togglePreview = () => {
    if (!previewUrl) return;

    if (!previewOpen) {
      if (iframeRef.current && iframeRef.current.src !== previewUrl) {
        iframeRef.current.src = previewUrl;
        setIframeLoaded(false);
      }
    } else {
      if (iframeRef.current) {
        iframeRef.current.src = '';
        setIframeLoaded(false);
      }
    }
    setPreviewOpen(!previewOpen);
  };

  const handleIframeLoad = () => setIframeLoaded(true);

  return {
    previewUrl,
    downloadUrl,
    previewOpen,
    iframeLoaded,
    iframeRef,
    togglePreview,
    handleIframeLoad,
  };
};
