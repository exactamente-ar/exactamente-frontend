# Contribuir a Exactamente

Gracias por querer aportar. Este documento explica cómo hacerlo de forma ordenada.

## Antes de empezar

- Revisá los [issues abiertos](https://github.com/exactamente-ar/exactamente-frontend/issues) para ver si ya existe una discusión sobre lo que querés hacer.
- Para cambios grandes, abrí un issue primero para alinear antes de ponerte a codear.
- Para bugs o mejoras pequeñas, podés ir directo con un PR.

## Setup local

```bash
git clone https://github.com/<tu-usuario>/exactamente-frontend.git
cd exactamente-frontend
pnpm install
```

Copiar `.env.example` a `.env` en la raíz:

```bash
cp .env.example .env
```

`pnpm install` además engancha los git hooks (lefthook), así que los checks
corren solos a partir de ahí.

Levantar el dev server:

```bash
pnpm dev   # http://localhost:4321
```

## Flujo de trabajo

1. Forkear el repositorio
2. Crear una rama desde `master`:
   ```bash
   git checkout -b feat/descripcion-corta
   git checkout -b fix/descripcion-del-bug
   ```
3. Escribir el test que falle, después el código que lo haga pasar (TDD)
4. Verificar localmente:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```
5. Commitear y pushear — los hooks corren estos checks solos
6. Abrir un Pull Request contra `master`

### Checks automáticos

| Cuándo         | Qué corre                                             |
| -------------- | ----------------------------------------------------- |
| `git commit`   | prettier, eslint y `vitest --changed` sobre lo staged |
| mensaje commit | commitlint (conventional commits)                     |
| `git push`     | `typecheck` y la suite completa                       |
| Pull Request   | typecheck, lint, format:check, test y build           |

Los mensajes de commit tienen que seguir [conventional commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `style:`, `ci:`). El hook los rechaza si no.

### Tests

Vitest + Testing Library. Los archivos van junto al que testean (`api.ts` → `api.test.ts`).

Para testear un componente `.astro` hay que agregar `// @vitest-environment node`
como primera línea del archivo — se renderizan a string con el Container API y
jsdom rompe el compilador de Astro.

## Convenciones de código

### Naming

| Elemento    | Convención                | Ejemplo              |
| ----------- | ------------------------- | -------------------- |
| Componentes | PascalCase                | `CardSubject.tsx`    |
| Hooks       | camelCase + prefijo `use` | `useSubjects.ts`     |
| Tipos       | PascalCase, en `types/`   | `Subject`, `FilterT` |
| Constantes  | SCREAMING_SNAKE_CASE      | `INITIAL_FILTERS`    |
| Servicios   | camelCase                 | `getSubjects`        |

### Estructura por feature

Cada feature sigue la misma estructura interna:

```
features/<nombre>/
├── components/
├── hooks/
├── types/
├── constants/
├── services/
└── utils/
```

No mezclar lógica entre features.

### Reglas clave

- **Todo fetch va por `src/shared/services/api.ts`** — no hacer `fetch` directo en componentes ni hooks.
- **Usar el alias `@/`** en lugar de rutas relativas profundas (`../../`).
- **Combinar clases con `cn()`** de `@/shared/lib/utils`, nunca concatenar strings.
- **Iconos tienen dos versiones**: `.astro` para componentes server-rendered y `react/*.tsx` para componentes React. Si cambiás un icono, actualizá ambas.
- **Componentes shadcn/ui** en `src/shared/components/ui/` no se modifican manualmente — agregar nuevos con `pnpm dlx shadcn@latest add <componente>`.

### Estilos

Tailwind v4, sin `tailwind.config.js`. Customizaciones van en `src/core/global.css` con `@theme`. No crear archivos CSS por componente.

## Archivos críticos — no modificar sin revisión

| Archivo                    | Razón                                              |
| -------------------------- | -------------------------------------------------- |
| `astro.config.mjs`         | Configura el adapter de Vercel y el build completo |
| `tsconfig.json`            | Define strict mode y el alias `@/*`                |
| `src/core/global.css`      | Variables CSS del tema — afecta toda la UI         |
| `src/layouts/Layout.astro` | Layout base de todas las páginas                   |

Si necesitás tocar alguno de estos archivos, explicalo en el PR.

## Pull Requests

- Título claro: `feat: agregar filtro por año`, `fix: corregir paginación en móvil`
- Describí qué cambia y por qué
- Si es un cambio visual, incluí capturas de pantalla
- El CI tiene que estar en verde antes de pedir review

## Reportar un bug

Abrí un issue con:

- Descripción del comportamiento esperado vs. el actual
- Pasos para reproducirlo
- Capturas de pantalla si aplica
- Browser y sistema operativo

## Preguntas

Si tenés dudas sobre la arquitectura o cómo encarar algo, abrí un issue con el label `question` antes de empezar.
