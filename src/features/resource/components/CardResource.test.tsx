import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardResource from './CardResource';

/**
 * El botón de descargar tiene que pasar por el backend.
 *
 * Bajando el archivo directo de R2 la descarga no se cuenta: `download_count`
 * solo lo incrementa `GET /resources/:id/download`. Es toda la razón de ser de
 * estos tests.
 */

const props = {
  id: 'abc-123',
  title: 'Parcial 1 - Álgebra',
  fileUrl: 'https://files.exactamente.com.ar/public/A1C1M1/uuid.pdf',
  type: 'parcial',
  subtype: null,
  examYear: 2024,
  examMonth: 6,
  topic: null,
  mostRecent: false,
};

let assign: ReturnType<typeof vi.fn>;

beforeEach(() => {
  assign = vi.fn();
  vi.stubGlobal('location', { ...window.location, assign });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CardResource — descarga', () => {
  it('navega al endpoint del backend, no al archivo de R2', async () => {
    render(<CardResource {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /descargar/i }));

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign.mock.calls[0][0]).toContain('/api/v1/resources/abc-123/download');
  });

  it('no toca la URL pública de R2 al descargar', async () => {
    render(<CardResource {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /descargar/i }));

    // Si esto falla, la descarga volvió a ir directo al bucket y dejó de contar.
    expect(assign.mock.calls[0][0]).not.toContain('files.exactamente.com.ar');
  });

  /**
   * El `fetch` con fallback que había antes contaba dos veces cuando el redirect
   * se bloqueaba: el intento contaba +1 y el `catch` navegaba al mismo endpoint,
   * que contaba +1 otra vez.
   */
  it('no hace fetch: un solo impacto por click', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    render(<CardResource {...props} />);
    await userEvent.click(screen.getByRole('button', { name: /descargar/i }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('la preview sigue usando el archivo directo, que no cuenta como descarga', async () => {
    render(<CardResource {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Vista Previa' }));

    const iframe = document.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toContain('files.exactamente.com.ar');
    expect(assign).not.toHaveBeenCalled();
  });
});
