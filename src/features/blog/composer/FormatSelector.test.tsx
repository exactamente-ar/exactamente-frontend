import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormatSelector } from './FormatSelector';

describe('FormatSelector', () => {
  it('renderiza el botón para abrir el selector de formatos', () => {
    render(<FormatSelector onSelectFormat={vi.fn()} />);
    expect(screen.getByRole('button', { name: /formato de código/i })).toBeInTheDocument();
  });

  it('despliega las opciones de lenguajes y LaTeX al hacer clic', () => {
    render(<FormatSelector onSelectFormat={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: /formato de código/i });
    fireEvent.click(trigger);

    expect(screen.getByText('LaTeX (Fórmula)')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('C / C++')).toBeInTheDocument();
    expect(screen.getByText('Haskell')).toBeInTheDocument();
  });

  it('llama a onSelectFormat con la plantilla correspondiente al elegir una opción', () => {
    const onSelect = vi.fn();
    render(<FormatSelector onSelectFormat={onSelect} />);

    const trigger = screen.getByRole('button', { name: /formato de código/i });
    fireEvent.click(trigger);

    const pythonOption = screen.getByText('Python');
    fireEvent.click(pythonOption);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expect.stringContaining('```python'));
  });

  it('inserta plantilla LaTeX al elegir la opción LaTeX', () => {
    const onSelect = vi.fn();
    render(<FormatSelector onSelectFormat={onSelect} />);

    const trigger = screen.getByRole('button', { name: /formato de código/i });
    fireEvent.click(trigger);

    const latexOption = screen.getByText('LaTeX (Fórmula)');
    fireEvent.click(latexOption);

    expect(onSelect).toHaveBeenCalledWith('$$\n\n$$');
  });
});
