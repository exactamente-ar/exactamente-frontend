import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardViewport } from './useKeyboardViewport';

describe('useKeyboardViewport', () => {
  const originalVisualViewport = window.visualViewport;
  const originalInnerHeight = window.innerHeight;

  let listeners: Record<string, (() => void)[]> = {};

  beforeEach(() => {
    listeners = {};
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      configurable: true,
      value: originalVisualViewport,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('devuelve isKeyboardOpen en false cuando no hay visualViewport', () => {
    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useKeyboardViewport());
    expect(result.current.isKeyboardOpen).toBe(false);
    expect(result.current.viewportHeight).toBeNull();
  });

  it('devuelve isKeyboardOpen en false cuando el viewport coincide con la ventana', () => {
    const mockViewport = {
      height: 800,
      width: 400,
      addEventListener: vi.fn((event: string, cb: () => void) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);
      }),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      configurable: true,
      value: mockViewport,
    });

    const { result } = renderHook(() => useKeyboardViewport());
    expect(result.current.isKeyboardOpen).toBe(false);
    expect(result.current.viewportHeight).toBe(800);
  });

  it('detecta apertura del teclado cuando visualViewport.height se reduce significativamente', () => {
    const mockViewport = {
      height: 800,
      width: 400,
      addEventListener: vi.fn((event: string, cb: () => void) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);
      }),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      configurable: true,
      value: mockViewport,
    });

    const { result } = renderHook(() => useKeyboardViewport());
    expect(result.current.isKeyboardOpen).toBe(false);

    // Simular apertura de teclado: viewport height cae a 450px (teclado mide 350px)
    act(() => {
      mockViewport.height = 450;
      listeners['resize']?.forEach((cb) => cb());
    });

    expect(result.current.isKeyboardOpen).toBe(true);
    expect(result.current.viewportHeight).toBe(450);

    // Simular cierre de teclado
    act(() => {
      mockViewport.height = 800;
      listeners['resize']?.forEach((cb) => cb());
    });

    expect(result.current.isKeyboardOpen).toBe(false);
    expect(result.current.viewportHeight).toBe(800);
  });
});
