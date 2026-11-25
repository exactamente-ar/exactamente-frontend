import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StudySession } from '@/features/study/domain/sessions';
import {
  announcement,
  notificationPermission,
  playChime,
  requestNotificationPermission,
  showNotification,
  toastMessage,
} from './alerts';

const session = (overrides: Partial<StudySession> = {}): StudySession => ({
  id: 'a',
  startedAt: '2026-11-25T13:00:00.000Z',
  endedAt: '2026-11-25T13:58:00.000Z',
  minutes: 58,
  recordedMinutes: 58,
  endReason: 'break',
  careerId: 'c1',
  careerName: 'Ing. en Sistemas',
  subjectId: 's1',
  subjectName: 'Cálculo II',
  updatedAt: '2026-11-25T13:58:00.000Z',
  ...overrides,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('toastMessage', () => {
  it('confirma los minutos y el total del día', () => {
    expect(toastMessage({ kind: 'recorded', session: session(), todayMinutes: 100 })).toEqual({
      title: '+58 min de Cálculo II · hoy llevás 1 h 40 min',
      detail: null,
    });
  });

  it('una sesión cerrada por el tope lo explica', () => {
    const message = toastMessage({
      kind: 'recorded',
      session: session({ minutes: 110, recordedMinutes: 110, endReason: 'cap' }),
      todayMinutes: 110,
    });

    expect(message.title).toBe('+1 h 50 min de Cálculo II · hoy llevás 1 h 50 min');
    expect(message.detail).toBe(
      'Cerramos tu foco al llegar a 1 h de tiempo extra. Podés corregirlo en tus métricas.',
    );
  });

  it('un foco demasiado corto avisa que no se registró', () => {
    expect(toastMessage({ kind: 'too-short' }).title).toBe(
      'El foco duró menos de un minuto y no se registró.',
    );
  });
});

describe('announcement', () => {
  it('anuncia solo transiciones', () => {
    expect(announcement({ type: 'focus-started' })).toBe('Arrancó tu foco.');
    expect(announcement({ type: 'focus-ended', targetMinutes: 50 })).toBe(
      'Terminó tu foco de 50 min. El tiempo extra se sigue contando.',
    );
    expect(announcement({ type: 'break-started' })).toBe('Empezó tu descanso.');
    expect(announcement({ type: 'break-ended' })).toBe('Terminó tu descanso.');
    expect(announcement({ type: 'session-recorded', session: session(), todayMinutes: 100 })).toBe(
      'Sesión registrada: +58 min de Cálculo II · hoy llevás 1 h 40 min',
    );
  });
});

describe('notificaciones', () => {
  it('sin API de notificaciones es unsupported y no pide permiso', async () => {
    vi.stubGlobal('Notification', undefined);

    expect(notificationPermission()).toBe('unsupported');
    expect(await requestNotificationPermission()).toBe(false);
    expect(() => showNotification('a', 'b')).not.toThrow();
  });

  it('pide permiso y devuelve si se concedió', async () => {
    const requestPermission = vi.fn().mockResolvedValue('denied');
    vi.stubGlobal(
      'Notification',
      Object.assign(vi.fn(), { permission: 'default', requestPermission }),
    );

    expect(await requestNotificationPermission()).toBe(false);
    expect(requestPermission).toHaveBeenCalled();
  });

  it('solo muestra con permiso concedido', () => {
    const ctor = vi.fn();
    vi.stubGlobal('Notification', Object.assign(ctor, { permission: 'granted' }));
    showNotification('Título', 'Cuerpo');

    expect(ctor).toHaveBeenCalledWith('Título', expect.objectContaining({ body: 'Cuerpo' }));
  });
});

describe('playChime', () => {
  it('sin WebAudio no hace nada ni falla', () => {
    vi.stubGlobal('AudioContext', undefined);

    expect(() => playChime()).not.toThrow();
  });
});
