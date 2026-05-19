import React, { type ReactNode, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { loading, token } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      const pathname = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
    }
  }, [loading, token]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='w-8 h-8 border-2 border-primary/30 border-t-white rounded-full animate-spin' />
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
