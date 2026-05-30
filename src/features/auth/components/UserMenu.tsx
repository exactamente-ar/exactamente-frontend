import { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuthContext } from '@/features/auth/context/AuthContext';

function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function UserMenuInner() {
  const { user, loading, logout } = useAuthContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (loading || !user) return null;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen((v) => !v)}
        className='flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden hover:border-zinc-500 hover:bg-zinc-700 transition-all duration-200'
        aria-label='Menú de usuario'
      >
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.displayName} className='w-full h-full object-cover' referrerPolicy='no-referrer' />
        ) : (
          <span className='text-sm font-bold text-zinc-200'>{getInitials(user.displayName)}</span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 top-full mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/40 backdrop-blur-md overflow-hidden z-50'>
          <div className='px-4 py-3 border-b border-zinc-800'>
            <p className='text-sm font-semibold text-zinc-200 truncate'>{user.displayName}</p>
            <p className='text-xs text-zinc-500 truncate'>{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className='w-full px-4 py-3 text-sm text-left text-zinc-400 hover:text-white hover:bg-white/5 transition-colors duration-200 cursor-pointer'
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default function UserMenu() {
  return (
    <AuthProvider>
      <UserMenuInner />
    </AuthProvider>
  );
}
