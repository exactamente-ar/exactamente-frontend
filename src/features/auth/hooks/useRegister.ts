import { useState } from 'react';
import { register as apiRegister } from '@/shared/services/api';
import { useAuth } from './useAuth';

export function useRegister() {
  const { login } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): string | null => {
    if (!displayName.trim()) return 'Ingresá tu nombre';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await apiRegister(email, password, displayName);
    setSubmitting(false);
    if (result.error) {
      setError(result.error.includes('409') ? 'Ya existe una cuenta con ese email' : 'Error al registrarse. Intentá de nuevo.');
      return;
    }
    login(result.data.user, result.data.token);
    window.location.href = '/';
  };

  return { displayName, setDisplayName, email, setEmail, password, setPassword, error, submitting, handleSubmit };
}
