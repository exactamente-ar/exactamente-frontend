# AGENTS.md

Guía para cualquier agente de IA que trabaje en este repositorio.

---

## 0. Reglas que no se negocian

### Esto es Astro, no Next.js

Astro 5 con islands de React. No son lo mismo y las APIs difieren. Antes de escribir código que toque routing, SSR, hidratación o el build, **leé los docs de la versión instalada** en `node_modules/astro/` — no tu memoria de una versión anterior ni la documentación de Next.

Diferencias que más se confunden:

- No hay App Router ni Pages Router. El routing es file-based en `src/pages/`, y punto.
- Los componentes `.astro` no se hidratan nunca. No tienen estado ni event handlers de React.
- `client:load` / `client:visible` son directivas de Astro, no de React.
- No existe `'use client'`. No lo agregues.

### TDD obligatorio

Antes de escribir código de implementación, escribí un test que falle. Después el código mínimo para que pase.

- El test tiene que fallar primero, y tenés que **verlo fallar**. Un test que pasa de entrada no prueba nada.
- `pnpm test` tiene que estar en verde antes de decir que algo está listo.
- Nunca al revés: implementación primero y test después "para cubrir".

Qué se testea bien acá y qué no:

| Qué                               | Cómo                                  | Cuánto rinde |
| --------------------------------- | ------------------------------------- | ------------ |
| Funciones puras, mappers, helpers | Vitest directo                        | Mucho        |
| Hooks                             | Vitest + `@testing-library/react`     | Mucho        |
| Islands de React (`.tsx`)         | Testing Library, render + interacción | Bastante     |
| Componentes `.astro`              | Container API, render a string        | Poco         |

Los tests de `.astro` necesitan `// @vitest-environment node` como primera línea: jsdom reemplaza `TextEncoder` por una versión cuyo `Uint8Array` es de otro realm, y esbuild (que usa el compilador de Astro por debajo) valida ese invariante y explota. Como se renderiza a string, no hace falta DOM.

No fuerces tests de `.astro` donde no aporten. Si un componente `.astro` es markup estático, testearlo es escribir el HTML dos veces.

### Production-first

El objetivo es shippear, no demostrar.

- Nada de tech debt intencional: sin "después lo arreglo", sin controles falsos, sin stubs para algo que está en scope.
- Si algo está en scope, se termina de verdad; si no, se saca del scope explícitamente. No se entrega a medias.
- Nada de `eslint-disable` sin una línea que explique por qué. Los que existen hoy están justificados en el código.

---

## 1. Comandos

```bash
pnpm install         # Instala deps + engancha los git hooks (lefthook)
pnpm dev             # Dev server en http://localhost:4321
pnpm build           # Build de producción → dist/
pnpm preview         # Sirve el build local

pnpm test            # Suite completa (Vitest)
pnpm test:watch      # Watch mode
pnpm typecheck       # astro check
pnpm lint            # ESLint (.ts, .tsx, .astro)
pnpm format          # Prettier --write
pnpm format:check    # Prettier --check (es lo que corre el CI)
```

### Gates automáticos

No dependen de que te acuerdes:

- **pre-commit**: prettier (arregla y re-stagea), eslint y `vitest --changed`, solo sobre archivos staged.
- **pre-push**: `typecheck` y suite completa.
- **commit-msg**: commitlint con conventional commits.
- **CI** (PRs a `master`): typecheck, lint, format:check, test y build.

Los commits siguen conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `style:`, `ci:`). No es opcional, el hook lo valida.

---

## 2. Metodología BMad

Los skills de BMad están versionados en `.claude/skills/` y son parte del flujo, no un extra.

| Cuando necesitás...                     | Usá el skill                    |
| --------------------------------------- | ------------------------------- |
| Arrancar cualquier feature nueva        | `bmad-brainstorming`            |
| Crear o revisar requerimientos          | `bmad-prd`                      |
| Partir requerimientos en épicas/stories | `bmad-create-epics-and-stories` |
| Implementar una story                   | `bmad-dev-story`                |
| Cambio chico sin ceremonia completa     | `bmad-quick-dev`                |
| Code review                             | `bmad-code-review`              |
| Definir arquitectura                    | `bmad-architecture`             |
| Escribir tests de aceptación (ATDD)     | `bmad-testarch-atdd`            |
| Ampliar cobertura de tests              | `bmad-testarch-automate`        |
| Revisar la calidad de los tests         | `bmad-testarch-test-review`     |
| No sabés qué sigue                      | `bmad-help`                     |

Reglas: PRD antes que código, aunque sea liviano. TDD funciona dentro de BMad, no lo reemplaza. Los artefactos van a `_bmad-output/`.

---

## 3. Qué es el proyecto

**Exactamente** es un hub educativo donde estudiantes universitarios encuentran y suben material de estudio (resúmenes, parciales y finales) por materia. Producción: `https://exactamente.com.ar`.

**Stack:**

- **Framework**: Astro 5 (islands, SSR vía adapter de Vercel)
- **UI interactiva**: React 19 (`client:load` / `client:visible`)
- **Componentes**: shadcn/ui (Radix + CVA + tailwind-merge) en `src/shared/components/ui/`
- **Estilos**: Tailwind v4 como plugin de Vite, sin `tailwind.config.js`
- **Tipado**: TypeScript strict (`astro/tsconfigs/strict`)
- **Fuente**: Rubik Variable · **Iconos**: lucide-react + custom
- **Command menu**: cmdk (en `FilterCombobox`) · **WebGL**: OGL (fondo Aurora)
- **PDFs**: jspdf (convierte imágenes a PDF en el upload)
- **Deploy**: Vercel · **Package manager**: pnpm

---

## 4. Arquitectura

```
src/
├── core/global.css          # CSS global + variables de tema (@theme)
├── layouts/Layout.astro     # Layout base
├── pages/                   # Routing file-based
│   ├── index.astro
│   ├── upload.astro
│   ├── auth/
│   └── [id]/{resumenes,parciales,finales}.astro   # SSR puras
├── features/
│   ├── auth/     components, context, hooks, types
│   ├── home/     components, constants, hooks, types, utils
│   ├── resource/ components, hooks, services, types
│   └── upload/   components, hooks, types
└── shared/
    ├── components/  Header, Footer, Aurora, icons/, ui/
    ├── lib/utils.ts
    ├── services/api.ts
    └── types/
```

### Modelo de componentes

- **`.astro`**: server-rendered, cero JS en el cliente. Layouts, secciones estáticas, iconos fuera de React.
- **`.tsx` con `client:load`**: hidratados al toque. Vistas interactivas visibles de entrada.
- **`.tsx` con `client:visible`**: hidratados al entrar en viewport.

### Routing SSR

`[id]/resumenes.astro`, `[id]/parciales.astro` y `[id]/finales.astro` tienen `export const prerender = false`. Resuelven la materia en el servidor y redirigen a `/` si no existe. No agregar `getStaticPaths()` sin entender el impacto en el deploy.

---

## 5. Backend

Repo aparte: `../exactamente-backend` (Bun + Hono + PostgreSQL/Drizzle).

- **Base URL**: `/api/v1` — se configura con `PUBLIC_API_URL`
- **Paginación**: `{ data, total, page, totalPages }`. Excepción: `GET /careers` devuelve `{ data }` sin paginar.
- **Errores**: `{ "error": "mensaje" }` con códigos HTTP estándar
- **Archivos**: los PDFs se sirven desde Cloudflare R2 y la URL ya viene resuelta en `fileUrl`. No armes URLs a mano.
- **Auth**: bearer token, guardado en localStorage bajo `exactamente_auth`

---

## 6. Convenciones

### Naming

| Elemento    | Convención                   | Ejemplo                  |
| ----------- | ---------------------------- | ------------------------ |
| Componentes | PascalCase                   | `CardSubject.tsx`        |
| Hooks       | camelCase + `use`            | `useSubjects.ts`         |
| Tipos       | PascalCase, en `types/`      | `Subject`, `FilterT`     |
| Constantes  | SCREAMING_SNAKE_CASE         | `INITIAL_FILTERS`        |
| Servicios   | camelCase                    | `getSubjects`            |
| Tests       | junto al archivo que testean | `api.ts` → `api.test.ts` |

### Estructura por feature

Cada feature repite la misma estructura interna: `components/`, `hooks/`, `types/`, `constants/`, `services/`, `utils/`. No mezclar lógica entre features.

### Consumo de API

**Todo el HTTP pasa por `src/shared/services/api.ts`.** Nunca `fetch` directo en componentes ni hooks.

El patrón de retorno es:

```ts
type ApiResult<T> = { data: T; error: null } | { data: []; error: string };
```

Ojo con esto: **narrowear con `if (!result.error)` no funciona**. `""` también es falsy, así que TypeScript no puede descartar la rama de error y `data` queda tipado como `T | []`. El discriminante correcto es explícito:

```ts
if (result.error === null) {
  // acá data es T
}
```

Los tipos de backend (`BackendSubject`, `BackendResource`) se mapean a tipos internos (`Subject`, `ResourceFetch`) dentro de `api.ts`. Los componentes nunca ven tipos de backend.

`api.ts` también tiene un cache con TTL de 60s que deduplica requests concurrentes a la misma URL (`withCache`). Está cubierto por tests: si lo tocás, corrélos.

### Estado

Sin librería global. Hooks de React: `useSubjects`, `useFilterState`, `useFilterOptions`, `useResolvedDefaultScope`, `useCorrelatives`, `useResources`, `usePreview`, `useUploadForm`, `useAuth`.

### Path alias

`@/*` → `src/*`. Usar siempre en vez de rutas relativas profundas.

### shadcn/ui

Los componentes de `src/shared/components/ui/` son primitivos de shadcn. Para agregar uno: `pnpm dlx shadcn@latest add <componente>`. No los edites a mano salvo que sea imprescindible. Para combinar clases, `cn()` de `@/shared/lib/utils`.

### Estilos

Tailwind v4, sin archivo de config. Las customizaciones van en `src/core/global.css` con `@theme`. Clases de Tailwind directo en el markup; no crear CSS por componente.

---

## 7. Variables de entorno

Todas necesitan prefijo `PUBLIC_` para llegar al cliente (Astro/Vite). Ver `.env.example`.

| Variable                    | Descripción                     | Estado                   |
| --------------------------- | ------------------------------- | ------------------------ |
| `PUBLIC_API_URL`            | URL base del backend            | En uso                   |
| `PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v2 del form de upload | Pendiente de implementar |
| `PUBLIC_GOOGLE_SCRIPT_URL`  | Google Apps Script de upload    | Pendiente de implementar |

Las dos últimas están documentadas pero hoy no se leen desde ningún archivo de `src/`. El upload va contra el backend, no contra Apps Script.

---

## 8. Tocar con cuidado

| Archivo                    | Por qué                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `astro.config.mjs`         | Adapter de Vercel, React, Tailwind y sitemap. Afecta build y deploy.                                                |
| `tsconfig.json`            | Strict, alias `@/*`, resolución de módulos. Cambiar `paths` rompe todo.                                             |
| `src/core/global.css`      | Variables del tema. Se propaga a toda la UI.                                                                        |
| `src/layouts/Layout.astro` | Layout de todas las páginas.                                                                                        |
| `vercel.json`              | Headers de seguridad y CSP de producción. El `connect-src` tiene que incluir cualquier host nuevo al que le pegues. |
| `.astro/`, `dist/`         | Generados. No editar, no commitear.                                                                                 |

Los iconos tienen dos versiones: `.astro` para contextos server-rendered y `react/*.tsx` para React. Si cambiás uno, mantené el otro en sincronía.

---

## 9. Checklist pre-producción

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build` en verde (el CI los corre igual)
- [ ] `PUBLIC_API_URL` en Vercel apunta a producción, no a localhost
- [ ] Si agregaste un host externo, está en el `connect-src` del CSP de `vercel.json`
- [ ] Las rutas SSR devuelven 200 con un `id` válido y redirigen a `/` con uno inválido
- [ ] Sin `console.log` ni datos sensibles en el bundle del cliente
- [ ] El sitemap se genera bien (depende de que `site` en `astro.config.mjs` sea la URL de producción)
