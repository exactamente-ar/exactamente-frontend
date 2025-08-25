import { useRef, useState } from 'react';
import { extractDriveFileId } from '@/utils/extractDriveFileId';

export const usePreviewDrive = (urlDrive: string) => {
  const fileId = extractDriveFileId(urlDrive);
  const previewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : '#';
  const downloadUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : '#';

  const [previewOpen, setPreviewOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const togglePreview = () => {
    if (!fileId) return;

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
    fileId,
    previewUrl,
    downloadUrl,
    previewOpen,
    iframeLoaded,
    iframeRef,
    togglePreview,
    handleIframeLoad,
  };
};
