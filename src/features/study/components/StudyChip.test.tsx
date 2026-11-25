import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudySubject } from '@/features/study/domain/timer';
import { createStudyStore, type StudyStore } from '@/features/study/store/studyStore';
import { STUDY_CONTEXT_ID, resetPageContextCache } from '@/features/study/context';
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

describe('StudyChip — materia por contexto', () => {
  function mountContext() {
    resetPageContextCache();
    const script = document.createElement('script');
    script.type = 'application/json';
    script.id = STUDY_CONTEXT_ID;
    script.textContent = JSON.stringify({
      subjectId: 's7',
      subjectName: 'Cálculo II',
      careers: [
        { careerId: 'c1', careerName: 'Ing. en Sistemas' },
        { careerId: 'c2', careerName: 'Ing. Electrónica' },
      ],
    });
    document.body.append(script);
  }

  afterEach(() => {
    document.getElementById(STUDY_CONTEXT_ID)?.remove();
    resetPageContextCache();
  });

  it('en reposo, abrir el panel toma la materia de la página: arrancar es abrir y play', async () => {
    const user = userEvent.setup();
    mountContext();
    store.setLastCareer({ careerId: 'c2', careerName: 'Ing. Electrónica' });
    render(<StudyChip placement='header' store={store} />);

    await user.click(chip());
    expect(screen.getByText('Cálculo II · Ing. Electrónica')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Arrancar foco' }));

    expect(store.getSnapshot().timer).toMatchObject({
      phase: 'focus',
      subject: { subjectId: 's7', careerId: 'c2' },
    });
  });

  it('con un foco en curso de otra materia, la página no la cambia', async () => {
    const user = userEvent.setup();
    const fisica = { ...SUBJECT, subjectId: 'f1', subjectName: 'Física' };
    store.setSubject(fisica);
    store.start();
    mountContext();
    render(<StudyChip placement='header' store={store} />);

    await user.click(chip());

    expect(store.getSnapshot().timer.subject).toEqual(fisica);
  });
});

describe('StudyChip — visor', () => {
  it('el chip del visor abre su panel y permite arrancar y pausar', async () => {
    const user = userEvent.setup();
    store.setSubject(SUBJECT);
    act(() => store.setViewerOpen(true));
    render(<StudyChip placement='viewer' store={store} />);

    await user.click(chip());
    await user.click(screen.getByRole('button', { name: 'Arrancar foco' }));
    await user.click(screen.getByRole('button', { name: 'Pausar' }));

    expect(store.getSnapshot().timer).toMatchObject({ phase: 'focus', runningSince: null });
    expect(screen.getByRole('dialog').id).toBe('study-panel-viewer');
  });

  it('Esc en el panel del visor no llega a la ventana (el visor no se cierra)', async () => {
    const user = userEvent.setup();
    const onWindowKey = vi.fn();
    window.addEventListener('keydown', onWindowKey);
    render(<StudyChip placement='viewer' store={store} />);

    await user.click(chip());
    await user.keyboard('{Escape}');
    window.removeEventListener('keydown', onWindowKey);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onWindowKey).not.toHaveBeenCalled();
  });
});

describe('StudyChip — confirmación y configuración', () => {
  it('el toast aparece debajo del chip visible, no en el del header con el visor abierto', () => {
    store.setSubject(SUBJECT);
    store.start();
    clock += 58 * MIN;
    store.startBreak();

    const { unmount } = render(<StudyChip placement='header' store={store} />);
    expect(screen.getByRole('status')).toHaveTextContent('+58 min de Cálculo II');
    unmount();

    act(() => store.setViewerOpen(true));
    render(
      <>
        <StudyChip placement='header' store={store} />
        <StudyChip placement='viewer' store={store} />
      </>,
    );
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('el engranaje abre la configuración dentro del panel y "Volver" regresa', async () => {
    const user = userEvent.setup();
    render(<StudyChip placement='header' store={store} />);

    await user.click(chip());
    await user.click(screen.getByRole('button', { name: 'Configuración' }));
    expect(screen.getByRole('heading', { name: 'Configuración' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Volver' }));
    expect(screen.getByRole('button', { name: 'Arrancar foco' })).toBeInTheDocument();
  });
});
