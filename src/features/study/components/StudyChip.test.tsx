import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudySubject } from '@/features/study/domain/timer';
import { createStudyStore, type StudyStore } from '@/features/study/store/studyStore';
import StudyChip from './StudyChip';

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
    data: [{ id: 'c1', name: 'Ing. en Sistemas', shortName: 'IS' }],
    error: null,
  });
  api.getSubjects.mockReset().mockResolvedValue({
    data: [{ id: 's1', title: 'Cálculo II' }],
    error: null,
  });
});

const chip = () => screen.getByRole('button', { name: /^modo estudio/i });

function advance(ms: number) {
  act(() => {
    clock += ms;
    store.tick();
  });
}

describe('StudyChip — estados', () => {
  it('en reposo muestra "Estudiar" y su nombre accesible', () => {
    render(<StudyChip placement='header' store={store} />);

    expect(chip()).toHaveAccessibleName('Modo estudio: estudiar');
    expect(chip()).toHaveTextContent('Estudiar');
    expect(chip()).toHaveAttribute('aria-expanded', 'false');
  });

  it('en foco muestra el restante y "Foco"', () => {
    store.setSubject(SUBJECT);
    store.start();
    render(<StudyChip placement='header' store={store} />);
    advance(10_000);

    expect(chip()).toHaveTextContent('49:50');
    expect(chip()).toHaveTextContent('Foco');
    expect(chip()).toHaveAccessibleName('Modo estudio: foco, quedan 49 minutos');
  });

  it('en tiempo extra muestra +mm:ss y "Extra"', () => {
    store.setSubject(SUBJECT);
    store.start();
    render(<StudyChip placement='header' store={store} />);
    advance(58 * MIN + 12_000);

    expect(chip()).toHaveTextContent('+08:12');
    expect(chip()).toHaveTextContent('Extra');
    expect(chip()).toHaveAccessibleName(
      'Modo estudio: foco cumplido, tiempo extra 8 minutos 12 segundos',
    );
  });

  it('en pausa muestra "Pausa"', () => {
    store.setSubject(SUBJECT);
    store.start();
    clock += 18 * MIN + 40_000;
    store.pause();
    render(<StudyChip placement='header' store={store} />);

    expect(chip()).toHaveTextContent('31:20');
    expect(chip()).toHaveTextContent('Pausa');
    expect(chip()).toHaveAccessibleName('Modo estudio: en pausa, quedan 31 minutos');
  });

  it('en descanso muestra el restante en teal y "Descanso"', () => {
    store.setSubject(SUBJECT);
    store.start();
    clock += 20 * MIN;
    store.startBreak();
    render(<StudyChip placement='header' store={store} />);
    advance(2 * MIN + 15_000);

    expect(chip()).toHaveTextContent('07:45');
    expect(chip()).toHaveTextContent('Descanso');
    expect(chip().className).toMatch(/38b2ac/);
  });
});

describe('StudyChip — panel', () => {
  it('al tocarlo abre el panel con "Arrancar foco" como primario', async () => {
    const user = userEvent.setup();
    render(<StudyChip placement='header' store={store} />);

    await user.click(chip());

    expect(chip()).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('dialog', { name: /modo estudio/i });
    expect(chip()).toHaveAttribute('aria-controls', panel.id);
    expect(within(panel).getByRole('button', { name: 'Arrancar foco' })).toBeDisabled();
    expect(within(panel).getByText('Elegí una materia para arrancar')).toBeInTheDocument();
  });

  it('con teclado: Enter abre, Esc cierra y el foco vuelve al chip', async () => {
    const user = userEvent.setup();
    store.setSubject(SUBJECT);
    render(<StudyChip placement='header' store={store} />);

    chip().focus();
    await user.keyboard('{Enter}');
    const panel = screen.getByRole('dialog', { name: /modo estudio/i });
    await waitFor(() => expect(panel).toContainElement(document.activeElement as HTMLElement));

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(chip()).toHaveFocus();
  });

  it('un clic fuera lo cierra', async () => {
    const user = userEvent.setup();
    render(
      <>
        <p>afuera</p>
        <StudyChip placement='header' store={store} />
      </>,
    );
    await user.click(chip());
    await user.click(screen.getByText('afuera'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el chip del header no muestra su panel con el visor abierto', () => {
    store.togglePanel('header');
    act(() => store.setViewerOpen(true));
    render(<StudyChip placement='header' store={store} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
