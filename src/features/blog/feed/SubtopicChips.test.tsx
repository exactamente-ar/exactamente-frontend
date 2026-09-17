import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubtopicChips from './SubtopicChips';
import type { BlogSubtopic } from '../types/blog';

const subtopics: BlogSubtopic[] = [
  { id: 'general', name: 'General', slug: 'general', isDefault: true },
  { id: 'parciales', name: 'Parciales', slug: 'parciales', isDefault: false },
];

describe('SubtopicChips', () => {
  it('muestra una flecha y avanza cuando hay chips ocultos', async () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(500);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
    const scrollBy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
      configurable: true,
      value: scrollBy,
    });

    render(<SubtopicChips subtopics={subtopics} selected='general' onChange={vi.fn()} />);

    const arrow = screen.getByRole('button', { name: 'Ver más subtemas' });
    expect(arrow).toBeTruthy();

    await userEvent.click(arrow);

    expect(scrollBy).toHaveBeenCalledWith({ left: 150, behavior: 'smooth' });
  });

  it('no muestra la flecha cuando todos los chips entran', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);

    render(<SubtopicChips subtopics={subtopics} selected='general' onChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Ver más subtemas' })).toBeNull();
  });

  it('muestra la flecha izquierda al desplazarse y permite volver', async () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(500);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(100);
    const scrollBy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
      configurable: true,
      value: scrollBy,
    });

    render(<SubtopicChips subtopics={subtopics} selected='general' onChange={vi.fn()} />);

    const arrow = screen.getByRole('button', { name: 'Ver subtemas anteriores' });
    expect(arrow).toBeTruthy();

    await userEvent.click(arrow);

    expect(scrollBy).toHaveBeenCalledWith({ left: -150, behavior: 'smooth' });
  });
});
