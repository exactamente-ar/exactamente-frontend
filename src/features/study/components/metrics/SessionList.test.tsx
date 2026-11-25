import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { EMPTY_GOALS, setSubjectGoal, setWeeklyGoal } from '@/features/study/domain/goals';
import type { StudySession } from '@/features/study/domain/sessions';
import { createStudyStore, type StudyStore } from '@/features/study/store/studyStore';
import {
  STUDY_SESSIONS_KEY,
  readSessions,
  writeGoals,
  writeSessions,
} from '@/features/study/utils/studyStorage';
import StudyMetrics from './StudyMetrics';

const api = vi.hoisted(() => ({ getCareers: vi.fn(), getSubjects: vi.fn() }));
vi.mock('@/shared/services/api', () => api);

// Wednesday 25/11/2026, week from Monday 23/11.
const NOW = new Date(2026, 10, 25, 20, 0).getTime();
const CALCULO = { subjectId: 's1', subjectName: 'Cálculo II' };

let store: StudyStore;
let n = 0;

function at(
  date: Date,
  minutes: number,
  subject: { subjectId: string; subjectName: string } = CALCULO,
): StudySession {
  return {
    id: `s${++n}`,
    startedAt: date.toISOString(),
    endedAt: date.toISOString(),
    minutes,
    recordedMinutes: minutes,
    endReason: 'break',
    careerId: 'c1',
    careerName: 'Ing. en Sistemas',
    ...subject,
    updatedAt: date.toISOString(),
  };
}

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView ??= () => {};
});

beforeEach(() => {
  localStorage.clear();
  n = 0;
  store = createStudyStore({ now: () => NOW, newId: () => 'x' });
  api.getCareers.mockReset().mockResolvedValue({
    data: [
      { id: 'c1', name: 'Ing. en Sistemas', shortName: 'IS' },
      { id: 'c2', name: 'Lic. en Física', shortName: 'LF' },
    ],
    error: null,
  });
  api.getSubjects.mockReset().mockImplementation(({ careerId }: { careerId: string }) =>
    Promise.resolve({
      data:
        careerId === 'c1' ? [{ id: 's1', title: 'Cálculo II' }] : [{ id: 'f1', title: 'Física I' }],
      error: null,
    }),
  );
});

const sessionsSection = () => screen.getByRole('region', { name: 'Sesiones' });
const rows = () => within(sessionsSection()).getAllByRole('listitem');

describe('SessionList — listado', () => {
  it('agrupa por día, de la más reciente a la más antigua, con hora, materia y minutos', () => {
    writeSessions([
      at(new Date(2026, 10, 24, 9, 5), 30),
      at(new Date(2026, 10, 25, 8, 0), 58),
      at(new Date(2026, 10, 25, 14, 30), 20),
    ]);
    render(<StudyMetrics store={store} />);

    const days = within(sessionsSection()).getAllByRole('heading', { level: 3 });
    expect(days.map((d) => d.textContent)).toEqual([
      expect.stringMatching(/25 de noviembre/),
      expect.stringMatching(/24 de noviembre/),
    ]);
    expect(rows().map((r) => r.textContent)).toEqual([
      expect.stringMatching(/14:30.*Cálculo II.*20 min/),
      expect.stringMatching(/08:00.*Cálculo II.*58 min/),
      expect.stringMatching(/09:05.*Cálculo II.*30 min/),
    ]);
  });

  it('muestra 20 por página con "Ver más"', async () => {
    const user = userEvent.setup();
    writeSessions(Array.from({ length: 25 }, (_, i) => at(new Date(2026, 10, 1 + i, 9), 10)));
    render(<StudyMetrics store={store} />);

    expect(rows()).toHaveLength(20);
    await user.click(screen.getByRole('button', { name: 'Ver más' }));
    expect(rows()).toHaveLength(25);
    expect(screen.queryByRole('button', { name: 'Ver más' })).not.toBeInTheDocument();
  });
});

describe('SessionList — edición', () => {
  it('bajar de 58 a 43 actualiza la sesión, los totales y las metas sin recargar', async () => {
    const user = userEvent.setup();
    writeSessions([at(new Date(2026, 10, 25, 8, 0), 58)]);
    let goals = setWeeklyGoal(EMPTY_GOALS, '2026-11-23', 2);
    goals = setSubjectGoal(goals, CALCULO, '2026-11-23', 1);
    writeGoals(goals);
    render(<StudyMetrics store={store} />);

    await user.click(within(rows()[0]).getByRole('button', { name: 'Editar' }));
    const field = screen.getByRole('spinbutton', { name: /minutos/i });
    await user.clear(field);
    await user.type(field, '43');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(readSessions()[0].minutes).toBe(43);
    expect(rows()[0]).toHaveTextContent('43 min');
    const week = screen.getByRole('region', { name: 'Esta semana' });
    expect(week).toHaveTextContent('43 min de 2 h');
    expect(screen.getByRole('listitem', { name: 'Cálculo II' })).toHaveTextContent('43 min de 1 h');
  });

  it('no deja guardar 0 ni más de lo registrado, y el inicio es solo lectura', async () => {
    const user = userEvent.setup();
    writeSessions([at(new Date(2026, 10, 25, 8, 0), 58)]);
    render(<StudyMetrics store={store} />);

    await user.click(within(rows()[0]).getByRole('button', { name: 'Editar' }));
    expect(screen.getByText('máx. 58')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /hora|día/i })).not.toBeInTheDocument();
    const field = screen.getByRole('spinbutton', { name: /minutos/i });

    await user.clear(field);
    await user.type(field, '0');
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();

    await user.clear(field);
    await user.type(field, '59');
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(readSessions()[0].minutes).toBe(58);
  });

  it('cambiar la materia a otra de otra carrera la pasa a sumar en la nueva', async () => {
    const user = userEvent.setup();
    writeSessions([at(new Date(2026, 10, 25, 8, 0), 58)]);
    render(<StudyMetrics store={store} />);

    await user.click(within(rows()[0]).getByRole('button', { name: 'Editar' }));
    await user.click(screen.getByRole('combobox', { name: /^carrera/i }));
    await user.click(await screen.findByRole('option', { name: 'Lic. en Física' }));
    await waitFor(() => expect(api.getSubjects).toHaveBeenCalledWith({ careerId: 'c2' }));
    await user.click(screen.getByRole('combobox', { name: /^materia/i }));
    await user.click(await screen.findByRole('option', { name: 'Física I' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(readSessions()[0]).toMatchObject({
      subjectId: 'f1',
      subjectName: 'Física I',
      careerId: 'c2',
      careerName: 'Lic. en Física',
    });
    expect(screen.getByRole('listitem', { name: 'Física I' })).toHaveTextContent('58 min');
    expect(screen.queryByRole('listitem', { name: 'Cálculo II' })).not.toBeInTheDocument();
  });
});

describe('SessionList — borrado', () => {
  it('se confirma en la misma fila y la única sesión del día deja de contar para la racha', async () => {
    const user = userEvent.setup();
    writeSessions([at(new Date(2026, 10, 25, 8), 30), at(new Date(2026, 10, 24, 8), 30)]);
    render(<StudyMetrics store={store} />);
    expect(screen.getByRole('region', { name: 'Racha' })).toHaveTextContent('2 días seguidos');

    await user.click(within(rows()[0]).getByRole('button', { name: 'Borrar' }));
    expect(within(rows()[0]).getByText('¿Borrar esta sesión?')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(within(rows()[0]).getByRole('button', { name: 'Sí, borrar' }));

    expect(readSessions()).toHaveLength(1);
    expect(screen.getByRole('region', { name: 'Racha' })).toHaveTextContent('1 día');
  });

  it('Cancelar no borra', async () => {
    const user = userEvent.setup();
    writeSessions([at(new Date(2026, 10, 25, 8), 30)]);
    render(<StudyMetrics store={store} />);

    await user.click(within(rows()[0]).getByRole('button', { name: 'Borrar' }));
    await user.click(within(rows()[0]).getByRole('button', { name: 'Cancelar' }));

    expect(readSessions()).toHaveLength(1);
  });
});

describe('SessionList — pestañas', () => {
  it('una edición en otra pestaña se refleja', () => {
    writeSessions([at(new Date(2026, 10, 25, 8), 58)]);
    render(<StudyMetrics store={store} />);

    const other = createStudyStore({ now: () => NOW, newId: () => 'y' });
    other.editSession('s1', { minutes: 40 });
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STUDY_SESSIONS_KEY,
          newValue: localStorage.getItem(STUDY_SESSIONS_KEY),
        }),
      );
    });

    expect(rows()[0]).toHaveTextContent('40 min');
  });
});
