import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudySession } from '@/features/study/domain/sessions';
import StudyToast from './StudyToast';

const session: StudySession = {
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
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('StudyToast', () => {
  it('muestra la confirmación con role status y link "Ver"', () => {
    render(
      <StudyToast
        completion={{ kind: 'recorded', session, todayMinutes: 100 }}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      '+58 min de Cálculo II · hoy llevás 1 h 40 min',
    );
    expect(screen.getByRole('link', { name: 'Ver' })).toHaveAttribute('href', '/estudio');
  });

  it('se cierra sola a los 6 s', () => {
    const onDismiss = vi.fn();
    render(
      <StudyToast
        completion={{ kind: 'recorded', session, todayMinutes: 58 }}
        onDismiss={onDismiss}
      />,
    );

    act(() => vi.advanceTimersByTime(5_900));
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('no se cierra mientras tiene el mouse encima', () => {
    const onDismiss = vi.fn();
    render(
      <StudyToast
        completion={{ kind: 'recorded', session, todayMinutes: 58 }}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.mouseEnter(screen.getByRole('status'));
    act(() => vi.advanceTimersByTime(10_000));
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.mouseLeave(screen.getByRole('status'));
    act(() => vi.advanceTimersByTime(6_000));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('tiene botón cerrar', () => {
    const onDismiss = vi.fn();
    render(<StudyToast completion={{ kind: 'too-short' }} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('una sesión del tope explica el cierre', () => {
    render(
      <StudyToast
        completion={{
          kind: 'recorded',
          session: { ...session, minutes: 110, recordedMinutes: 110, endReason: 'cap' },
          todayMinutes: 110,
        }}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Cerramos tu foco al llegar a 1 h de tiempo extra',
    );
  });
});
