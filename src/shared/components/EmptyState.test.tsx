import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('muestra el título y la descripción', () => {
    render(
      <EmptyState title='Todavía no hay publicaciones' description='Sé el primero en preguntar.' />,
    );
    expect(screen.getByText('Todavía no hay publicaciones')).toBeTruthy();
    expect(screen.getByText('Sé el primero en preguntar.')).toBeTruthy();
  });

  it('renderiza el CTA como enlace cuando se pasan actionLabel y actionHref', () => {
    render(
      <EmptyState title='Vacío' actionLabel='Sé el primero en preguntar' actionHref='./nuevo' />,
    );
    const link = screen.getByRole('link', { name: 'Sé el primero en preguntar' });
    expect(link.getAttribute('href')).toBe('./nuevo');
  });

  it('no renderiza el CTA cuando no se pasa action', () => {
    render(<EmptyState title='Vacío' />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
