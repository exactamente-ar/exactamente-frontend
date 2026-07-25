import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SubmitButton from './SubmitButton';

const base = {
  isSubmitting: false,
  text: 'Enviar Recurso',
  submittingText: 'Subiendo...',
  errors: {},
};

describe('SubmitButton', () => {
  it('muestra el texto normal cuando no está enviando', () => {
    render(<SubmitButton {...base} />);
    expect(screen.getByRole('button', { name: /enviar recurso/i })).toBeInTheDocument();
  });

  it('se deshabilita y cambia el texto mientras envía', () => {
    render(<SubmitButton {...base} isSubmitting />);
    const boton = screen.getByRole('button', { name: /subiendo/i });
    expect(boton).toBeDisabled();
  });

  it('marca el borde rojo cuando hay un error de campo', () => {
    render(<SubmitButton {...base} errors={{ title: 'Falta el título' }} />);
    expect(screen.getByRole('button')).toHaveClass('border-red-500');
  });

  it('marca el borde rojo cuando hay un error de subida', () => {
    render(<SubmitButton {...base} uploadError='Se cayó el servidor' />);
    expect(screen.getByRole('button')).toHaveClass('border-red-500');
  });

  it('no marca error cuando el campo existe pero está vacío', () => {
    render(<SubmitButton {...base} errors={{ title: '' }} />);
    expect(screen.getByRole('button')).not.toHaveClass('border-red-500');
  });
});
