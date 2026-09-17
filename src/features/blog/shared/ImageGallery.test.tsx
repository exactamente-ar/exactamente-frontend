import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageGallery from './ImageGallery';

const images = [
  { id: 'img-1', url: 'https://files.exactamente.com.ar/blog/img-1.jpg', mimeType: 'image/webp' },
];

async function openViewer() {
  render(<ImageGallery images={images} />);
  await userEvent.click(screen.getAllByRole('button')[0]);
  const closeBtn = screen.getByRole('button', { name: /cerrar imagen/i });
  return closeBtn;
}

describe('ImageGallery — visor ampliado', () => {
  it('el botón de cerrar tiene fondo sólido, no translúcido', async () => {
    const closeBtn = await openViewer();

    expect(closeBtn.className).toContain('bg-zinc-900');
    expect(closeBtn.className).not.toMatch(/bg-zinc-900\//);
  });

  it('el botón de cerrar es más grande y su icono también', async () => {
    const closeBtn = await openViewer();

    expect(closeBtn.className).toContain('h-12');
    expect(closeBtn.className).toContain('w-12');
    const icon = closeBtn.querySelector('svg');
    expect(icon?.getAttribute('width')).toBe('28');
  });

  it('descarga la imagen mediante fetch y blob al hacer click en Descargar', async () => {
    const user = userEvent.setup();
    const blob = new Blob(['image-data'], { type: 'image/webp' });
    const fetchMock = vi.fn().mockResolvedValue({
      blob: async () => blob,
    });
    vi.stubGlobal('fetch', fetchMock);

    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:download-url');
    URL.revokeObjectURL = vi.fn();

    render(<ImageGallery images={images} />);
    await user.click(screen.getAllByRole('button')[0]);

    const downloadBtn = screen.getByRole('button', { name: /descargar/i });
    await user.click(downloadBtn);

    expect(fetchMock).toHaveBeenCalledWith('https://files.exactamente.com.ar/blog/img-1.jpg');
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);

    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.unstubAllGlobals();
  });
});

describe('ImageGallery — PDFs', () => {
  it('renderiza un PDF como link directo, sin abrir el visor de imagen', async () => {
    const pdf = {
      id: 'pdf-1',
      url: 'https://files.exactamente.com.ar/blog/apunte.pdf',
      mimeType: 'application/pdf',
    };
    render(<ImageGallery images={[pdf]} />);

    const link = screen.getByRole('link', { name: 'Abrir PDF' });
    expect(link).toHaveAttribute('href', pdf.url);
    expect(link).toHaveAttribute('target', '_blank');

    await userEvent.click(link);
    expect(screen.queryByRole('button', { name: /cerrar imagen/i })).toBeNull();
  });
});
