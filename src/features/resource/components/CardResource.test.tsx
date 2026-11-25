import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { studyStore } from '@/features/study/store/studyStore';
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

describe('CardResource — eventos de analítica', () => {
  let gtag: ReturnType<typeof vi.fn<NonNullable<Window['gtag']>>>;

  beforeEach(() => {
    gtag = vi.fn<NonNullable<Window['gtag']>>();
    window.gtag = gtag;
  });

  afterEach(() => {
    delete window.gtag;
  });

  it('registra la descarga antes de navegar', async () => {
    render(<CardResource {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /descargar/i }));

    expect(gtag).toHaveBeenCalledWith('event', 'resource_download', {
      resource_id: 'abc-123',
      type: 'parcial',
      transport_type: 'beacon',
    });
    expect(gtag.mock.invocationCallOrder[0]).toBeLessThan(assign.mock.invocationCallOrder[0]);
  });

  it('registra la vista previa al abrirla, no al cerrarla', async () => {
    render(<CardResource {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Vista Previa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar Vista' }));

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'resource_preview', {
      resource_id: 'abc-123',
      type: 'parcial',
      mode: 'inline',
    });
  });

  it('registra la vista completa', async () => {
    render(<CardResource {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Vista Previa' }));
    gtag.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'Ver completo' }));

    expect(gtag).toHaveBeenCalledWith('event', 'resource_preview', {
      resource_id: 'abc-123',
      type: 'parcial',
      mode: 'fullscreen',
    });
  });
});

describe('CardResource — Modo Estudio en el visor', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    studyStore.setViewerOpen(false);
  });

  it('con el flag prendido el visor tiene el chip a la izquierda de la X y avisa al store', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', 'true');
    const user = userEvent.setup();
    render(<CardResource {...props} />);

    await user.click(screen.getByRole('button', { name: /vista previa/i }));
    await user.click(screen.getByRole('button', { name: 'Ver completo' }));

    const close = screen.getByRole('button', { name: 'Cerrar vista completa' });
    const studyChip = await screen.findByRole('button', { name: /^modo estudio/i });
    expect(
      studyChip.compareDocumentPosition(close) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await waitFor(() => expect(studyStore.getSnapshot().viewerOpen).toBe(true));

    await user.click(close);
    await waitFor(() => expect(studyStore.getSnapshot().viewerOpen).toBe(false));
  });

  it('con el flag apagado no hay chip y no toca el store', async () => {
    vi.stubEnv('PUBLIC_STUDY_MODE', undefined);
    const setViewerOpen = vi.spyOn(studyStore, 'setViewerOpen');
    const user = userEvent.setup();
    render(<CardResource {...props} />);

    await user.click(screen.getByRole('button', { name: /vista previa/i }));
    await user.click(screen.getByRole('button', { name: 'Ver completo' }));

    expect(screen.queryByRole('button', { name: /^modo estudio/i })).not.toBeInTheDocument();
    expect(setViewerOpen).not.toHaveBeenCalled();
    setViewerOpen.mockRestore();
  });
});
