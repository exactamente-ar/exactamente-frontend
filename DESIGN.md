# DESIGN.md — Identidad Visual de Exactamente

Guia de diseño extraída del código fuente. Fuente de verdad: `src/core/global.css` y componentes existentes.

---

## 1. Identidad visual

- **Marca**: Exactamente — hub educativo universitario para materiales de estudio
- **Filosofía**: Dark-first. Fondo slate-900 con superficies elevadas en tonos zinc
- **Personalidad**: Profesional pero accesible. Gradientes animados como acento visual (purple → pink → yellow → teal). Micro-interacciones sutiles (scale, fade) que dan vida sin distraer
- **Fuente**: Rubik Variable — sans-serif redondeada, moderna y legible

---

## 2. Design tokens

Todos definidos en `src/core/global.css` dentro de `@theme`.

### Colores base

| Token | Valor | Uso | Tailwind |
|---|---|---|---|
| `--color-primary` | `#efefef` | Acento UI claro | `text-primary`, `bg-primary` |
| `--color-primary-foreground` | `#131314` | Texto sobre primary | `text-primary-foreground` |
| `--color-secondary` | `#1e40af` | Cards, fondos alternos | `bg-secondary` |
| `--color-secondary-foreground` | `#ffffff` | Texto sobre secondary | `text-secondary-foreground` |
| `--color-accent` | `#ff9800` | Botones alternativos, destacados | `bg-accent` |
| `--color-accent-foreground` | `#000000` | Texto sobre accent | `text-accent-foreground` |

### Backgrounds

| Token | Valor | Uso | Tailwind |
|---|---|---|---|
| `--color-background` | `#0f172a` | Fondo general (Slate 900) | `bg-background` |
| `--color-surface` | `#1e293b` | Superficies elevadas: tarjetas, modales | `bg-surface` |

### Texto

| Token | Valor | Uso | Tailwind |
|---|---|---|---|
| `--color-foreground` | `#f8fafc` | Texto principal | `text-foreground` |
| `--color-foreground-secondary` | `#cbd5e1` | Texto secundario | `text-foreground-secondary` |
| `--color-foreground-muted` | `#94a3b8` | Texto deshabilitado / menor importancia | `text-foreground-muted` |

### UI neutra (tarjetas, inputs)

| Token | Valor | Uso | Tailwind |
|---|---|---|---|
| `--color-muted` | `#1f2937` | Fondo elementos secundarios (Slate 800) | `bg-muted` |
| `--color-muted-foreground` | `#ffd100` | Texto amarillo destacado sobre muted | `text-muted-foreground` |
| `--color-border` | `#4b4f1d` | Bordes oliva (armoniza con amarillo) | `border-border` |
| `--color-input` | `#111827` | Fondo de inputs (Slate 900) | `bg-input` |
| `--color-input-placeholder` | `#a89f48` | Placeholder amarillo pálido | `placeholder:text-input-placeholder` |
| `--color-ring` | `var(--color-primary)` | Focus ring | `ring-ring` |

### Estados

| Token | Valor | Uso | Tailwind |
|---|---|---|---|
| `--color-error` | `#dc2626` | Errores | `text-error`, `border-error` |
| `--color-error-foreground` | `#ffffff` | Texto sobre error | `text-error-foreground` |
| `--color-success` | `#16a34a` | Éxito | `text-success` |
| `--color-success-foreground` | `#ffffff` | Texto sobre success | `text-success-foreground` |
| `--color-warning` | `#f59e0b` | Advertencias | `text-warning` |
| `--color-warning-foreground` | `#000000` | Texto sobre warning | `text-warning-foreground` |

### Tipografía

| Token | Valor | Tailwind |
|---|---|---|
| `--font-rubik` | `Rubik, ui-sans-serif, system-ui, ...` | `font-rubik` |

---

## 3. Escala tipográfica

Fuente: **Rubik Variable** (`@fontsource-variable/rubik`).

| Nivel | Clases Tailwind | Uso |
|---|---|---|
| Hero | `text-4xl md:text-5xl font-bold` | Título principal de la landing |
| Título card | `text-2xl md:text-3xl font-bold` | Nombre de materia en CardSubject |
| Título recurso | `text-xl font-bold` | Header de CardResource |
| Sección | `text-lg font-semibold` | Títulos de sección |
| Label uppercase | `text-xs font-semibold uppercase tracking-widest` | Labels como "RECURSOS" |
| Body | `text-sm font-medium` | Texto general, pills, botones |
| Small | `text-xs` | Metadata, errores, info secundaria |

**Pesos usados**: `font-bold` (headings, CTAs), `font-semibold` (labels, secciones), `font-medium` (body, pills).

**Tracking**: `tracking-widest` para labels uppercase, `tracking-wide` para headers de filtro.

---

## 4. Sistema de spacing

### Padding por contexto

| Contexto | Clases | Ejemplo |
|---|---|---|
| Card header | `px-6 py-8` | CardSubject zona superior |
| Card content | `px-6 pb-6` | CardSubject zona de links |
| Inputs | `px-4 py-3` | TextInput, SelectInput |
| File input | `p-8` | FileInput dropzone |
| Botones primary | `px-5 py-3` | SubmitButton |
| Botones secondary | `px-6 py-3` | Preview toggle, acciones |
| Pills/tags | `px-3 py-1.5` | FilterBar pills |
| Modal | `p-8` | SuccessModal |
| Search bar | `px-4 py-4` | FilterBar search input |

### Gaps

| Valor | Uso |
|---|---|
| `gap-1.5` | Entre pills/tags |
| `gap-2` | Entre elementos inline |
| `gap-3` | Entre items de lista, secciones menores |
| `gap-6` | Entre secciones, cards en grid |

### Márgenes comunes

`mb-2`, `mb-3`, `mb-4`, `mb-6` entre secciones. `mt-2`, `mt-3` para separación superior.

### Border radius

| Clase | Uso |
|---|---|
| `rounded-xl` (16px) | Cards, inputs, botones, modales |
| `rounded-lg` (8px) | Elementos secundarios |
| `rounded-full` (50%) | Pills, tags, badges, avatares |
| `rounded-2xl` | Modal overlay content |
| `rounded-md` | Metadata pills pequeños |

---

## 5. Paleta semántica de recursos

Cada tipo de recurso tiene un color asignado, usado consistentemente en links, iconos y badges.

| Tipo | Color | Gradiente card | Borde | Texto | Icono |
|---|---|---|---|---|---|
| Resúmenes | Emerald | `from-emerald-500/50 to-emerald-600/10` | `border-emerald-500/40` hover `border-emerald-400/60` | `text-emerald-200` | `fill-emerald-200` |
| Parciales | Blue | `from-blue-500/50 to-blue-600/10` | `border-blue-500/40` hover `border-blue-400/60` | `text-blue-200` | `fill-blue-200` |
| Finales | Purple | `from-purple-500/50 to-purple-600/10` | `border-purple-500/40` hover `border-purple-400/60` | `text-purple-200` | `fill-purple-200` |

**Patrón de uso en CardSubject**: cada link de recurso usa `bg-gradient-to-br` con los colores de arriba, con transición en hover del borde (`transition-all duration-300`).

---

## 6. Patrones de componentes

### Cards

**CardSubject** (`src/features/home/components/subjects/CardSubject.tsx`):
```
Wrapper:    <article> rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border gradient-border
Hover:      hover:border-zinc-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20
Header:     bg-gradient-to-br from-zinc-800/40 to-zinc-900/60 px-6 py-8 border-b border-zinc-800/50
Título:     text-2xl md:text-3xl font-bold text-white group-hover:text-yellow-100
Metadata:   bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-md text-xs
```

**CardResource** (`src/features/resource/components/CardResource.tsx`):
```
Container:  bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-zinc-800/60 rounded-xl
Hover:      hover:border-zinc-700/80 transition-all duration-300
Preview:    bg-zinc-800/50 rounded-xl border border-zinc-700/50
Badge:      bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 rounded-full
```

### Botones

**Primary (CTA)**:
```
bg-primary text-black font-bold py-3 rounded-xl
hover:scale-[1.02] active:scale-95
disabled:opacity-70 disabled:cursor-not-allowed
Error: border-4 border-red-500 shadow-lg shadow-red-500/20
```

**Secondary**:
```
bg-zinc-800/50 hover:bg-zinc-700/60 border-zinc-700 hover:border-zinc-600 text-zinc-200
px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95
Active: bg-red-800/50 hover:bg-red-700/60 border-red-700 text-white
```

**Pills / Toggle**:
```
Active:   px-3 py-1.5 text-sm font-medium rounded-full bg-zinc-700 border-zinc-600 text-white
Inactive: bg-transparent border-zinc-600 text-zinc-400 hover:border-zinc-500
Disabled: opacity-40 pointer-events-none
```

### Tags (ActiveTags)

```
pl-3 pr-1.5 py-1 text-sm bg-zinc-700/60 border border-zinc-600 rounded-full text-zinc-200
Close: w-4 h-4 rounded-full hover:bg-zinc-500
```

### Inputs

**Text / Select**:
```
w-full px-4 py-3 border rounded-xl font-bold transition-all duration-200
Normal: border-primary/30 bg-black/20 text-foreground-secondary
Error:  border-red-300 bg-red-900/10
Focus:  focus:outline-none focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff]
```

**File (drag & drop)**:
```
border border-dashed rounded-xl p-8 transition-all duration-200
Normal: border-primary/30 bg-black/20 hover:border-[#0084ff] hover:bg-[#0084ff]/5
Error:  border-red-300 bg-red-900/10
Icono:  w-12 h-12 bg-yellow-900/35 border border-yellow-500 rounded-xl
```

### Modales

**SuccessModal**:
```
Overlay:  fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4
Content:  bg-black/40 border-primary/30 border rounded-2xl p-8 max-w-md animate-in fade-in duration-300
Icono:    w-16 h-16 bg-green-900/70 border border-green-600 rounded-full
Close:    absolute top-4 right-4 hover:text-gray-600 transition-colors
```

### Links

Links de recurso en cards usan el patrón de la paleta semántica (sección 5) con `group-hover:scale-[1.02]` y `transition-all duration-300`.

---

## 7. Animaciones

Todas definidas en `src/core/global.css`.

### Keyframes custom

| Nombre | Efecto | Duración | Uso |
|---|---|---|---|
| `fadeInUp` | opacity 0→1, translateY(10px→0) | Variable | Entrada de elementos |
| `shimmer` | background-position -200%→200% | 2s ease-in-out infinite | Skeletons de carga |
| `gradient-animation` | background-position 0%→100%→0% | 8s ease-in-out infinite | `.gradient-text`, `.gradient-bg` |
| `gradient-border` | Igual que gradient-animation | 8s ease-in-out infinite | `.gradient-border::before` |
| `gradientText1` | background-position 0%→200%→100% | Variable | Texto con gradiente |
| `gradientText2` | background-position 0%→100%→200% | 2s ease alternate-reverse | `.text-gray` |

### Clases utilitarias de animación

| Clase | Descripción |
|---|---|
| `.gradient-text` | Texto con gradiente animado (purple→pink→yellow→teal) |
| `.gradient-bg` | Fondo con gradiente animado (mismos colores, 45deg) |
| `.gradient-border` | Borde con gradiente animado via pseudo-elemento `::before` (opacity 0.3) |
| `.text-juan` | Gradiente estático rojo→naranja→amarillo |
| `.text-gray` | Gradiente gris animado con `gradientText2` |
| `.shimmer` | Efecto shimmer para loading states |
| `.bg-noise` | Textura de ruido SVG como fondo |

### Animaciones de Tailwind usadas

| Clase | Uso |
|---|---|
| `animate-pulse` | Skeletons de carga |
| `animate-spin` | Spinners (border-t-yellow-400) |
| `animate-in fade-in duration-300` | Entrada de modales |

### Transiciones en hover

| Patrón | Clases |
|---|---|
| Scale up | `hover:scale-105` o `hover:scale-[1.02]` |
| Scale down (active) | `active:scale-95` |
| Color transition | `transition-colors` |
| All properties | `transition-all duration-300` |
| Transform | `transition-transform duration-200` |

---

## 8. Iconografía

Sistema dual: versión `.astro` (server-rendered, sin JS) y versión React `.tsx` (para islands interactivos).

### Catálogo de iconos

| Icono | Astro | React | Uso |
|---|---|---|---|
| Calendar | `IconCalendar.astro` | `IconCalendar.tsx` | Año, cuatrimestre |
| Document | `IconDocument.astro` | `IconDocument.tsx` | Documentos genéricos |
| Download | `IconDownload.astro` | `IconDownload.tsx` | Acción de descarga |
| Link | `IconLink.astro` | `IconLink.tsx` | Enlaces externos |
| Moodle | `IconMoodle.astro` | `IconMoodle.tsx` | Link a Moodle |
| OpenBook | `IconOpenBook.astro` | `IconOpenBook.tsx` | Resúmenes |
| Paper | `IconPaper.astro` | `IconPaper.tsx` | Parciales/finales |
| Time | `IconTime.astro` | `IconTime.tsx` | Fecha/hora |
| University | `IconUniversity.astro` | `IconUniversity.tsx` | Carrera/universidad |
| Visibility | `IconVisibility.astro` | `IconVisibility.tsx` | Mostrar preview |
| VisibilityOff | `IconVisibilityOff.astro` | `IconVisibilityOff.tsx` | Ocultar preview |
| AlertCircle | — | `IconAlertCircle.tsx` | Errores (solo React) |
| CheckCircle | — | `IconCheckCircle.tsx` | Éxito (solo React) |
| X | — | `IconX.tsx` | Cerrar (solo React) |

### Ubicación

- Astro: `src/shared/components/icons/*.astro`
- React: `src/shared/components/icons/react/*.tsx`

### Tamaños estándar

- `size={20}` — tamaño por defecto
- `size={16}` — iconos en contextos reducidos (pills, tags)
- `w-12 h-12` — iconos grandes (file input, modal)

### Colores semánticos en iconos

Los iconos React reciben color via props de fill/stroke:
- `fill-emerald-200` — resúmenes
- `fill-blue-200` — parciales
- `fill-purple-200` — finales
- `fill-yellow-500` — acento general
- `stroke-green-600` — éxito

---

## 9. Guidelines de accesibilidad

### ARIA

| Atributo | Uso | Componente |
|---|---|---|
| `aria-disabled` | Estado deshabilitado | FilterCombobox |
| `aria-expanded` | Dropdown abierto/cerrado | FilterCombobox |
| `aria-haspopup='listbox'` | Trigger de dropdown | FilterCombobox |
| `aria-controls` | Vincula botón con listbox | FilterCombobox |
| `aria-autocomplete='list'` | Input de búsqueda | FilterCombobox |
| `aria-selected` | Opción seleccionada | Listbox options |
| `aria-label` | Descripción para screen readers | Botones de cerrar tags |
| `aria-hidden` | Elementos decorativos | Separadores (·) |
| `role='alert'` | Mensajes de error | ErrorMessage |
| `role='listbox'` | Listas desplegables | FilterCombobox |
| `role='option'` | Items de listbox | FilterCombobox options |

### Focus

| Patrón | Clases |
|---|---|
| Input focus | `focus:outline-none focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff]` |
| Combobox focus | `focus:outline-none focus:ring-1 focus:ring-zinc-500` |
| Container focus-within | `focus-within:border-zinc-500 transition-colors` |

### Teclado

- **Escape**: cierra dropdowns en FilterCombobox
- **Tab**: orden de focus preservado
- **Disabled**: `disabled:opacity-40 disabled:pointer-events-none`

### Contrast ratios

- Texto principal (`#f8fafc`) sobre background (`#0f172a`): ~15.4:1 (AAA)
- Texto secundario (`#cbd5e1`) sobre background: ~10.5:1 (AAA)
- Texto muted (`#94a3b8`) sobre background: ~6.4:1 (AA large)
- Amarillo accent (`#ffd100`) sobre muted (`#1f2937`): ~9.2:1 (AAA)

### Reduced motion

No hay `prefers-reduced-motion` configurado actualmente. Las animaciones son cortas (200-300ms para transiciones, 2-8s para gradientes decorativos) y no son esenciales para la funcionalidad.

### HTML semántico

- `<article>` para cards de materias
- `<button type='button'>` para controles UI
- `<a>` con `href` explícito para navegación
- `<label>` asociado a inputs de formulario

---

## 10. Componentes shadcn/ui

### Restricción importante

Los componentes shadcn/ui son **React-only**. Solo funcionan dentro de islands con `client:load` o `client:visible`. No pueden usarse en archivos `.astro` server-rendered.

### Import

```ts
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/shared/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog"
```

### Catálogo de componentes instalados

| Componente | Ubicación | Descripción |
|---|---|---|
| `Button` | `ui/button.tsx` | Botón con variantes (default, destructive, outline, secondary, ghost, link) y tamaños (default, sm, lg, icon) |
| `Input` | `ui/input.tsx` | Input de texto base con estilos del tema |
| `Badge` | `ui/badge.tsx` | Badge/pill para metadata y etiquetas |
| `Skeleton` | `ui/skeleton.tsx` | Placeholder animado para loading states |
| `Card` | `ui/card.tsx` | Container con header, content y footer |
| `Dialog` | `ui/dialog.tsx` | Modal accesible con overlay, basado en Radix UI |

### Cuándo usar shadcn vs componente custom

| Usar shadcn | Usar componente custom |
|---|---|
| UI genérica: botones, inputs, modales, badges | Componentes con lógica de negocio específica (CardSubject, FilterBar) |
| Necesitas accesibilidad built-in (Dialog, Popover) | Componentes server-rendered en `.astro` |
| Prototipado rápido de nuevas features | Componentes con animaciones/gradientes muy específicos del diseño |
| Composición estándar (Card con header/content/footer) | Cuando el overhead de Radix UI no se justifica |

### Componentes candidatos para migración futura

| Actual | Migración propuesta |
|---|---|
| `FilterCombobox` | shadcn `Command` + `Popover` |
| `SuccessModal` | shadcn `Dialog` |
| Loading skeletons custom | shadcn `Skeleton` |
| FilterBar pills | shadcn `Button` variant (`outline`, `ghost`) |
