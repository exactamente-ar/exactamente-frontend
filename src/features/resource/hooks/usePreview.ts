import { useRef, useState } from 'react';

export const usePreview = (fileUrl: string) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const togglePreview = () => {
    if (!fileUrl) return;

    if (!previewOpen) {
      if (iframeRef.current && iframeRef.current.src !== fileUrl) {
        iframeRef.current.src = fileUrl;
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
    previewOpen,
    iframeLoaded,
    iframeRef,
    togglePreview,
    handleIframeLoad,
  };
};
