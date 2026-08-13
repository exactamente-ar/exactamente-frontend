import { useState } from 'react';
import { Download } from 'lucide-react';
import type { BlogPostImage } from '../types/blog';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';

interface Props {
  images: BlogPostImage[];
}

export default function ImageGallery({ images }: Props) {
  const [selectedImage, setSelectedImage] = useState<BlogPostImage | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className='flex flex-wrap gap-2 pt-1'>
        {images.map((img) => (
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
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className='max-w-[90vw] max-h-[90vh] bg-transparent border-none shadow-none flex flex-col items-center justify-center p-0'>
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
                <a
                  href={selectedImage.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  download
                  className='flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700'
                >
                  <Download size={16} />
                  Descargar
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
