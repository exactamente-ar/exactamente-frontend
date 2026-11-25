import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudySubject } from '@/features/study/domain/timer';
import { useStudy } from '@/features/study/hooks/useStudy';
import { createStudyStore, type StudyStore } from '@/features/study/store/studyStore';
import { readSettings } from '@/features/study/utils/studyStorage';
import StudySettings from './StudySettings';

const alerts = vi.hoisted(() => ({
  requestNotificationPermission: vi.fn(),
  notificationPermission: vi.fn(),
}));
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

let store: StudyStore;
const onBack = vi.fn();

function Harness() {
  const { settings } = useStudy(store);
  return <StudySettings settings={settings} store={store} onBack={onBack} />;
}

beforeEach(() => {
  localStorage.clear();
  store = createStudyStore({ now: () => 1_000_000, newId: () => 'f' });
  alerts.notificationPermission.mockReset().mockReturnValue('default');
  alerts.requestNotificationPermission.mockReset();
  onBack.mockReset();
});

describe('StudySettings', () => {
  it('muestra los defaults', () => {
    render(<Harness />);

    expect(screen.getByRole('radio', { name: '50 min' })).toBeChecked();
    expect(screen.getByRole('spinbutton', { name: /duración del foco/i })).toHaveValue(50);
    expect(screen.getByRole('spinbutton', { name: /duración del descanso/i })).toHaveValue(10);
    expect(screen.getByRole('switch', { name: /arrancar el descanso solo/i })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: /sonido al terminar/i })).toBeChecked();
    expect(screen.getByRole('switch', { name: /notificación del navegador/i })).not.toBeChecked();
    expect(screen.getByText('Tus horas se guardan en este navegador.')).toBeInTheDocument();
  });

  it('los cambios se guardan al instante', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('radio', { name: '25 min' }));
    expect(readSettings().focusMin).toBe(25);

    const breakField = screen.getByRole('spinbutton', { name: /duración del descanso/i });
    await user.clear(breakField);
    await user.type(breakField, '15');
    expect(readSettings().breakMin).toBe(15);

    await user.click(screen.getByRole('switch', { name: /arrancar el descanso solo/i }));
    await user.click(screen.getByRole('switch', { name: /sonido al terminar/i }));
    expect(readSettings()).toMatchObject({ autoStartBreak: true, sound: false });
  });

  it('un valor fuera de rango se acota al salir del campo', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const focusField = screen.getByRole('spinbutton', { name: /duración del foco/i });

    await user.clear(focusField);
    await user.type(focusField, '300');
    await user.tab();

    expect(readSettings().focusMin).toBe(120);
    expect(focusField).toHaveValue(120);
  });

  it('no afecta al foco en curso', async () => {
    const user = userEvent.setup();
    store.setSubject(SUBJECT);
    store.start();
    render(<Harness />);

    await user.click(screen.getByRole('radio', { name: '25 min' }));

    const { timer } = store.getSnapshot();
    expect(timer.phase === 'focus' && timer.targetMs).toBe(50 * MIN);
  });

  it('si el navegador niega el permiso, el switch vuelve a apagado con un mensaje', async () => {
    const user = userEvent.setup();
    alerts.requestNotificationPermission.mockResolvedValue(false);
    render(<Harness />);

    await user.click(screen.getByRole('switch', { name: /notificación del navegador/i }));

    expect(await screen.findByText('Tu navegador bloqueó las notificaciones.')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /notificación del navegador/i })).not.toBeChecked();
    expect(readSettings().notify).toBe(false);
  });

  it('con permiso concedido queda prendida', async () => {
    const user = userEvent.setup();
    alerts.requestNotificationPermission.mockResolvedValue(true);
    render(<Harness />);

    await user.click(screen.getByRole('switch', { name: /notificación del navegador/i }));

    await waitFor(() => expect(readSettings().notify).toBe(true));
  });

  it('"Volver" regresa al panel', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Volver' }));
    expect(onBack).toHaveBeenCalled();
  });
});
