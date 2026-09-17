import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FacultySelector from './FacultySelector';

const twoFaculties = [
  { id: 'f1', label: 'Exactas' },
  { id: 'f2', label: 'Ingeniería' },
];

describe('FacultySelector', () => {
  it('no renderiza nada con menos de dos facultades', () => {
    const { container } = render(
      <FacultySelector options={[{ id: 'f1', label: 'Exactas' }]} value='f1' onChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('con dos o más facultades muestra el selector', () => {
    render(<FacultySelector options={twoFaculties} value='f2' onChange={vi.fn()} />);

    expect(screen.getByText('Facultad')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('Ingeniería');
  });
});
