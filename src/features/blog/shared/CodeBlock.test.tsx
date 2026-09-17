import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  it('renderiza el badge del lenguaje y el contenido del código', () => {
    const code = 'const x = 10;';
    render(<CodeBlock code={code} language='typescript' />);

    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText(/const/)).toBeInTheDocument();
  });

  it('copia el código al portapapeles al hacer clic en el botón de copiar', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const code = 'console.log("copiar");';
    render(<CodeBlock code={code} language='javascript' />);

    const copyBtn = screen.getByRole('button', { name: /copiar/i });
    fireEvent.click(copyBtn);

    expect(writeText).toHaveBeenCalledWith(code);
    expect(await screen.findByText(/copiado/i)).toBeInTheDocument();
  });
});
