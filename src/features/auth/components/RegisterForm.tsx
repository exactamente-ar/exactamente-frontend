import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { useRegister } from '../hooks/useRegister';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

function RegisterFormInner() {
  const { displayName, setDisplayName, email, setEmail, password, setPassword, error, submitting, handleSubmit } = useRegister();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className='bg-zinc-900/90 rounded-xl border gradient-border p-6 w-full max-w-md mx-auto'>
      <h1 className='text-2xl font-bold text-foreground mb-2'>Crear cuenta</h1>
      <p className='text-sm text-foreground-secondary mb-6'>Registrate para subir materiales de estudio</p>
      <form onSubmit={onSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-foreground-secondary'>Nombre</label>
          <Input type='text' value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder='Tu nombre' autoComplete='name' required />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-foreground-secondary'>Email</label>
          <Input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='tu@email.com' autoComplete='email' required />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-foreground-secondary'>Contraseña</label>
          <Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Mínimo 8 caracteres' autoComplete='new-password' required minLength={8} />
        </div>
        {error && <p className='text-sm text-red-400'>{error}</p>}
        <Button type='submit' disabled={submitting} className='w-full'>
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
      <p className='mt-4 text-sm text-center text-foreground-secondary'>
        ¿Ya tenés cuenta?{' '}
        <a href='/login' className='text-white hover:underline font-medium'>Iniciá sesión</a>
      </p>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <AuthProvider>
      <RegisterFormInner />
    </AuthProvider>
  );
}
