import React, { type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const { loading, token } = useAuth();

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='w-8 h-8 border-2 border-primary/30 border-t-white rounded-full animate-spin' />
      </div>
    );
  }

  if (!token) return <>{fallback}</>;

  return <>{children}</>;
}
