# Spec: Migracion incremental a shadcn/ui

Fecha: 2026-05-04

## Contexto

shadcn/ui esta configurado (`components.json`) con 6 componentes instalados (Button, Input, Badge, Skeleton, Card, Dialog) pero ninguno se usa. Los componentes actuales usan Tailwind inline. Esta migracion adopta shadcn donde aporta valor (accesibilidad, consistencia, menos codigo) manteniendo la identidad visual.

## Enfoque visual: hibrido

- **De shadcn:** variantes via cva, accesibilidad via Radix, composicion (subcomponents)
- **Del diseno actual:** palette dark zinc/slate, rounded-xl, gradientes sutiles, hover scale, Rubik, spacing generoso (px-4 py-3 en inputs, rounded-xl en todo)

## Fase 1 — Quick wins

### 1. CardResourceLoading -> Skeleton

**Archivo:** `src/features/resource/components/CardResourceLoading.tsx`

**Cambio:** Reemplazar divs con clase `.shimmer` y gradientes manuales por `<Skeleton />`.

```tsx
// Antes
<div className='h-7 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-lg w-48 shimmer'></div>

// Despues
<Skeleton className="h-7 w-48 rounded-lg" />
```

- Mantener estructura de layout (flex, gaps, responsive)
- Skeleton usa `animate-pulse` + `bg-muted` (ya mapeado a slate-800)
- No se necesita instalar nada nuevo

### 2. SuccessModal -> Dialog

**Archivo:** `src/features/upload/components/SuccesModal.tsx`

**Cambio:** Reemplazar modal manual por `Dialog` de shadcn (basado en Radix).

**Customizaciones:**
- `DialogOverlay`: `bg-black/95` (en vez del default semi-transparente)
- `DialogContent`: `bg-black/40 border-primary/30 border rounded-2xl p-8 max-w-md`
- Mantener icono check verde, texto, y boton "Continuar"

**Beneficios:**
- Focus trap automatico
- Cierre con ESC y click fuera
- aria-labelledby/describedby automaticos
- Animaciones de entrada/salida via Radix

**Interfaz:** El Dialog se controla con `open` + `onOpenChange` props (reemplaza `showSuccess` + `closeSuccess`).

## Fase 2 — Upload form

### 3. SubmitButton -> Button

**Archivo:** `src/features/upload/components/SubmitButton.tsx`

**Cambio:** Usar `<Button>` de shadcn con className overrides.

```tsx
<Button
  type="submit"
  disabled={isSubmitting}
  className={cn(
    "w-full font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all",
    hasError && "border-4 border-red-500 shadow-lg shadow-red-500/20"
  )}
>
```

- No agregar variante custom a button.tsx — usar className para los estilos especificos del submit
- Mantener logica de spinner/texto condicional dentro

### 4. TextInput + TextAreaInput -> Input

**Archivos:**
- `src/features/upload/components/TextInput.tsx`
- `src/features/upload/components/TextAreaInput.tsx`

**Cambio:** Usar `<Input>` de shadcn con estilos del tema.

Modificar `ui/input.tsx` para que el estilo base sea:
```
rounded-xl px-4 py-3 font-bold border-primary/30 bg-black/20 text-foreground-secondary
focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff]
```

TextInput pasa a ser wrapper thin:
```tsx
<Input name={name} value={value} onChange={onChange} placeholder={placeholder}
  className={cn(error && "border-red-300 bg-red-900/10")} />
<ErrorMessage message={error} />
```

Para TextArea: crear `ui/textarea.tsx` via `pnpm dlx shadcn@latest add textarea`, mismo patron de estilos.

### 5. SelectInput -> Select

**Archivo:** `src/features/upload/components/SelectInput.tsx`

**Instalacion:** `pnpm dlx shadcn@latest add select`

**Cambio:** Reemplazar `<select>` nativo por componentes `Select` de shadcn (Radix).

```tsx
<Select value={value} onValueChange={(v) => onChange(v)}>
  <SelectTrigger className="rounded-xl px-4 py-3 font-bold border-primary/30 bg-black/20">
    <SelectValue placeholder={placeholder} />
  </SelectTrigger>
  <SelectContent className="bg-zinc-900 border-zinc-700">
    {options.map(opt => (
      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Nota:** `onChange` cambia de `ChangeEvent<HTMLSelectElement>` a `(value: string) => void`. Adaptar `useUploadForm` segun sea necesario.

## Fase 3 — Filter system

### 6. ActiveTags chips -> Badge

**Archivo:** `src/features/home/components/subjects/ActiveTags.tsx`

**Cambio:** Reemplazar `TagChip` custom por composicion con `Badge`.

```tsx
<Badge variant="secondary" className="bg-zinc-700/60 border-zinc-600 rounded-full pl-3 pr-1.5 py-1 text-zinc-200">
  {label}
  <button onClick={onRemove} aria-label={`Eliminar filtro ${label}`}
    className="ml-1 w-4 h-4 rounded-full hover:bg-zinc-500 transition-colors inline-flex items-center justify-center">
    <X size={10} />
  </button>
</Badge>
```

- Mantener logica de overflow/expand tal cual
- Solo cambia el componente visual del chip

### 7. FilterCombobox -> Command + Popover

**Archivo:** `src/features/home/components/subjects/FilterCombobox.tsx`

**Instalacion:** `pnpm dlx shadcn@latest add command popover`

**Cambio:** Reemplazar implementacion manual (160 lineas) por composicion shadcn.

```tsx
<Popover open={isOpen} onOpenChange={setIsOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox" aria-expanded={isOpen}
      className={cn(triggerStyles)}>
      {selectedLabel || placeholder}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="bg-zinc-800 border-zinc-700 p-0">
    <Command>
      <CommandInput placeholder="Buscar..." />
      <CommandEmpty>Sin resultados</CommandEmpty>
      <CommandGroup>
        {options.map(opt => (
          <CommandItem key={opt.id} value={opt.label} onSelect={() => handleSelect(opt.id)}>
            {opt.label}
            <Check className={cn("ml-auto h-4 w-4", value === opt.id ? "opacity-100" : "opacity-0")} />
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  </PopoverContent>
</Popover>
```

**Beneficios:**
- Keyboard navigation completa (arrows, enter, escape)
- Busqueda fuzzy built-in (cmdk)
- Accesibilidad (aria-expanded, listbox, etc) automatica
- Reduce ~160 lineas a ~40

**Mantener:**
- Variante `pill` via className en PopoverTrigger
- Estilos dark (zinc-800, zinc-700 borders)
- `disabled` prop

## Lo que NO se migra

| Componente | Razon |
|---|---|
| CardSubject | Logica de negocio + gradientes muy custom |
| CardResource | Misma razon |
| FilterBar | Orquestador, no componente UI generico |
| Aurora (WebGL) | No aplica |
| Iconos (.astro/.tsx) | Sistema dual, sin equivalente shadcn |
| Header/Footer (.astro) | Server-rendered, shadcn es React-only |

## Dependencias a instalar

| Fase | Comando |
|---|---|
| 2 | `pnpm dlx shadcn@latest add textarea` |
| 2 | `pnpm dlx shadcn@latest add select` |
| 3 | `pnpm dlx shadcn@latest add command popover` |

## Orden de ejecucion

Cada item es un commit independiente. Se puede parar en cualquier fase sin romper nada.

1. CardResourceLoading -> Skeleton
2. SuccessModal -> Dialog
3. SubmitButton -> Button
4. TextInput -> Input
5. TextAreaInput -> Textarea (instalar)
6. SelectInput -> Select (instalar)
7. ActiveTags -> Badge
8. FilterCombobox -> Command + Popover (instalar)

## Validacion

Cada paso se valida con:
- `pnpm build` sin errores TS
- Verificacion visual en `pnpm dev` de que el componente se ve y funciona igual (o mejor)
