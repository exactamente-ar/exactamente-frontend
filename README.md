# Exactamente — Frontend

Hub educativo para estudiantes universitarios donde pueden buscar y subir materiales de estudio (resúmenes, parciales y finales) por materia. Desplegado en [exactamente.com.ar](https://exactamente.com.ar).

## Stack

- **Framework**: Astro 5 (SSR via Vercel adapter)
- **UI interactiva**: React 19 (islands)
- **Componentes**: shadcn/ui (Radix UI + CVA + Tailwind)
- **Estilos**: Tailwind CSS v4
- **Tipado**: TypeScript (strict mode)
- **Package manager**: pnpm
- **Deployment**: Vercel

## Requisitos previos

- **Node.js** LTS reciente
- **pnpm**:
  ```bash
  npm install -g pnpm
  ```

## Instalación

```bash
git clone https://github.com/exactamente-ar/exactamente-frontend.git
cd exactamente-frontend
pnpm install
```

### Variables de entorno

Crear un archivo `.env` en la raíz:

```env
PUBLIC_API_URL=http://localhost:3000
PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

## Comandos

| Comando | Descripción |
|---|---|
| `pnpm dev` | Dev server en `http://localhost:4321` |
| `pnpm build` | Build de producción → `dist/` |
| `pnpm preview` | Preview del build local |

## Estructura del proyecto

```
src/
├── core/            # CSS global y variables de tema
├── layouts/         # Layout base (Aurora, Header, Footer)
├── pages/           # Routing file-based de Astro
├── features/
│   ├── home/        # Búsqueda y listado de materias
│   ├── resource/    # Vista de recursos por materia
│   └── upload/      # Formulario de subida de materiales
└── shared/
    ├── components/  # Header, Footer, Aurora, iconos, shadcn/ui
    └── services/    # api.ts — cliente HTTP centralizado
```

## Contribución

¡Las contribuciones son bienvenidas! Si querés aportar al proyecto, seguí estos pasos:

### 1. Forkear y clonar

```bash
git clone https://github.com/<tu-usuario>/exactamente-frontend.git
cd exactamente-frontend
pnpm install
```

### 2. Crear una rama

Usá el formato `<tipo>/<descripcion-corta>`:

```bash
git checkout -b feat/nueva-feature
git checkout -b fix/descripcion-del-bug
```

### 3. Desarrollar

- Seguí las convenciones de código existentes (PascalCase para componentes, camelCase para hooks con prefijo `use`, etc.)
- Todo acceso HTTP va por `src/shared/services/api.ts` — no hacer `fetch` directo en componentes
- Usá el alias `@/` en lugar de rutas relativas profundas
- Combiná clases con `cn()` de `@/shared/lib/utils`

### 4. Verificar antes de pushear

```bash
pnpm build   # Tiene que terminar sin errores
```

### 5. Abrir un Pull Request

- Título claro y descriptivo
- Describí qué cambia y por qué
- Si es un cambio visual, incluí capturas de pantalla

### Qué no modificar sin revisión previa

| Archivo | Razón |
|---|---|
| `astro.config.mjs` | Configura el adapter de Vercel y el build completo |
| `tsconfig.json` | Define strict mode y el alias `@/*` |
| `src/core/global.css` | Variables CSS del tema — afecta toda la UI |
| `src/layouts/Layout.astro` | Layout base de todas las páginas |
