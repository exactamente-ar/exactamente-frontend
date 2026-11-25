import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudySubject } from '@/features/study/domain/timer';
import { useStudy } from '@/features/study/hooks/useStudy';
import { createStudyStore, type StudyStore } from '@/features/study/store/studyStore';
import { readLastCareer } from '@/features/study/utils/studyStorage';
import StudyPanel from './StudyPanel';

const api = vi.hoisted(() => ({ getCareers: vi.fn(), getSubjects: vi.fn() }));
vi.mock('@/shared/services/api', () => api);

const MIN = 60_000;
const SUBJECT: StudySubject = {
  careerId: 'c1',
  careerName: 'Ing. en Sistemas',
  subjectId: 's1',
  subjectName: 'Cálculo II',
};

let clock = 0;
let store: StudyStore;

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
  clock = new Date(2026, 10, 25, 10, 0).getTime();
  store = createStudyStore({ now: () => clock, newId: () => 'focus-1' });
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
        careerId === 'c1' ? [{ id: 's1', title: 'Cálculo II' }] : [{ id: 's9', title: 'Física I' }],
      error: null,
    }),
  );
});

function Harness() {
  const study = useStudy(store);
  return <StudyPanel study={study} store={store} id='panel' onClose={() => {}} />;
}

const button = (name: string | RegExp) => screen.getByRole('button', { name });
const advance = (ms: number) =>
  act(() => {
    clock += ms;
    store.tick();
  });

describe('StudyPanel — materia', () => {
  it('elegir carrera lista solo sus materias, guarda la carrera y habilita el play', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(button('Arrancar foco')).toBeDisabled();

    await user.click(screen.getByRole('combobox', { name: /^carrera/i }));
    await user.click(await screen.findByRole('option', { name: 'Lic. en Física' }));
    await waitFor(() => expect(api.getSubjects).toHaveBeenCalledWith({ careerId: 'c2' }));
    expect(readLastCareer()).toEqual({ careerId: 'c2', careerName: 'Lic. en Física' });

    await user.click(screen.getByRole('combobox', { name: /^materia/i }));
    expect(screen.queryByRole('option', { name: 'Cálculo II' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('option', { name: 'Física I' }));

    expect(button('Arrancar foco')).toBeEnabled();
    expect(screen.getByText('Física I · Lic. en Física')).toBeInTheDocument();
  });

  it('con materia muestra el resumen y "Cambiar" abre los selectores', async () => {
    const user = userEvent.setup();
    store.setSubject(SUBJECT);
    render(<Harness />);

    expect(screen.getByText('Cálculo II · Ing. en Sistemas')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /^carrera/i })).not.toBeInTheDocument();
    await user.click(button('Cambiar'));

    expect(screen.getByRole('combobox', { name: /^carrera/i })).toBeInTheDocument();
  });

  it('con un foco en curso la materia no se puede cambiar', () => {
    store.setSubject(SUBJECT);
    store.start();
    render(<Harness />);

    expect(screen.queryByRole('button', { name: 'Cambiar' })).not.toBeInTheDocument();
  });
});

describe('StudyPanel — acciones', () => {
  it('reposo → foco → pausa → reanudar → terminar', async () => {
    const user = userEvent.setup();
    store.setSubject(SUBJECT);
    render(<Harness />);
    expect(screen.getByText('50:00')).toBeInTheDocument();
    expect(screen.getByText('Foco · 50 min')).toBeInTheDocument();

    await user.click(button('Arrancar foco'));
    expect(button('Pausar')).toBeInTheDocument();
    expect(button('Terminar foco')).toBeInTheDocument();
    expect(button('Arrancar descanso')).toBeInTheDocument();

    advance(10 * MIN);
    await user.click(button('Pausar'));
    expect(button('Reanudar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Arrancar descanso' })).not.toBeInTheDocument();

    await user.click(button('Reanudar'));
    await user.click(button('Terminar foco'));

    expect(store.getSnapshot().timer.phase).toBe('idle');
    expect(store.getSnapshot().sessions[0].minutes).toBe(10);
  });

  it('en tiempo extra el primario es "Arrancar descanso"; en descanso, "Saltar descanso"', async () => {
    const user = userEvent.setup();
    store.setSubject(SUBJECT);
    store.start();
    render(<Harness />);
    advance(58 * MIN);

    expect(screen.getByText('+08:00')).toBeInTheDocument();
    const actions = screen.getAllByRole('button').map((b) => b.textContent);
    expect(actions.indexOf('Arrancar descanso')).toBeLessThan(actions.indexOf('Terminar foco'));

    await user.click(button('Arrancar descanso'));
    expect(screen.getByText('Descanso · 10 min')).toBeInTheDocument();

    await user.click(button('Saltar descanso'));
    expect(store.getSnapshot().timer).toEqual({ phase: 'idle', subject: SUBJECT });
  });

  it('los presets solo aparecen en reposo y cambian el próximo foco', async () => {
    const user = userEvent.setup();
    store.setSubject(SUBJECT);
    render(<Harness />);

    const group = screen.getByRole('radiogroup', { name: /duración del foco/i });
    expect(group).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '25 min' }));
    expect(screen.getByRole('radio', { name: '25 min' })).toBeChecked();
    expect(screen.getByText('25:00')).toBeInTheDocument();

    await user.click(button('Arrancar foco'));
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    const { timer } = store.getSnapshot();
    expect(timer.phase === 'focus' && timer.targetMs).toBe(25 * MIN);
  });
});

describe('StudyPanel — avance y pie', () => {
  it('sin meta ofrece definirla y linkea a métricas', () => {
    render(<Harness />);

    expect(screen.getByText(/hoy/i)).toHaveTextContent('Hoy: 0 min');
    expect(screen.getByRole('link', { name: 'Definir meta' })).toHaveAttribute('href', '/estudio');
    expect(screen.getByRole('link', { name: 'Ver métricas' })).toHaveAttribute('href', '/estudio');
  });

  it('con meta muestra "Semana: X de Meta" con barra', () => {
    store.setWeeklyGoal(12);
    render(<Harness />);

    expect(screen.getByText(/semana:/i)).toHaveTextContent('Semana: 0 min de 12 h');
    expect(screen.getByRole('progressbar', { name: /meta semanal/i })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });
});
