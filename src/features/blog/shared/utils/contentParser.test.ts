import { describe, it, expect } from 'vitest';
import { parseContent } from './contentParser';

describe('contentParser', () => {
  it('parsea texto plano sin tokens especiales', () => {
    const text = 'Hola mundo, este es un post normal.';
    const tokens = parseContent(text);
    expect(tokens).toEqual([{ type: 'text', content: text }]);
  });

  it('retorna array vacío para texto vacío', () => {
    expect(parseContent('')).toEqual([]);
    expect(parseContent('   ')).toEqual([]);
  });

  it('parsea un bloque de código con lenguaje', () => {
    const text = '```python\ndef suma(a, b):\n    return a + b\n```';
    const tokens = parseContent(text);
    expect(tokens).toEqual([
      {
        type: 'code-block',
        language: 'python',
        content: 'def suma(a, b):\n    return a + b',
      },
    ]);
  });

  it('parsea un bloque de código sin lenguaje explícito', () => {
    const text = '```\nconsole.log("hello");\n```';
    const tokens = parseContent(text);
    expect(tokens).toEqual([
      {
        type: 'code-block',
        language: 'plaintext',
        content: 'console.log("hello");',
      },
    ]);
  });

  it('parsea código inline con backticks simples', () => {
    const text = 'Ejecutá `bun test` para correr los tests.';
    const tokens = parseContent(text);
    expect(tokens).toEqual([
      { type: 'text', content: 'Ejecutá ' },
      { type: 'inline-code', content: 'bun test' },
      { type: 'text', content: ' para correr los tests.' },
    ]);
  });

  it('parsea fórmulas matemáticas en bloque ($$...$$)', () => {
    const text = 'La integral es:\n$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$\nfin.';
    const tokens = parseContent(text);
    expect(tokens).toEqual([
      { type: 'text', content: 'La integral es:\n' },
      {
        type: 'block-math',
        content: '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
      },
      { type: 'text', content: '\nfin.' },
    ]);
  });

  it('parsea fórmulas matemáticas inline ($...$)', () => {
    const text = 'Sea $f(x) = x^2 + 2x + 1$ una función cuadrática.';
    const tokens = parseContent(text);
    expect(tokens).toEqual([
      { type: 'text', content: 'Sea ' },
      { type: 'inline-math', content: 'f(x) = x^2 + 2x + 1' },
      { type: 'text', content: ' una función cuadrática.' },
    ]);
  });

  it('combina texto, código y fórmulas en un solo mensaje', () => {
    const text =
      'Definimos $A \\in \\mathbb{R}^{n \\times n}$.\n' +
      'En Python se calcula así:\n' +
      '```python\nimport numpy as np\nA = np.eye(3)\n```\n' +
      'Luego evaluamos $$det(A) = 1$$ listo.';

    const tokens = parseContent(text);
    expect(tokens).toHaveLength(7);
    expect(tokens[0]).toEqual({ type: 'text', content: 'Definimos ' });
    expect(tokens[1]).toEqual({ type: 'inline-math', content: 'A \\in \\mathbb{R}^{n \\times n}' });
    expect(tokens[2]).toEqual({ type: 'text', content: '.\nEn Python se calcula así:\n' });
    expect(tokens[3]).toEqual({
      type: 'code-block',
      language: 'python',
      content: 'import numpy as np\nA = np.eye(3)',
    });
    expect(tokens[4]).toEqual({ type: 'text', content: '\nLuego evaluamos ' });
    expect(tokens[5]).toEqual({ type: 'block-math', content: 'det(A) = 1' });
    expect(tokens[6]).toEqual({ type: 'text', content: ' listo.' });
  });

  it('no confunde precios con fórmulas matemáticas', () => {
    const text = 'El libro sale $500 y el apunte $300.';
    const tokens = parseContent(text);
    expect(tokens).toEqual([{ type: 'text', content: text }]);
  });

  it('colapsa más de dos líneas en blanco consecutivas en texto plano', () => {
    const text = 'Párrafo 1\n\n\n\n\n\nPárrafo 2';
    const tokens = parseContent(text);
    expect(tokens).toEqual([{ type: 'text', content: 'Párrafo 1\n\n\nPárrafo 2' }]);
  });
});
