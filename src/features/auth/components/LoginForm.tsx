import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { useLogin } from '../hooks/useLogin';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

function LoginFormInner() {
  const { email, setEmail, password, setPassword, error, submitting, handleSubmit } = useLogin();

  const getRedirect = () =>
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('redirect') ?? '/')
      : '/';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(getRedirect());
  };

  return (
    <div className='bg-zinc-900/90 rounded-xl border gradient-border p-6 w-full max-w-md mx-auto'>
      <h1 className='text-2xl font-bold text-foreground mb-2'>Iniciar sesión</h1>
      <p className='text-sm text-foreground-secondary mb-6'>Accedé para subir materiales de estudio</p>
      <form onSubmit={onSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-foreground-secondary'>Email</label>
          <Input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='tu@email.com' autoComplete='email' required />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-foreground-secondary'>Contraseña</label>
          <Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Tu contraseña' autoComplete='current-password' required />
        </div>
        {error && <p className='text-sm text-red-400'>{error}</p>}
        <Button type='submit' disabled={submitting} className='w-full'>
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
      <p className='mt-4 text-sm text-center text-foreground-secondary'>
        ¿No tenés cuenta?{' '}
        <a href='/register' className='text-white hover:underline font-medium'>Registrate</a>
      </p>
    </div>
  );
}

export default function LoginForm() {
  return (
    <AuthProvider>
      <LoginFormInner />
    </AuthProvider>
  );
}
