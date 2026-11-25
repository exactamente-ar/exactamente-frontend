import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudySubject } from '@/features/study/domain/timer';
import { createStudyStore, type StudyStore } from '@/features/study/store/studyStore';
import { STUDY_LIVE_ID } from '@/features/study/utils/alerts';
import { useStudyAlerts } from './useStudyAlerts';

const alerts = vi.hoisted(() => ({ playChime: vi.fn(), showNotification: vi.fn() }));
vi.mock('@/features/study/utils/alerts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/study/utils/alerts')>()),
  ...alerts,
}));

const MIN = 60_000;
const SUBJECT: StudySubject = {
  careerId: 'c1',
  careerName: 'Ing. en Sistemas',
  subjectId: 's1',
  subjectName: 'Cálculo II',
};

let clock = 0;
let store: StudyStore;
let live: HTMLElement;

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  alerts.playChime.mockReset();
  alerts.showNotification.mockReset();
  clock = new Date(2026, 10, 25, 10, 0).getTime();
  store = createStudyStore({ now: () => clock, newId: () => 'focus-1' });
  live = document.createElement('div');
  live.id = STUDY_LIVE_ID;
  document.body.append(live);
});

afterEach(() => {
  live.remove();
  vi.useRealTimers();
});

function reachTarget() {
  act(() => {
    clock += 50 * MIN;
    store.tick();
    vi.runOnlyPendingTimers();
  });
}

describe('useStudyAlerts', () => {
  it('al terminar el foco suena una vez y no abre nada', () => {
    store.setSubject(SUBJECT);
    store.start();
    renderHook(() => useStudyAlerts(store));

    reachTarget();
    act(() => {
      clock += MIN;
      store.tick();
    });

    expect(alerts.playChime).toHaveBeenCalledTimes(1);
    expect(alerts.showNotification).not.toHaveBeenCalled();
    expect(store.getSnapshot().openPanel).toBeNull();
  });

  it('con notificación activada muestra la del navegador', () => {
    store.updateSettings({ notify: true, sound: false });
    store.setSubject(SUBJECT);
    store.start();
    renderHook(() => useStudyAlerts(store));

    reachTarget();

    expect(alerts.playChime).not.toHaveBeenCalled();
    expect(alerts.showNotification).toHaveBeenCalledWith(
      'Terminó tu foco de 50 min',
      'El tiempo extra se sigue contando.',
    );
  });

  it('otra pestaña o una recarga después del aviso no vuelven a avisar', () => {
    store.setSubject(SUBJECT);
    store.start();
    renderHook(() => useStudyAlerts(store));
    reachTarget();

    const reloaded = createStudyStore({ now: () => clock, newId: () => 'x' });
    renderHook(() => useStudyAlerts(reloaded));
    act(() => {
      clock += MIN;
      reloaded.tick();
    });

    expect(alerts.playChime).toHaveBeenCalledTimes(1);
  });

  it('la región live anuncia la transición, nunca el conteo', () => {
    store.setSubject(SUBJECT);
    renderHook(() => useStudyAlerts(store));

    act(() => {
      store.start();
      vi.runOnlyPendingTimers();
    });
    expect(live).toHaveTextContent('Arrancó tu foco.');

    act(() => {
      clock += 10_000;
      store.tick();
      vi.runOnlyPendingTimers();
    });
    expect(live).toHaveTextContent('Arrancó tu foco.');

    act(() => {
      clock += 20 * MIN;
      store.startBreak();
      vi.runOnlyPendingTimers();
    });
    expect(live).toHaveTextContent(/Sesión registrada: \+20 min de Cálculo II/);
    expect(live).toHaveTextContent('Empezó tu descanso.');
  });

  it('al terminar el descanso suena', () => {
    store.setSubject(SUBJECT);
    store.start();
    clock += 5 * MIN;
    store.startBreak();
    renderHook(() => useStudyAlerts(store));

    act(() => {
      clock += 10 * MIN;
      store.tick();
    });

    expect(alerts.playChime).toHaveBeenCalledTimes(1);
  });
});
