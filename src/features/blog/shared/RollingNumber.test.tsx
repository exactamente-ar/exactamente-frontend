import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import RollingNumber from './RollingNumber';

describe('RollingNumber', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza el valor inicial sin animación', () => {
    render(<RollingNumber value={5} className='text-zinc-300' />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('animate-roll-in-up')).toBeNull();
  });

  it('anima hacia abajo (sale abajo, entra de arriba) cuando el valor aumenta', () => {
    const { rerender } = render(<RollingNumber value={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();

    rerender(<RollingNumber value={4} />);

    // Durante la animación deben verse ambos números
    expect(screen.getByText('3')).toHaveClass('animate-roll-out-down');
    expect(screen.getByText('4')).toHaveClass('animate-roll-in-down');

    // Al finalizar el timer, solo queda el número actual
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('3')).toBeNull();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('anima hacia arriba (sale arriba, entra de abajo) cuando el valor disminuye', () => {
    const { rerender } = render(<RollingNumber value={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();

    rerender(<RollingNumber value={4} />);

    expect(screen.getByText('5')).toHaveClass('animate-roll-out-up');
    expect(screen.getByText('4')).toHaveClass('animate-roll-in-up');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('5')).toBeNull();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
