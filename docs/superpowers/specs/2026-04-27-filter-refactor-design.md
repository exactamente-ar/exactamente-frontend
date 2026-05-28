# Filter Refactor — Design Spec
**Date:** 2026-04-27
**Feature:** Search bar + Filtros panel + active tags para materias
**Status:** Approved

---

## 1. Objetivo

Reemplazar el `FilterBar` actual (chips planos siempre visibles) por el patrón:
**search bar** + **botón Filtros** con badge + **panel en cascada** (dropdown/bottom sheet) + **active tags** removibles.

---

## 2. Arquitectura

### Hooks

| Hook | Responsabilidad |
|---|---|
| `useFilterState` | Estado draft + aplicado, lógica de cascada, reset en cascada, URL sync |
| `useFilterOptions` | Fetching de universidades / facultades / carreras / planes según draft actual |
| `useSubjects` | Simplificado: recibe `appliedFilters`, fetcha materias, pagina |

### Árbol de componentes

```
SubjectsView
├── FilterBar                    ← search input + botón Filtros (badge) + apertura panel
│   ├── FilterPanel              ← dropdown (desktop) / bottom sheet (mobile)
│   │   └── FilterCombobox       ← combobox reutilizable con búsqueda interna
│   └── ActiveTags               ← tags removibles con reset en cascada
└── ListOfSubjects               ← sin cambios
```

`SubjectsView` compone los tres hooks y pasa props. Ningún componente hace fetching directo.

### Archivos nuevos / modificados

```
src/features/home/
├── hooks/
│   ├── useFilterState.ts        ← NUEVO
│   ├── useFilterOptions.ts      ← NUEVO
│   └── useSubjects.ts           ← simplificado
├── components/subjects/
│   ├── FilterBar.tsx            ← reescritura
│   ├── FilterPanel.tsx          ← NUEVO
│   ├── FilterCombobox.tsx       ← NUEVO
│   └── ActiveTags.tsx           ← NUEVO
├── types/filter.ts              ← actualizado
└── constants/filter.ts          ← sin cambio de estructura, se mantiene YEARS_FILTER y QUADMESTERS_FILTER
src/shared/services/api.ts       ← agregar getUniversities, getFaculties, actualizar getCareers
```

---

## 3. Tipos y estado

```ts
// Estado draft — vive dentro del panel antes de presionar Aplicar
type DraftFilters = {
  universityId: string;
  facultyId:    string;
  careerId:     string;
  planId:       string;
  year:         number;   // 0 = todos
  quadmester:   number;   // 0 = todos
};

// Estado aplicado — lo que dispara el fetch de materias y se refleja en la URL
type AppliedFilters = DraftFilters & {
  search: string;
};
```

`search` vive solo en el estado aplicado: se aplica inmediatamente al cambiar, sin pasar por el panel.

### Cascada de resets al cambiar un filtro padre

```
setDraftFilter('universityId', x) → resetea facultyId, careerId, planId, year, quadmester
setDraftFilter('facultyId', x)    → resetea careerId, planId, year, quadmester
setDraftFilter('careerId', x)     → resetea planId, year, quadmester
setDraftFilter('planId', x)       → sin reset descendente
setDraftFilter('year', x)         → sin reset descendente
setDraftFilter('quadmester', x)   → sin reset descendente
```

### Acciones del panel

- **Aplicar**: copia draft → applied, cierra panel, sincroniza URL
- **Cancelar**: descarta draft (resetea draft a applied), cierra panel
- **Limpiar todo** (en el área de tags): resetea applied + draft a vacíos, limpia URL

---

## 4. Comportamiento general

- La barra de búsqueda aplica cambios inmediatamente (sin pasar por el panel).
- El panel funciona con estado draft en **ambos breakpoints** (desktop y mobile): los cambios no afectan las materias hasta presionar "Aplicar".
- Los active tags reflejan el estado **draft** mientras el panel está abierto, y el estado **applied** cuando está cerrado.
- Eliminar un tag llama a `setDraftFilter(key, '')` y ejecuta `onApply` inmediatamente (es una acción confirmada, no draft).
- El botón "Limpiar todo" aparece cuando `activeCount > 0`.

---

## 5. Filtros y orden de habilitación en cascada

| # | Filtro | Habilitado cuando |
|---|---|---|
| 1 | Universidad | siempre |
| 2 | Facultad | universityId seleccionado |
| 3 | Carrera | facultyId seleccionado |
| 4 | Plan | careerId seleccionado |
| 5 | Año | careerId seleccionado |
| 6 | Cuatrimestre | careerId seleccionado |

Filtros deshabilitados: visibles con `opacity-40` y `pointer-events-none` / `aria-disabled="true"`.

---

## 6. Componentes

### FilterBar
- Input de texto + ícono lupa (aplica inmediato)
- Botón "Filtros" con badge numérico (cuenta filtros aplicados activos, excluye search)
- Renderiza `FilterPanel` y `ActiveTags` como hijos

### FilterPanel
**Props:** `draft`, `setDraftFilter`, `options`, `onApply`, `onCancel`

**Desktop (>= lg):**
- `position: absolute`, alineado a la derecha del botón "Filtros", z-index sobre contenido
- Cierre al hacer click fuera (listener en `document`)
- Cada filtro: fila con label a la izquierda + `FilterCombobox` a la derecha
- Footer: botones "Cancelar" y "Aplicar"

**Mobile (< lg):**
- Bottom sheet fijo, `translate-y` animado, handle visual en el top
- Filtros en columna vertical
- Footer fijo: botones "Limpiar" y "Aplicar"

### FilterCombobox
**Props:** `options: {id: string; label: string}[]`, `value`, `onChange`, `placeholder`, `disabled`, `isLoading`

- Input de búsqueda interna que filtra `options` por texto
- Lista de resultados en dropdown bajo el input
- Cierra con click fuera o Escape
- Cuando `disabled`: `aria-disabled="true"`, no abre el dropdown
- Sin librería externa — Tailwind + estado local React

### ActiveTags
**Props:** `draft`, `appliedFilters`, `options`, `onRemove`, `onClearAll`

- Muestra el **valor** del filtro (no el nombre del filtro)
- Cada tag tiene botón X con `aria-label="Eliminar filtro {valor}"`
- Desktop: flex wrap, máximo 2 líneas, colapsa el resto con "+N más" expandible
- Mobile: `overflow-x-auto`, `flex-nowrap` (scroll horizontal)

---

## 7. Sincronización con URL

- Params: `q`, `university`, `faculty`, `career`, `plan`, `year`, `quadmester`
- Mecanismo: `URLSearchParams` + `history.replaceState` (sin recarga de página)
- Al montar: leer params e inicializar `applied` y `draft` respetando la cascada (si hay `career` pero no `faculty`, ignorar `career`)
- Al aplicar filtros: actualizar todos los params a la vez

---

## 8. API layer (`api.ts`)

Nuevos tipos exportados:
```ts
export type University = { id: string; name: string }
export type Faculty    = { id: string; name: string }
```

Nuevas funciones (mismo patrón ApiResult existente):
```ts
export async function getUniversities(): Promise<ApiResult<University[]>>
export async function getFaculties(params: { universityId: string }): Promise<ApiResult<Faculty[]>>
```

Función actualizada (retrocompatible):
```ts
// Sin params → trae todas las carreras (comportamiento actual preservado)
export async function getCareers(params?: { facultyId?: string }): Promise<ApiResult<Career[]>>
```

---

## 9. Accesibilidad

| Elemento | Atributo |
|---|---|
| Botón "Filtros" | `aria-expanded={isOpen}`, `aria-controls="filter-panel"` |
| Panel (desktop) | `id="filter-panel"`, `role="region"` |
| Panel (mobile) | `id="filter-panel"`, `role="dialog"` |
| Foco al abrir | Mueve al primer `FilterCombobox` habilitado |
| Foco al cerrar | Vuelve al botón "Filtros" |
| Combobox | `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, lista con `role="listbox"`, items con `role="option"` + `aria-selected` |
| Combobox deshabilitado | `aria-disabled="true"` en el elemento raíz |
| Tag X | `<button aria-label="Eliminar filtro {valor}">` |

---

## 10. `useFilterOptions` — fetching en cascada

| Fetch | Disparado por |
|---|---|
| `getUniversities()` | Una vez al montar |
| `getFaculties({ universityId })` | Cambio en `draft.universityId` |
| `getCareers({ facultyId })` | Cambio en `draft.facultyId` |
| Planes | Derivados client-side de los subjects cargados (Set de planIds para la carrera activa) |

---

## 11. `useSubjects` simplificado

- Recibe `appliedFilters` como parámetro
- Re-fetcha del backend solo cuando cambia `appliedFilters.careerId`
- Filtra client-side por `search`, `year`, `quadmester`, `planId` (igual que hoy)
- Mantiene paginación con `PAGE_SIZE = 9`
