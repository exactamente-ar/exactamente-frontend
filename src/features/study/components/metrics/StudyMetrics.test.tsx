import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { EMPTY_GOALS, setSubjectGoal, setWeeklyGoal } from '@/features/study/domain/goals';
import type { StudySession } from '@/features/study/domain/sessions';
import { createStudyStore, type StudyStore } from '@/features/study/store/studyStore';
import { readGoals, writeGoals, writeSessions } from '@/features/study/utils/studyStorage';
import StudyMetrics from './StudyMetrics';

// Wednesday 25/11/2026. This week starts Monday 23/11; the last one, 16/11.
const NOW = new Date(2026, 10, 25, 12, 0).getTime();
const FISICA = { subjectId: 'f', subjectName: 'Física' };
const QUIMICA = { subjectId: 'q', subjectName: 'Química' };

let store: StudyStore;
let n = 0;

function at(
  date: Date,
  minutes: number,
  subject: { subjectId: string; subjectName: string } = FISICA,
): StudySession {
  return {
    id: `s${++n}`,
    startedAt: date.toISOString(),
    endedAt: date.toISOString(),
    minutes,
    recordedMinutes: minutes,
    endReason: 'manual',
    careerId: 'c1',
    careerName: 'Ing. en Sistemas',
    ...subject,
    updatedAt: date.toISOString(),
  };
}

beforeEach(() => {
  localStorage.clear();
  store = createStudyStore({ now: () => NOW, newId: () => 'x' });
});

const weekCard = () => screen.getByRole('region', { name: 'Esta semana' });

describe('StudyMetrics — estado vacío', () => {
  it('explica qué se va a ver y abre el reloj del header', async () => {
    const user = userEvent.setup();
    render(<StudyMetrics store={store} />);

    expect(
      screen.getByText(
        'Acá vas a ver cuánto estudiás por semana y por materia. Abrí el reloj de arriba y arrancá tu primer foco.',
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Abrir el reloj' }));

    expect(store.getSnapshot().openPanel).toBe('header');
  });
});

describe('StudyMetrics — esta semana', () => {
  it('muestra el total y la diferencia con signo contra la semana anterior', () => {
    writeSessions([
      at(new Date(2026, 10, 23, 9), 300),
      at(new Date(2026, 10, 24, 9), 240),
      at(new Date(2026, 10, 17, 9), 410),
    ]);
    render(<StudyMetrics store={store} />);

    expect(within(weekCard()).getByText('9 h')).toBeInTheDocument();
    expect(within(weekCard()).getByText('+2 h 10 min que la semana pasada')).toBeInTheDocument();
  });

  it('con menos que la semana pasada el signo es −', () => {
    writeSessions([at(new Date(2026, 10, 23, 9), 60), at(new Date(2026, 10, 17, 9), 105)]);
    render(<StudyMetrics store={store} />);

    expect(within(weekCard()).getByText('−45 min que la semana pasada')).toBeInTheDocument();
  });

  it('con meta muestra "9 h de 12 h" con barra', () => {
    writeSessions([at(new Date(2026, 10, 23, 9), 540)]);
    writeGoals(setWeeklyGoal(EMPTY_GOALS, '2026-11-23', 12));
    render(<StudyMetrics store={store} />);

    expect(within(weekCard()).getByText('9 h de 12 h')).toBeInTheDocument();
    expect(within(weekCard()).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('sin meta ofrece definirla en línea', async () => {
    const user = userEvent.setup();
    writeSessions([at(new Date(2026, 10, 23, 9), 60)]);
    render(<StudyMetrics store={store} />);

    expect(within(weekCard()).getByText(/todavía no tenés meta semanal/i)).toBeInTheDocument();
    await user.click(within(weekCard()).getByRole('button', { name: 'Definir meta' }));
    const field = within(weekCard()).getByRole('spinbutton', { name: /horas/i });
    await user.clear(field);
    await user.type(field, '12');
    await user.click(within(weekCard()).getByRole('button', { name: 'Guardar' }));

    expect(readGoals().weekly).toEqual([{ from: '2026-11-23', hours: 12 }]);
    expect(within(weekCard()).getByText('1 h de 12 h')).toBeInTheDocument();
  });

  it('una semana pasada conserva la meta que tenía', () => {
    let goals = setWeeklyGoal(EMPTY_GOALS, '2026-11-16', 12);
    goals = setWeeklyGoal(goals, '2026-11-23', 10);
    writeGoals(goals);
    writeSessions([at(new Date(2026, 10, 17, 9), 410)]);
    render(<StudyMetrics store={store} />);

    expect(
      within(weekCard()).getByText('La semana pasada: 6 h 50 min de 12 h'),
    ).toBeInTheDocument();
    expect(within(weekCard()).getByText('0 min de 10 h')).toBeInTheDocument();
  });
});

describe('StudyMetrics — por materia', () => {
  it('muestra materias con su meta, aunque tengan 0 h, y se editan en línea', async () => {
    const user = userEvent.setup();
    let goals = setSubjectGoal(EMPTY_GOALS, FISICA, '2026-11-23', 10);
    goals = setSubjectGoal(goals, QUIMICA, '2026-11-23', 3);
    writeGoals(goals);
    writeSessions([at(new Date(2026, 10, 24, 9), 300)]);
    render(<StudyMetrics store={store} />);

    const card = screen.getByRole('region', { name: 'Por materia' });
    const fisica = within(card).getByRole('listitem', { name: 'Física' });
    const quimica = within(card).getByRole('listitem', { name: 'Química' });
    expect(fisica).toHaveTextContent('5 h de 10 h');
    expect(quimica).toHaveTextContent('0 min de 3 h');

    await user.click(within(fisica).getByRole('button', { name: 'Cambiar' }));
    const field = within(fisica).getByRole('spinbutton', { name: /horas/i });
    await user.clear(field);
    await user.type(field, '7');
    await user.click(within(fisica).getByRole('button', { name: 'Guardar' }));
    expect(within(card).getByRole('listitem', { name: 'Física' })).toHaveTextContent('5 h de 7 h');

    await user.click(within(quimica).getByRole('button', { name: 'Quitar' }));
    expect(within(card).queryByRole('listitem', { name: 'Química' })).not.toBeInTheDocument();
    expect(readGoals().bySubject.f.entries).toEqual([{ from: '2026-11-23', hours: 7 }]);
  });

  it('una materia sin meta ofrece definirla', () => {
    writeSessions([at(new Date(2026, 10, 24, 9), 60)]);
    render(<StudyMetrics store={store} />);

    const row = screen.getByRole('listitem', { name: 'Física' });
    expect(within(row).getByRole('button', { name: 'Definir meta' })).toBeInTheDocument();
  });
});

describe('StudyMetrics — racha, días e historial', () => {
  it('con sesiones ayer y anteayer y ninguna hoy: 2 días y la invitación', () => {
    writeSessions([at(new Date(2026, 10, 24, 9), 30), at(new Date(2026, 10, 23, 9), 30)]);
    render(<StudyMetrics store={store} />);

    const card = screen.getByRole('region', { name: 'Racha' });
    expect(card).toHaveTextContent('2 días seguidos');
    expect(card).toHaveTextContent('Estudiá hoy para sumar el día');
  });

  it('los días de la semana van de lunes a domingo', () => {
    writeSessions([at(new Date(2026, 10, 25, 9), 40)]);
    render(<StudyMetrics store={store} />);

    const card = screen.getByRole('region', { name: 'Días de la semana' });
    expect(within(card).getAllByRole('listitem')).toHaveLength(7);
    expect(within(card).getByRole('listitem', { name: /miércoles: 40 min/i })).toBeInTheDocument();
  });

  it('el heatmap tiene 26 semanas y cada celda una etiqueta accesible', () => {
    writeSessions([at(new Date(2026, 10, 25, 9), 20)]);
    render(<StudyMetrics store={store} />);

    const card = screen.getByRole('region', { name: 'Historial' });
    const cells = within(card).getAllByRole('img', { name: /: / });
    // Future days of the current week are not labeled.
    expect(cells).toHaveLength(26 * 7 - 4);
    expect(within(card).getByRole('img', { name: /25 de noviembre: 20 min/ })).toBeInTheDocument();
    expect(
      within(card).getByRole('img', { name: /24 de noviembre: sin estudio/ }),
    ).toBeInTheDocument();
  });
});
