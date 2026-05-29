# Auth Feature Implementation Plan — Google OAuth

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete auth system using Google OAuth only. No email/password. Flow: click → redirect to backend → Google → callback page stores JWT → redirect to intended destination.

**Architecture:** `src/features/auth/` provides AuthProvider (per-island), AuthGuard, and GoogleLoginButton. Each island mounts its own AuthProvider that hydrates from `localStorage["exactamente_auth"]` and verifies with `GET /api/v1/auth/me` on mount. Backend handles the OAuth exchange and redirects to `/auth/callback?token=JWT`. A new `src/pages/auth/callback.astro` page reads the token, stores it, and redirects.

**Backend (not implemented here — document for backend team):**
- `GET /api/v1/auth/google` → redirect to Google OAuth consent
- `GET /api/v1/auth/google/callback` → exchange code, find/create user, redirect to `${FRONTEND_URL}/auth/callback?token=JWT`
- `GET /api/v1/auth/me` — already expected to exist

**Tech Stack:** React 19, TypeScript strict, shadcn/ui (`Button`), Tailwind v4, Astro 5, `@/` alias

---

## File Map

**New:**
- `src/features/auth/types/auth.ts`
- `src/features/auth/context/AuthContext.tsx`
- `src/features/auth/hooks/useAuth.ts`
- `src/features/auth/components/AuthGuard.tsx`
- `src/features/auth/components/GoogleLoginButton.tsx`
- `src/pages/login.astro`
- `src/pages/auth/callback.astro`

**Modified:**
- `src/shared/services/api.ts` — add `getMe`

---

## Task 1: Auth types

**Files:**
- Create: `src/features/auth/types/auth.ts`

- [ ] **Create file**

```ts
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'superadmin';
}

export interface AuthState {
  user: PublicUser | null;
  token: string | null;
  loading: boolean;
}
```

- [ ] **Commit**

```bash
git add src/features/auth/types/auth.ts
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(auth): add auth types"
```

---

## Task 2: Add getMe to api.ts

**Files:**
- Modify: `src/shared/services/api.ts`

- [ ] **Add import at top of api.ts** (after existing imports):

```ts
import type { PublicUser } from '@/features/auth/types/auth';
```

- [ ] **Add getMe at end of api.ts:**

```ts
export async function getMe(token: string): Promise<ApiResult<PublicUser>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return { data: [], error: `Request failed with status ${response.status}` };
    const json: { user: PublicUser } = await response.json();
    return { data: json.user, error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : 'Unknown error fetching user' };
  }
}
```

- [ ] **Build check**

```bash
pnpm build
```

- [ ] **Commit**

```bash
git add src/shared/services/api.ts
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(api): add getMe"
```

---

## Task 3: AuthContext + AuthProvider

**Files:**
- Create: `src/features/auth/context/AuthContext.tsx`

- [ ] **Create file**

```tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { PublicUser, AuthState } from '../types/auth';
import { getMe } from '@/shared/services/api';

const STORAGE_KEY = 'exactamente_auth';

interface AuthContextValue extends AuthState {
  login: (user: PublicUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as { user: PublicUser; token: string };
      getMe(parsed.token).then((result) => {
        if (result.error) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          setUser(result.data);
          setToken(parsed.token);
        }
        setLoading(false);
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
    }
  }, []);

  const login = (user: PublicUser, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider');
  return ctx;
}
```

- [ ] **Commit**

```bash
git add src/features/auth/context/AuthContext.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(auth): add AuthContext + AuthProvider"
```

---

## Task 4: useAuth hook

**Files:**
- Create: `src/features/auth/hooks/useAuth.ts`

- [ ] **Create file**

```ts
import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  return useAuthContext();
}
```

- [ ] **Commit**

```bash
git add src/features/auth/hooks/useAuth.ts
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(auth): add useAuth hook"
```

---

## Task 5: AuthGuard

**Files:**
- Create: `src/features/auth/components/AuthGuard.tsx`

- [ ] **Create file**

```tsx
import React, { type ReactNode, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { loading, token } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      const pathname = window.location.pathname;
      sessionStorage.setItem('auth_redirect', pathname);
      window.location.href = '/login';
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
```

Note: el redirect destino se guarda en `sessionStorage["auth_redirect"]` antes de ir a `/login`. La página callback lo lee y redirige ahí después del OAuth.

- [ ] **Commit**

```bash
git add src/features/auth/components/AuthGuard.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(auth): add AuthGuard"
```

---

## Task 6: GoogleLoginButton + login page

**Files:**
- Create: `src/features/auth/components/GoogleLoginButton.tsx`
- Create: `src/pages/login.astro`

- [ ] **Create GoogleLoginButton.tsx**

```tsx
import React from 'react';
import { Button } from '@/shared/components/ui/button';

const GOOGLE_AUTH_URL = `${import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1/auth/google`;

export function GoogleLoginButton() {
  return (
    <Button
      type='button'
      variant='outline'
      className='w-full gap-3'
      onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}
    >
      <svg width='18' height='18' viewBox='0 0 18 18' aria-hidden='true'>
        <path fill='#4285F4' d='M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z'/>
        <path fill='#34A853' d='M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z'/>
        <path fill='#FBBC05' d='M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z'/>
        <path fill='#EA4335' d='M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z'/>
      </svg>
      Continuar con Google
    </Button>
  );
}
```

- [ ] **Create src/pages/login.astro**

```astro
---
import Layout from "@/layouts/Layout.astro";
import ContainerSection from "@/shared/components/ContainerSection.astro";
import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton";
---

<Layout>
  <ContainerSection id="login">
    <div class="flex justify-center py-16">
      <div class="bg-zinc-900/90 rounded-xl border gradient-border p-8 w-full max-w-sm mx-auto text-center space-y-6">
        <div class="space-y-2">
          <h1 class="text-2xl font-bold text-foreground">Iniciar sesión</h1>
          <p class="text-sm text-foreground-secondary">Usamos Google para autenticarte de forma segura</p>
        </div>
        <GoogleLoginButton client:load />
      </div>
    </div>
  </ContainerSection>
</Layout>
```

- [ ] **Commit**

```bash
git add src/features/auth/components/GoogleLoginButton.tsx src/pages/login.astro
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(auth): add GoogleLoginButton and login page"
```

---

## Task 7: Callback page

**Files:**
- Create: `src/pages/auth/callback.astro`

This page receives `?token=JWT&user=<base64 JSON>` from the backend after OAuth, stores the auth in localStorage, and redirects to the intended destination.

- [ ] **Create src/pages/auth/callback.astro**

```astro
---
import Layout from "@/layouts/Layout.astro";
---

<Layout>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-8 h-8 border-2 border-primary/30 border-t-white rounded-full animate-spin" />
  </div>
</Layout>

<script>
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const userRaw = params.get('user');

  if (token && userRaw) {
    try {
      const user = JSON.parse(atob(userRaw));
      localStorage.setItem('exactamente_auth', JSON.stringify({ user, token }));
    } catch {
      // malformed user param — proceed without storing
    }
    const redirect = sessionStorage.getItem('auth_redirect') ?? '/';
    sessionStorage.removeItem('auth_redirect');
    window.location.replace(redirect);
  } else {
    // No token — backend error or direct navigation
    window.location.replace('/login');
  }
</script>
```

Note: el backend debe enviar `user` como JSON en base64 en la query string. Si el backend prefiere solo `token` y que el frontend llame a `getMe`, se puede adaptar: leer el token, guardarlo sin user, llamar a getMe desde el callback, luego redirigir.

- [ ] **Build check**

```bash
pnpm build
```

Expected: clean build, rutas `/login` y `/auth/callback` existen en output.

- [ ] **Commit**

```bash
git add src/pages/auth/callback.astro
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(auth): add OAuth callback page"
```

---

## Notas para el backend

El backend debe implementar:

```
GET /api/v1/auth/google
  → redirect a Google OAuth con scope: email, profile

GET /api/v1/auth/google/callback
  → intercambia code por token de Google
  → busca user por email, crea si no existe
  → genera JWT
  → redirect a ${FRONTEND_URL}/auth/callback?token=JWT&user=<base64(JSON.stringify(publicUser))>
```

Con Hono: `@hono/oauth-providers` tiene `googleAuth()` middleware listo para usar.
