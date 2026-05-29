# Upload Resources + Auth — Design Spec

**Date:** 2026-05-18  
**Updated:** 2026-05-22 — auth cambiado a Google OAuth (sin email/password)  
**Status:** Approved

---

## Objetivo

Reemplazar el flujo de upload via Google Drive/Apps Script por un upload directo al backend REST (`POST /api/v1/resources`), añadiendo un sistema de autenticación via Google OAuth como prerequisito.

---

## Arquitectura general

Dos subsistemas nuevos/modificados:

1. **`src/features/auth/`** — nueva feature completa (solo Google OAuth)
2. **`src/features/upload/`** — reescritura del hook, form y FileInput

La fuente de verdad del auth es `localStorage` (clave: `exactamente_auth`). Cada island de Astro que necesite auth monta su propio `AuthProvider`, que hidrata desde `localStorage` de forma independiente.

```
src/
├── features/
│   ├── auth/
│   │   ├── components/   AuthGuard, GoogleLoginButton
│   │   ├── context/      AuthContext.tsx
│   │   ├── hooks/        useAuth
│   │   └── types/        auth.ts
│   └── upload/
│       ├── components/   UploadForm, FileInput (renovado), UploadSection (con AuthGuard)
│       ├── hooks/        useUploadForm (reescrito)
│       └── types/        form.ts (actualizado)
├── pages/
│   ├── login.astro           (nueva — muestra GoogleLoginButton)
│   └── auth/
│       └── callback.astro    (nueva — recibe token del backend, guarda en localStorage)
└── shared/services/
    └── api.ts            + getMe, uploadResource
```

---

## Feature Auth

### Tipos (`auth.ts`)

```ts
interface PublicUser {
  id: string
  email: string
  displayName: string
  role: 'user' | 'admin' | 'superadmin'
}

interface AuthState {
  user: PublicUser | null
  token: string | null
  loading: boolean
}
```

No hay `LoginFormData` ni `RegisterFormData` — Google maneja registro y login.

### `AuthContext`

Estado: `{ user, token, loading }`.  
Acciones: `login(user, token)` y `logout()`.

**Hydration on mount:**
1. Lee `localStorage["exactamente_auth"]` → `{ user, token }`
2. Si existe token → llama `GET /api/v1/auth/me`
   - Éxito → setUser + setToken, loading = false
   - Error → borra localStorage, loading = false
3. Si no existe → loading = false directo

### `AuthGuard`

```
loading=true  → spinner centrado
token=null    → guarda pathname en sessionStorage["auth_redirect"], redirige a /login
token presente → renderiza children
```

### `GoogleLoginButton`

Botón que redirige a `${PUBLIC_API_URL}/api/v1/auth/google`. El backend maneja el OAuth flow y al final redirige a `/auth/callback?token=JWT&user=<base64>`.

### Página `/auth/callback`

Script client-side que:
1. Lee `token` y `user` de query params
2. Guarda en `localStorage["exactamente_auth"]`
3. Lee `sessionStorage["auth_redirect"]`, redirige ahí (fallback: `/`)

### Página `/login`

Solo muestra `GoogleLoginButton`. Sin formulario, sin campos.

### Hooks

- **`useAuth()`** — consume `AuthContext`, devuelve `{ user, token, loading, login, logout }`

No hay `useLogin` ni `useRegister`.

---

## Feature Upload (reescritura)

### Campos del form

| Campo | Tipo | Requerido | Backend field |
|---|---|---|---|
| carrera | Select | ✓ | — (solo para filtrar materias) |
| plan | Select | ✓ | — (solo para filtrar materias) |
| materia | Select | ✓ | `subjectId` |
| tipoRecurso | Select | ✓ | `type` |
| period | TextInput | — | `period` (max 20 chars) |
| notes | TextArea | — | `notes` |
| archivo | FileInput renovado | ✓ | `file` (PDF) |

Se eliminan: `titulo`, reCAPTCHA.

### FileInput renovado

Dos modos con toggle explícito:

**Modo PDF:**
- Selector de 1 archivo `.pdf`
- Muestra nombre + tamaño
- Límite: 20MB

**Modo Imágenes:**
- Selector múltiple `.jpg/.jpeg/.png`
- Muestra thumbnails con posibilidad de reordenar
- Máx 10 imágenes
- Conversión a PDF con `jspdf` justo antes del submit
- El PDF resultante no puede superar 20MB — se valida post-conversión

En ambos modos, el backend siempre recibe un PDF.

### `useUploadForm` (reescrito)

Flujo de submit:
1. Validar campos requeridos
2. Si `fileMode === 'images'`: convertir imágenes a PDF con `jspdf`
3. Validar tamaño del PDF resultante (≤ 20MB)
4. Llamar `api.uploadResource({ subjectId, type, file, period?, notes? }, token)`
5. Error 401 → `logout()` + redirect a `/login`
6. Éxito → mostrar `SuccessModal`

Token obtenido de `useAuth().token`.

### `UploadSection`

Wrappea el contenido con `<AuthProvider><AuthGuard>`. `AuthProvider` hidrata desde localStorage; `AuthGuard` guarda la ruta en `sessionStorage` y redirige a `/login` si no hay token.

---

## API (`api.ts`) — funciones nuevas

```ts
getMe(token: string): Promise<ApiResult<PublicUser>>
uploadResource(
  data: { subjectId: string; type: string; file: File; period?: string; notes?: string },
  token: string
): Promise<ApiResult<Resource>>
```

`uploadResource` usa `fetch` con `FormData` (multipart/form-data) y header `Authorization: Bearer <token>`. No usa `withCache`.

No hay `login()` ni `register()` en api.ts.

---

## Backend (a implementar)

```
GET /api/v1/auth/google
  → redirect a Google OAuth (scope: email, profile)

GET /api/v1/auth/google/callback
  → intercambia code, busca/crea user, genera JWT
  → redirect a ${FRONTEND_URL}/auth/callback?token=JWT&user=<base64(JSON.stringify(publicUser))>

GET /api/v1/auth/me
  → devuelve PublicUser del token
```

Con Hono: `@hono/oauth-providers` tiene `googleAuth()` listo para usar.

---

## Variables de entorno

Se eliminan (ya no necesarias):
- `PUBLIC_RECAPTCHA_SITE_KEY`
- `PUBLIC_GOOGLE_SCRIPT_URL`

Se mantiene:
- `PUBLIC_API_URL`

---

## Dependencias nuevas

- `jspdf` — conversión de imágenes a PDF en el cliente

---

## Archivos afectados

### Nuevos
- `src/features/auth/types/auth.ts`
- `src/features/auth/context/AuthContext.tsx`
- `src/features/auth/hooks/useAuth.ts`
- `src/features/auth/components/AuthGuard.tsx`
- `src/features/auth/components/GoogleLoginButton.tsx`
- `src/pages/login.astro`
- `src/pages/auth/callback.astro`

### Modificados
- `src/shared/services/api.ts` — +getMe, +uploadResource
- `src/features/upload/types/form.ts` — nuevo FormData
- `src/features/upload/hooks/useUploadForm.ts` — reescritura completa
- `src/features/upload/components/UploadForm.tsx` — nuevos campos
- `src/features/upload/components/FileInput.tsx` — renovación con modos PDF/Imágenes
- `src/features/upload/components/UploadSection.tsx` — wrap con AuthGuard
- `src/features/upload/components/SuccesModal.tsx` — nuevo texto de moderación
