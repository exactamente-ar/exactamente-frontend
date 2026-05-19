import { useState } from 'react';
import { login as apiLogin } from '@/shared/services/api';
import { useAuth } from './useAuth';

export function useLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (redirectTo = '/') => {
    if (!email || !password) {
      setError('Completá todos los campos');
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await apiLogin(email, password);
    setSubmitting(false);
    if (result.error) {
      setError('Credenciales inválidas');
      return;
    }
    login(result.data.user, result.data.token);
    window.location.href = redirectTo;
  };

  return { email, setEmail, password, setPassword, error, submitting, handleSubmit };
}
