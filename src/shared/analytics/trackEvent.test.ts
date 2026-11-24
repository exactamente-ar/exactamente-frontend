import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from './trackEvent';

afterEach(() => {
  delete window.gtag;
});

describe('trackEvent', () => {
  it('manda el evento a gtag con sus parámetros', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackEvent('resource_download', { resource_id: 'abc-123' });

    expect(gtag).toHaveBeenCalledWith('event', 'resource_download', { resource_id: 'abc-123' });
  });

  it('no falla si gtag no está cargado (bloqueador de anuncios, SSR)', () => {
    expect(() => trackEvent('resource_download')).not.toThrow();
  });

  it('no propaga errores de gtag: la analítica nunca rompe la interacción', () => {
    window.gtag = vi.fn(() => {
      throw new Error('gtag roto');
    });

    expect(() => trackEvent('resource_download')).not.toThrow();
  });
});
