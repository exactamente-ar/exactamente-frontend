# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 1. Descripción del proyecto

**Exactamente** es un hub educativo para estudiantes universitarios donde pueden encontrar y subir materiales de estudio (resúmenes, parciales y finales) por materia. Está desplegado en `https://exactamente.com.ar`.

**Stack completo:**
- **Framework**: Astro 5 (island architecture, SSR via Vercel adapter)
- **UI interactiva**: React 19 (islands con `client:load` / `client:visible`)
- **Componentes UI**: shadcn/ui (Radix UI primitives + `class-variance-authority` + `tailwind-merge`) en `src/shared/components/ui/`
- **Estilos**: Tailwind CSS v4 (integrado como plugin de Vite, sin `tailwind.config.js`)
- **Bundler**: Vite (embebido en Astro)
- **Tipado**: TypeScript (strict mode, `astro/tsconfigs/strict`)
- **Fuente**: Rubik Variable (`@fontsource-variable/rubik`)
- **Iconos**: `lucide-react` (en componentes React) + íconos custom en `src/shared/components/icons/`
- **Command menu**: `cmdk` (usado en `FilterCombobox`)
- **Animaciones**: OGL (WebGL, usado en el fondo Aurora)
- **Formulario de upload**: `react-google-recaptcha` + Google Apps Script
- **Deployment**: Vercel (`@astrojs/vercel` adapter)
- **Package manager**: pnpm

---

## 2. Comandos esenciales

```bash
pnpm install        # Instalar dependencias
pnpm dev            # Dev server en http://localhost:4321
pnpm build          # Build de producción → dist/
pnpm preview        # Preview del build de producción
pnpm astro          # CLI de Astro (e.g. pnpm astro add <integration>)
```

No hay comandos de lint ni tests configurados.

---

## 3. Arquitectura

### Estructura de carpetas

```
src/
├── core/
│   └── global.css             # CSS global + variables de tema Tailwind (dark, slate-900)
├── layouts/
│   └── Layout.astro           # Layout base: fuente, Aurora bg, Header, Footer, slot
├── pages/                     # Routing file-based de Astro
│   ├── index.astro            # Página home (/)
│   ├── upload.astro           # Página de upload (/upload)
│   └── [id]/
│       ├── resumenes.astro    # SSR: recursos tipo resumen por materia
│       ├── parciales.astro    # SSR: recursos tipo parcial por materia
│       └── finales.astro      # SSR: recursos tipo final por materia
├── features/
│   ├── home/
│   │   ├── components/
│   │   │   ├── hero/          # HeroSection.astro
│   │   │   ├── subjects/      # SubjectsView, FilterBar, ListOfSubjects, CardSubject
│   │   │   └── correlatives/  # CorrelativesSection, InfoSubjectSelect, cards, listas
│   │   ├── constants/
│   │   │   ├── filter.ts      # INITIAL_FILTERS, YEARS_FILTER, QUADMESTERS_FILTER
│   │   │   └── correlatives.ts # TIPOS_MATERIA enum
│   │   ├── hooks/
│   │   │   ├── useSubjects.ts      # Fetch + filtrado + paginación de materias
│   │   │   └── useCorrelatives.ts  # Mapa del plan de estudios con tipos de correlativa
│   │   ├── types/
│   │   │   ├── filter.ts      # FilterT, PropsFilterBar, PropsListOfSubjects
│   │   │   ├── subjects.ts    # Subject, TipoMateria
│   │   │   └── correlative.ts # PlanEstudiosMapeado
│   │   └── utils/
│   │       └── normalizeText.ts  # Normaliza texto para búsqueda (quita tildes)
│   ├── resource/
│   │   ├── components/        # ResourcesView, ListOfResources, CardResource, loaders
│   │   ├── hooks/
│   │   │   ├── useResources.ts       # Fetch de recursos por subjectId + tipo
│   │   │   └── usePreview.ts         # Toggle de iframe preview de Drive
│   │   ├── services/
│   │   │   └── resource.ts    # getByIdResources (thin wrapper sobre api.ts)
│   │   └── types/
│   │       └── resource.ts    # ResourceFetch, StringResource
│   └── upload/
│       ├── components/        # UploadForm, inputs, SuccesModal, skeleton
│       ├── hooks/
│       │   └── useUploadForm.ts  # Estado del form, validación, upload a Drive via Apps Script
│       └── types/
│           └── form.ts        # FormData del upload
└── shared/
    ├── components/            # Header, Footer, Breadcrumb, ContainerPage, Aurora, icons
    │   ├── icons/
    │   │   ├── *.astro        # Iconos para componentes .astro (sin JS)
    │   │   └── react/         # Iconos para componentes React (.tsx)
    │   └── ui/                # Componentes shadcn/ui (Badge, Button, Command, Popover, Select, etc.)
    └── services/
        └── api.ts             # Cliente HTTP centralizado: getCareers, getSubjects, getResources
```

### Modelo de componentes

- **`.astro`**: server-rendered, sin JS en el cliente. Usados para layouts, secciones estáticas, iconos en contextos no-React.
- **`.tsx`** con `client:load`: hidratados inmediatamente. Usados para vistas interactivas que el usuario ve enseguida (SubjectsView, ResourcesView, UploadForm).
- **`.tsx`** con `client:visible`: hidratados cuando entran en viewport. Usado para Aurora (animación WebGL del fondo).

### Routing de recursos (SSR)

Las páginas `[id]/resumenes.astro`, `[id]/parciales.astro` y `[id]/finales.astro` tienen `export const prerender = false` — son SSR puras. En el servidor llaman a `getSubjectBySlug(id)` y redirigen a `/` si la materia no existe.

---

## 4. Backend

Documentación completa en `../exactamente-backend/CLAUDE.md` (y sus módulos `CLAUDE.*.md`).

Resumen relevante para el frontend:

- **Base URL**: `/api/v1` · Runtime: Bun + Hono · DB: PostgreSQL + Drizzle ORM
- **Paginación**: `{ data, total, page, totalPages }` — excepción: `GET /api/v1/careers` devuelve `{ data }` sin paginación
- **Errores**: `{ "error": "mensaje" }` con códigos HTTP estándar
- **Archivos**: los PDFs se sirven desde Cloudflare R2; la URL ya viene resuelta en `fileUrl` — no construir URLs manualmente
- **Módulos**: `CLAUDE.subjects.md`, `CLAUDE.resources.md`, `CLAUDE.catalog.md`, `CLAUDE.auth.md`, `CLAUDE.admin.md`

---

## 5. Variables de entorno (frontend)

Todas las variables deben tener el prefijo `PUBLIC_` para ser accesibles en el cliente (Astro/Vite).

| Variable | Descripción | Obligatoria |
|---|---|---|
| `PUBLIC_API_URL` | URL base del backend REST (ej: `https://api.exactamente.com.ar`). Default: `http://localhost:3000` | Prod: sí |
| `PUBLIC_RECAPTCHA_SITE_KEY` | Site key de Google reCAPTCHA v2 para el formulario de upload | Sí |
| `PUBLIC_GOOGLE_SCRIPT_URL` | URL del Google Apps Script que recibe el archivo y lo sube a Google Drive | Sí |

Crear un `.env` local:
```
PUBLIC_API_URL=http://localhost:3000
PUBLIC_RECAPTCHA_SITE_KEY=your_key_here
PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

---

## 6. Convenciones de código

### Naming

- **Componentes**: PascalCase — `CardSubject.tsx`, `FilterBar.tsx`
- **Hooks**: camelCase con prefijo `use` — `useSubjects.ts`, `useResources.ts`
- **Tipos**: PascalCase, en archivos `types/` dentro de cada feature — `Subject`, `FilterT`, `ResourceFetch`
- **Constantes**: SCREAMING_SNAKE_CASE — `INITIAL_FILTERS`, `TIPOS_MATERIA`, `YEARS_FILTER`
- **Servicios**: funciones nombradas en camelCase, agrupadas por dominio — `getCareers`, `getSubjects`, `getResources`

### Estructura de archivos por feature

Cada feature (`home`, `resource`, `upload`) sigue la misma estructura interna: `components/`, `hooks/`, `types/`, `constants/`, `services/`, `utils/`. No mezclar lógica entre features; toda comunicación con el backend pasa por `src/shared/services/api.ts`.

### Manejo de estado

Sin librería global de estado. Estado local con hooks de React:
- `useSubjects()` — materias + filtros + paginación (PAGE_SIZE = 9); orquesta los hooks de filtro
- `useFilterState()` — estado mutable de los filtros activos
- `useFilterOptions()` — opciones disponibles derivadas de las materias cargadas
- `useResolvedDefaultScope()` — resuelve el scope/carrera por defecto (cacheado)
- `useCorrelatives()` — árbol del plan de estudios
- `useResources()` — recursos por materia y tipo
- `usePreview()` — toggle de iframe preview de Drive (ex `usePreviewDrive`)
- `useUploadForm()` — formulario de upload

### Consumo de API

Todo el acceso HTTP está centralizado en `src/shared/services/api.ts`. El patrón de retorno es:

```ts
type ApiResult<T> = { data: T; error: null } | { data: []; error: string }
```

Siempre verificar `result.error` antes de usar `result.data`. Los tipos del backend (`BackendSubject`, `BackendResource`) se mapean a tipos internos (`Subject`, `ResourceFetch`) dentro de `api.ts` — los componentes nunca reciben tipos de backend directamente.

### Path alias

`@/*` → `src/*` (configurado en `tsconfig.json` y resuelto por Vite). Siempre usar `@/` en lugar de rutas relativas profundas.

### Componentes shadcn/ui

Los componentes en `src/shared/components/ui/` son primitivos de shadcn/ui (Radix UI + CVA). Para agregar un nuevo componente shadcn usar la CLI: `pnpm dlx shadcn@latest add <componente>`. No modificar los archivos de `ui/` manualmente a menos que sea estrictamente necesario — son la base sobre la que se construyen los componentes de feature. Usar `cn()` (de `@/shared/lib/utils`) para combinar clases.

### Estilos

Tailwind v4 — sin `tailwind.config.js`. Las customizaciones (colores, fuentes, variables CSS) se definen en `src/core/global.css` con `@theme`. Tema oscuro base: `slate-900` como `--color-primary-foreground`. Usar clases de Tailwind directamente en JSX/Astro; no crear archivos CSS por componente.

---

## 7. Testing

No hay framework de testing configurado en el proyecto. No existen archivos de test. No hay comandos `test` en `package.json`.

Si se agrega testing en el futuro, la convención de Astro/Vite es usar Vitest con archivos `*.test.ts` o `*.spec.ts` colocados junto al archivo que testean, o en una carpeta `__tests__/` dentro de cada feature.

---

## 8. Restricciones importantes

### No modificar sin revisión

| Archivo | Razón |
|---|---|
| `astro.config.mjs` | Configura el adapter de Vercel, integración de React, Tailwind como plugin de Vite y sitemap. Cambios aquí afectan el build completo y el deployment. |
| `tsconfig.json` | Define strict mode, el alias `@/*` y la resolución de módulos. Cambiar `paths` rompe todos los imports. |
| `src/core/global.css` | Define todas las variables CSS del tema (colores, fuentes). Cambios afectan toda la UI. |
| `src/layouts/Layout.astro` | Layout base de todas las páginas. Cambios se propagan globalmente. |
| `.astro/` (carpeta generada) | Generado automáticamente por Astro. No editar manualmente. |
| `dist/` | Output del build. Nunca commitear. |

### Consideraciones de arquitectura

- Las páginas `[id]/*.astro` son SSR (`prerender = false`). No agregar `getStaticPaths()` sin entender el impacto en el deployment de Vercel.
- El archivo `api.ts` es el único punto de contacto con el backend. No hacer `fetch` directo en componentes o hooks.
- Los iconos tienen dos versiones: `.astro` (para contextos server-rendered) y `react/*.tsx` (para componentes React). Mantener ambas en sincronía si se cambia un icono.

---

## 9. Checklist pre-producción

- [ ] `pnpm build` termina sin errores ni warnings de TypeScript
- [ ] Variables de entorno de producción configuradas en Vercel: `PUBLIC_API_URL`, `PUBLIC_RECAPTCHA_SITE_KEY`, `PUBLIC_GOOGLE_SCRIPT_URL`
- [ ] `PUBLIC_API_URL` apunta al backend de producción, no a `localhost`
- [ ] El Google Apps Script de upload está publicado como web app con acceso "Anyone"
- [ ] La site key de reCAPTCHA corresponde al dominio de producción (`exactamente.com.ar`)
- [ ] `pnpm preview` sirve correctamente la build local antes de deployar
- [ ] Las rutas SSR (`/[id]/resumenes`, etc.) devuelven 200 con un `id` válido y redirigen a `/` con uno inválido
- [ ] El Aurora (WebGL) no bloquea la carga — usa `client:visible` correctamente
- [ ] No hay `console.log` ni datos sensibles en el bundle del cliente
- [ ] El sitemap se genera correctamente (requiere que `site` en `astro.config.mjs` sea la URL de producción)
