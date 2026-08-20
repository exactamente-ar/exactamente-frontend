import { useState } from 'react';
import { Download, FileText, X } from 'lucide-react';
import type { BlogPostImage } from '../types/blog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';

const PDF_MIME = 'application/pdf';

interface Props {
  images: BlogPostImage[];
}

export default function ImageGallery({ images }: Props) {
  const [selectedImage, setSelectedImage] = useState<BlogPostImage | null>(null);

  if (images.length === 0) return null;

  async function handleDownload(img: BlogPostImage) {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      const ext =
        img.mimeType === 'image/png' ? 'png' : img.mimeType === 'image/jpeg' ? 'jpg' : 'webp';
      a.download = `imagen-${img.id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(img.url, '_blank');
    }
  }

  return (
    <>
      <div className='flex flex-wrap gap-2 pt-1'>
        {images.map((img) =>
          img.mimeType === PDF_MIME ? (
            <a
              key={img.id}
              href={img.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex h-32 w-32 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900/70 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200'
              aria-label='Abrir PDF'
            >
              <FileText size={32} aria-hidden='true' />
              <span className='text-xs font-bold'>PDF</span>
            </a>
          ) : (
            <button
              key={img.id}
              type='button'
              onClick={() => setSelectedImage(img)}
              className='h-32 w-32 shrink-0 overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-zinc-400'
            >
              <img
                src={img.url}
                alt=''
                loading='lazy'
                className='h-full w-full object-cover transition-transform hover:scale-105'
              />
            </button>
          ),
        )}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className='max-w-[90vw] max-h-[90vh] bg-transparent border-none shadow-none flex flex-col items-center justify-center p-0 [&>button:last-child]:hidden'>
          <DialogTitle className='sr-only'>Visor de imagen</DialogTitle>
          <DialogDescription className='sr-only'>Ver imagen completa</DialogDescription>
          {selectedImage && (
            <>
              <img
                src={selectedImage.url}
                alt=''
                className='max-h-[80vh] w-auto object-contain rounded-lg'
              />
              <div className='absolute -bottom-12 right-0'>
                <button
                  type='button'
                  onClick={() => handleDownload(selectedImage)}
                  className='flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700'
                >
                  <Download size={16} />
                  Descargar
                </button>
              </div>
            </>
          )}
          <DialogClose
            aria-label='Cerrar imagen ampliada'
            className='absolute right-4 top-4 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-zinc-900 border border-zinc-600 text-zinc-100 shadow-lg transition-colors hover:bg-zinc-800 hover:border-zinc-500 hover:text-white'
          >
            <X size={28} strokeWidth={2.5} />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
