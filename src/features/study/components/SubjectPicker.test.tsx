import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORED_FACULTY_KEY } from '@/features/home/utils/storedFaculty';
import SubjectPicker from './SubjectPicker';

const api = vi.hoisted(() => ({ getCareers: vi.fn(), getSubjects: vi.fn() }));
vi.mock('@/shared/services/api', () => api);

beforeAll(() => {
  // cmdk measures its list and scrolls the active item; jsdom implements neither.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView ??= () => {};
});

beforeEach(() => {
  localStorage.clear();
  api.getCareers.mockReset().mockResolvedValue({
    data: [{ id: 'c1', name: 'Ing. en Sistemas', shortName: 'IS' }],
    error: null,
  });
  api.getSubjects.mockReset().mockResolvedValue({
    data: [{ id: 's1', title: 'Cálculo II' }],
    error: null,
  });
});

describe('SubjectPicker', () => {
  it('sin facultad elegida pide todas las carreras', async () => {
    render(<SubjectPicker value={null} onChange={vi.fn()} />);

    await waitFor(() => expect(api.getCareers).toHaveBeenCalledWith(undefined));
  });

  it('con facultad guardada filtra las carreras por ella', async () => {
    localStorage.setItem(
      STORED_FACULTY_KEY,
      JSON.stringify({ universityId: 'u1', facultyId: 'f9' }),
    );
    render(<SubjectPicker value={null} onChange={vi.fn()} />);

    await waitFor(() => expect(api.getCareers).toHaveBeenCalledWith({ facultyId: 'f9' }));
  });

  it('elegir carrera y materia devuelve los ids y los nombres', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCareerChange = vi.fn();
    render(<SubjectPicker value={null} onChange={onChange} onCareerChange={onCareerChange} />);

    await user.click(await screen.findByRole('combobox', { name: /^carrera/i }));
    await user.click(await screen.findByRole('option', { name: /ing\. en sistemas/i }));
    expect(onCareerChange).toHaveBeenCalledWith({
      careerId: 'c1',
      careerName: 'Ing. en Sistemas',
    });
    await waitFor(() => expect(api.getSubjects).toHaveBeenCalledWith({ careerId: 'c1' }));

    await user.click(screen.getByRole('combobox', { name: /^materia/i }));
    await user.click(await screen.findByRole('option', { name: /cálculo ii/i }));

    expect(onChange).toHaveBeenLastCalledWith({
      careerId: 'c1',
      careerName: 'Ing. en Sistemas',
      subjectId: 's1',
      subjectName: 'Cálculo II',
    });
  });

  it('preselecciona la última carrera y carga sus materias', async () => {
    render(<SubjectPicker value={null} onChange={vi.fn()} preferredCareerId='c1' />);

    await waitFor(() => expect(api.getSubjects).toHaveBeenCalledWith({ careerId: 'c1' }));
    expect(
      await screen.findByRole('combobox', { name: 'Carrera: Ing. en Sistemas' }),
    ).toBeInTheDocument();
  });

  it('si la API falla lo dice y permite reintentar', async () => {
    const user = userEvent.setup();
    api.getCareers.mockResolvedValueOnce({ data: [], error: 'boom' });
    render(<SubjectPicker value={null} onChange={vi.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar las materias.');
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(api.getCareers).toHaveBeenCalledTimes(2);
  });
});
