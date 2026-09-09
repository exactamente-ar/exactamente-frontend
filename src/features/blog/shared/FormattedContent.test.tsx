import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormattedContent } from './FormattedContent';

describe('FormattedContent', () => {
  it('renderiza texto plano con saltos de línea', () => {
    const text = 'Línea 1\nLínea 2';
    render(<FormattedContent text={text} />);
    expect(screen.getByText(/Línea 1/)).toBeInTheDocument();
    expect(screen.getByText(/Línea 2/)).toBeInTheDocument();
  });

  it('renderiza código inline con estilo adecuado', () => {
    const text = 'Usa `git status` para ver los cambios.';
    render(<FormattedContent text={text} />);
    const codeEl = screen.getByText('git status');
    expect(codeEl.tagName).toBe('CODE');
  });

  it('renderiza bloque de código con badge de lenguaje y botón copiar', () => {
    const text = '```python\nprint("hola mundo")\n```';
    render(<FormattedContent text={text} />);
    expect(screen.getByText('python')).toBeInTheDocument();
    expect(screen.getByText(/print/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copiar/i })).toBeInTheDocument();
  });

  it('renderiza fórmula LaTeX en bloque vía KaTeX', () => {
    const text = '$$E = mc^2$$';
    const { container } = render(<FormattedContent text={text} />);
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });

  it('renderiza fórmula LaTeX inline', () => {
    const text = 'La energía es $E = mc^2$ en reposo.';
    const { container } = render(<FormattedContent text={text} />);
    expect(container.querySelector('.katex')).toBeInTheDocument();
    expect(screen.getByText(/La energía es/)).toBeInTheDocument();
  });

  it('tolera sintaxis LaTeX inválida sin arrojar error', () => {
    const text = '$$\\invalidcommand{{{$$';
    expect(() => render(<FormattedContent text={text} />)).not.toThrow();
  });
});
