# shadcn/ui Incremental Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar incrementalmente los componentes UI custom a shadcn/ui manteniendo la identidad visual hibrida (dark zinc/slate + rounded-xl + hover scale de Exactamente, mas accesibilidad y estructura de variantes de shadcn).

**Architecture:** Cada tarea es independiente — se puede commitear y deployar sin afectar las demas. No hay framework de testing, la verificacion es `pnpm build` (TypeScript strict) + inspeccion visual en `pnpm dev`. El orden va de menos a mas riesgo: Skeleton → Dialog → Button → Input → Textarea → Select → Badge → Command+Popover.

**Tech Stack:** Astro 5, React 19, shadcn/ui (Radix UI), Tailwind v4, TypeScript strict, pnpm

---

## File Map

| Archivo | Accion |
|---|---|
| `src/features/resource/components/CardResourceLoading.tsx` | Modificar — usar `Skeleton` |
| `src/features/upload/components/SuccesModal.tsx` | Modificar — usar `Dialog` |
| `src/features/upload/components/UploadSection.tsx` | Modificar — adaptar props de SuccessModal |
| `src/features/upload/components/SubmitButton.tsx` | Modificar — usar `Button` |
| `src/features/upload/components/TextInput.tsx` | Modificar — usar `Input` |
| `src/shared/components/ui/input.tsx` | Modificar — estilos base del tema |
| `src/features/upload/components/TextAreaInput.tsx` | Modificar — usar `Textarea` (instalar) |
| `src/features/upload/components/SelectInput.tsx` | Modificar — usar `Select` (instalar) |
| `src/features/upload/components/UploadForm.tsx` | Modificar — adaptar onChange de SelectInput |
| `src/features/home/components/subjects/ActiveTags.tsx` | Modificar — usar `Badge` en TagChip |
| `src/features/home/components/subjects/FilterCombobox.tsx` | Reemplazar — usar `Command` + `Popover` (instalar) |

---

## Task 1: CardResourceLoading → Skeleton

**Files:**
- Modify: `src/features/resource/components/CardResourceLoading.tsx`

- [ ] **Step 1: Reemplazar placeholders shimmer por Skeleton**

Reemplazar el contenido completo de `src/features/resource/components/CardResourceLoading.tsx`:

```tsx
import React from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';

const CardResourceLoading = () => {
  return (
    <div className='flex flex-col bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-zinc-800/60 rounded-xl overflow-hidden relative'>
      <div className='p-6 pb-4'>
        <div className='flex justify-between flex-col-reverse sm:flex-row'>
          <Skeleton className='h-7 w-48 rounded-lg mb-2 sm:mb-0' />
          <div className='flex justify-between items-start mb-4'>
            <div className='flex gap-2'>
              <Skeleton className='h-8 w-20 rounded-full' />
              <Skeleton className='h-8 w-12 rounded-full' />
            </div>
            <Skeleton className='sm:hidden h-6 w-24 rounded-full' />
          </div>
        </div>
      </div>
      <div className='px-6 pb-6'>
        <div className='flex gap-2 justify-between items-end flex-col sm:flex-row'>
          <div className='flex gap-3 items-center flex-col sm:flex-row w-full sm:w-min'>
            <Skeleton className='w-full sm:w-36 h-12 rounded-xl' />
            <Skeleton className='w-full sm:w-40 h-12 rounded-xl' />
          </div>
          <Skeleton className='hidden sm:flex h-8 w-28 rounded-full' />
        </div>
      </div>
    </div>
  );
};

export default CardResourceLoading;
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: sin errores TS.

- [ ] **Step 3: Commit**

```bash
git add src/features/resource/components/CardResourceLoading.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(ui): migrate CardResourceLoading to shadcn Skeleton"
```

---

## Task 2: SuccessModal → Dialog

**Files:**
- Modify: `src/features/upload/components/SuccesModal.tsx`
- Modify: `src/features/upload/components/UploadSection.tsx`

- [ ] **Step 1: Reemplazar SuccesModal.tsx**

```tsx
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import IconCheckCircle from '@/shared/components/icons/react/IconCheckCircle';

interface SuccessModalProps {
  showSuccess: boolean;
  closeSuccess: () => void;
}

const SuccessModal = ({ showSuccess, closeSuccess }: SuccessModalProps) => {
  return (
    <Dialog open={showSuccess} onOpenChange={(open) => { if (!open) closeSuccess(); }}>
      <DialogContent className='bg-black/90 border border-primary/30 rounded-2xl p-8 max-w-md text-center [&>button]:text-zinc-400 [&>button]:hover:text-zinc-200'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-16 h-16 bg-green-900/70 border border-green-600 rounded-full flex items-center justify-center'>
            <IconCheckCircle size={32} className='stroke-green-600' />
          </div>
          <DialogTitle className='text-2xl font-bold text-foreground'>
            !Recurso enviado!
          </DialogTitle>
          <DialogDescription className='text-foreground-secondary'>
            Tu recurso ha sido enviado exitosamente. Sera revisado y publicado pronto.
          </DialogDescription>
          <button
            onClick={closeSuccess}
            className='w-full font-semibold py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-foreground transition-all duration-200'
          >
            Continuar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

Esperado: sin errores TS. Dialog ya estaba instalado, no hay dependencias nuevas.

- [ ] **Step 3: Commit**

```bash
git add src/features/upload/components/SuccesModal.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(ui): migrate SuccessModal to shadcn Dialog"
```

---

## Task 3: SubmitButton → Button

**Files:**
- Modify: `src/features/upload/components/SubmitButton.tsx`

- [ ] **Step 1: Reemplazar SubmitButton.tsx**

```tsx
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import IconDownload from '@/shared/components/icons/react/IconDownload';

interface SubmitButtonProps {
  isSubmitting: boolean;
  text: string;
  submittingText: string;
  errors: {
    materia?: string;
    tipoRecurso?: string;
    titulo?: string;
    archivo?: string;
    captcha?: string;
  };
  uploadError?: string | null;
}

function SubmitButton({ isSubmitting, text, submittingText, errors, uploadError }: SubmitButtonProps) {
  const hasError =
    !!uploadError || Object.values(errors).some((error) => error && error.length > 0);

  return (
    <Button
      type='submit'
      disabled={isSubmitting}
      className={cn(
        'w-full bg-primary text-black font-bold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:bg-primary disabled:opacity-70 disabled:cursor-not-allowed h-auto',
        hasError && 'border-4 border-red-500 shadow-lg shadow-red-500/20'
      )}
    >
      {isSubmitting ? (
        <span className='flex items-center gap-2'>
          <svg className='animate-spin' width='20' height='20' viewBox='0 0 24 24'>
            <g fill='#000000'>
              <path
                fillRule='evenodd'
                d='M12 19a7 7 0 1 0 0-14a7 7 0 0 0 0 14m0 3c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10'
                clipRule='evenodd'
                opacity='.2'
              />
              <path d='M2 12C2 6.477 6.477 2 12 2v3a7 7 0 0 0-7 7z' />
            </g>
          </svg>
          {submittingText}
        </span>
      ) : (
        <>
          <IconDownload size={20} className='mr-2' />
          {text}
        </>
      )}
    </Button>
  );
}

export default SubmitButton;
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/features/upload/components/SubmitButton.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(ui): migrate SubmitButton to shadcn Button"
```

---

## Task 4: TextInput → Input (con estilos del tema)

**Files:**
- Modify: `src/shared/components/ui/input.tsx`
- Modify: `src/features/upload/components/TextInput.tsx`

- [ ] **Step 1: Actualizar estilos base de ui/input.tsx**

Reemplazar el contenido completo de `src/shared/components/ui/input.tsx`:

```tsx
import * as React from "react"
import { cn } from "@/shared/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-xl border border-primary/30 bg-black/20 px-4 py-3 text-sm font-bold text-foreground-secondary placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0084ff] focus-visible:border-[#0084ff] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 2: Actualizar TextInput.tsx para usar Input**

```tsx
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import ErrorMessage from './ErrorMessage';

interface TextInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({ name, value, onChange, placeholder, error }) => (
  <>
    <Input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(error && 'border-red-300 bg-red-900/10')}
    />
    <ErrorMessage message={error} />
  </>
);

export default TextInput;
```

- [ ] **Step 3: Verificar build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/ui/input.tsx src/features/upload/components/TextInput.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(ui): migrate TextInput to shadcn Input with theme styles"
```

---

## Task 5: TextAreaInput → Textarea

**Files:**
- Modify: `src/features/upload/components/TextAreaInput.tsx`

- [ ] **Step 1: Instalar componente Textarea de shadcn**

```bash
pnpm dlx shadcn@latest add textarea
```

Esto crea `src/shared/components/ui/textarea.tsx`.

- [ ] **Step 2: Actualizar estilos base en ui/textarea.tsx**

Abrir `src/shared/components/ui/textarea.tsx` y reemplazar el className base por estilos del tema:

```tsx
import * as React from "react"
import { cn } from "@/shared/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-xl border border-primary/30 bg-black/20 px-4 py-3 text-sm font-bold text-foreground-secondary placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0084ff] focus-visible:border-[#0084ff] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
```

- [ ] **Step 3: Actualizar TextAreaInput.tsx**

```tsx
import { Textarea } from '@/shared/components/ui/textarea';

interface TextAreaInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}) => (
  <Textarea
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
  />
);

export default TextAreaInput;
```

- [ ] **Step 4: Verificar build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/ui/textarea.tsx src/features/upload/components/TextAreaInput.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(ui): migrate TextAreaInput to shadcn Textarea"
```

---

## Task 6: SelectInput → Select

**Files:**
- Modify: `src/features/upload/components/SelectInput.tsx`
- Modify: `src/features/upload/components/UploadForm.tsx`

- [ ] **Step 1: Instalar componente Select de shadcn**

```bash
pnpm dlx shadcn@latest add select
```

Esto crea `src/shared/components/ui/select.tsx`.

- [ ] **Step 2: Reemplazar SelectInput.tsx**

La interfaz `onChange` cambia de `ChangeEvent<HTMLSelectElement>` a `(value: string) => void` porque Radix Select no emite eventos nativos.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';
import ErrorMessage from './ErrorMessage';

interface SelectInputProps {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  value,
  onValueChange,
  options,
  placeholder,
  error,
}) => (
  <>
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger
        className={cn(
          'w-full rounded-xl border border-primary/30 bg-black/20 px-4 py-3 h-auto font-bold text-foreground-secondary focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff] transition-all duration-200',
          error && 'border-red-300 bg-red-900/10'
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className='bg-zinc-900 border border-zinc-700 rounded-xl'>
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className='text-white font-bold focus:bg-zinc-700 cursor-pointer'
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <ErrorMessage message={error} />
  </>
);

export default SelectInput;
```

- [ ] **Step 3: Actualizar UploadForm.tsx para la nueva prop onValueChange**

El `handleInputChange` actual espera `ChangeEvent`. Hay que pasar una funcion adaptadora para SelectInput:

```tsx
import ReCAPTCHA from 'react-google-recaptcha';
import ErrorMessage from './ErrorMessage';
import TextInput from './TextInput';
import FormField from './FormField';
import FileInput from './FileInput';
import RadioGroupInput from './RadioGroupInput';
import SelectInput from './SelectInput';
import SubmitButton from './SubmitButton';
import type { UploadFormProps } from '../types/form';

const SITE_KEY_CAPTCHA = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY;

const UploadForm = ({
  formData,
  errors,
  handleInputChange,
  handleFileChange,
  handleSubmit,
  uploading,
  uploadError,
  subjects,
  tiposRecurso,
  setCaptchaToken,
}: UploadFormProps) => {
  return (
    <div className='bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 rounded-xl shadow-sm border gradient-border p-6'>
      <form onSubmit={(e) => handleSubmit(() => {})(e)} className='space-y-8'>
        <FormField label='Materia' required>
          <SelectInput
            name='materia'
            value={formData.materia}
            onValueChange={(value) =>
              handleInputChange({ target: { name: 'materia', value } } as React.ChangeEvent<HTMLInputElement>)
            }
            options={subjects}
            placeholder='Selecciona una materia'
            error={errors.materia}
          />
        </FormField>

        <FormField label='Tipo de Recurso' required>
          <RadioGroupInput
            name='tipoRecurso'
            value={formData.tipoRecurso}
            onChange={handleInputChange}
            options={tiposRecurso}
            error={errors.tipoRecurso}
          />
        </FormField>

        <FormField label='Titulo del Recurso' required>
          <TextInput
            name='titulo'
            value={formData.titulo}
            onChange={handleInputChange}
            placeholder='Ej: Resumen completo de limites y continuidad'
            error={errors.titulo}
          />
        </FormField>

        <FormField label='Archivo' required>
          <FileInput
            name='archivo'
            file={formData.archivo}
            onChange={handleFileChange}
            accept='.pdf,.jpg,.jpeg,.png'
            error={errors.archivo}
          />
        </FormField>

        <div>
          <ReCAPTCHA
            sitekey={SITE_KEY_CAPTCHA}
            theme='dark'
            onChange={(token) => setCaptchaToken(token)}
          />
          <ErrorMessage message={errors.captcha} />
        </div>

        <div className='pt-6'>
          <ErrorMessage message={uploadError} />
          <SubmitButton
            uploadError={uploadError}
            errors={errors}
            isSubmitting={uploading}
            text='Enviar Recurso'
            submittingText='Subiendo archivo...'
          />
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
```

- [ ] **Step 4: Verificar build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/ui/select.tsx src/features/upload/components/SelectInput.tsx src/features/upload/components/UploadForm.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(ui): migrate SelectInput to shadcn Select"
```

---

## Task 7: ActiveTags TagChip → Badge

**Files:**
- Modify: `src/features/home/components/subjects/ActiveTags.tsx`

- [ ] **Step 1: Reemplazar funcion TagChip para usar Badge**

Solo cambia la funcion `TagChip` dentro de `src/features/home/components/subjects/ActiveTags.tsx`. El resto del archivo (logica de overflow, ClearAllButton, ActiveTags) no se toca.

Agregar el import al inicio del archivo:

```tsx
import { Badge } from '@/shared/components/ui/badge';
```

Reemplazar la funcion `TagChip`:

```tsx
function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge className='flex items-center gap-1 pl-3 pr-1.5 py-1 text-sm bg-zinc-700/60 border border-zinc-600 rounded-full text-zinc-200 whitespace-nowrap hover:bg-zinc-700/60'>
      {label}
      <button
        type='button'
        onClick={onRemove}
        aria-label={`Eliminar filtro ${label}`}
        className='ml-0.5 flex items-center justify-center w-4 h-4 rounded-full hover:bg-zinc-500 transition-colors'
      >
        <svg width='10' height='10' viewBox='0 0 24 24' fill='none'>
          <path
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            d='M6 6l12 12M18 6L6 18'
          />
        </svg>
      </button>
    </Badge>
  );
}
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/subjects/ActiveTags.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(ui): migrate ActiveTags TagChip to shadcn Badge"
```

---

## Task 8: FilterCombobox → Command + Popover

**Files:**
- Modify: `src/features/home/components/subjects/FilterCombobox.tsx`

- [ ] **Step 1: Instalar Command y Popover**

```bash
pnpm dlx shadcn@latest add command popover
```

Esto crea `src/shared/components/ui/command.tsx` y `src/shared/components/ui/popover.tsx`.

- [ ] **Step 2: Reemplazar FilterCombobox.tsx completo**

```tsx
import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import type { FilterOption } from '@/features/home/types/filter';

interface FilterComboboxProps {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'pill';
}

const FilterCombobox: React.FC<FilterComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  isLoading = false,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.id === value)?.label ?? '';
  const isPill = variant === 'pill';
  const hasSelection = Boolean(selectedLabel);

  const triggerClassName = isPill
    ? cn(
        'flex items-center justify-between gap-2 px-4 py-2 text-sm rounded-full border transition-colors min-w-[10rem] max-w-[min(100vw-3rem,20rem)] h-auto font-medium',
        hasSelection
          ? 'bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-700'
          : 'bg-transparent border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:bg-transparent'
      )
    : 'flex items-center justify-between gap-2 px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg h-auto hover:border-zinc-500 hover:bg-zinc-800 font-normal';

  return (
    <Popover open={isOpen && !disabled} onOpenChange={(open) => !disabled && setIsOpen(open)}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={isOpen}
          disabled={disabled}
          className={cn(triggerClassName, 'w-full')}
        >
          <span className={cn('truncate', !hasSelection && 'text-zinc-400')}>
            {isLoading ? 'Cargando...' : selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className='shrink-0 text-zinc-400 opacity-70' size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'p-0 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg',
          isPill ? 'w-[min(100vw-2rem,20rem)]' : 'w-full'
        )}
        align='start'
      >
        <Command className='bg-transparent'>
          <CommandInput
            placeholder='Buscar...'
            className='text-white placeholder:text-zinc-400 border-b border-zinc-700'
          />
          <CommandList>
            <CommandEmpty className='text-zinc-400 text-sm px-3 py-2'>
              Sin resultados
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className='text-zinc-200 hover:bg-zinc-700 cursor-pointer aria-selected:bg-zinc-700/80 aria-selected:text-white'
                >
                  {option.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === option.id ? 'opacity-100 text-white' : 'opacity-0'
                    )}
                    size={14}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FilterCombobox;
```

- [ ] **Step 3: Verificar build**

```bash
pnpm build
```

Esperado: sin errores TS. Si hay error de tipo en `CommandInput` (no acepta `className` directamente), buscar la prop correcta en `src/shared/components/ui/command.tsx` y ajustar.

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/ui/command.tsx src/shared/components/ui/popover.tsx src/features/home/components/subjects/FilterCombobox.tsx
git commit --author="juanpe44 <juanpe44@users.noreply.github.com>" -m "feat(ui): migrate FilterCombobox to shadcn Command + Popover"
```

---

## Verificacion final

- [ ] **Correr build limpio**

```bash
pnpm build
```

Esperado: 0 errores, 0 warnings de TS.

- [ ] **Revision visual en dev**

```bash
pnpm dev
```

Verificar en `http://localhost:4321`:
- Home: FilterCombobox (pill variant en FilterBar), ActiveTags chips con X funcional
- Upload (`/upload`): TextInput, SelectInput con dropdown shadcn, SubmitButton, SuccessModal al enviar
- Recursos (`/[id]/resumenes`): CardResourceLoading con skeleton animado

---

## Notas de implementacion

- `CommandInput` de shadcn/cmdk puede no aceptar `className` directamente si el componente lo wrappea. En ese caso, usar la clase en el wrapper `Command` o en un `div` externo.
- El adaptador `{ target: { name: 'materia', value } }` en UploadForm es intencional — evita modificar `useUploadForm` y mantiene compatibilidad con el resto del form que usa eventos nativos.
- `DialogContent` de shadcn incluye un boton X por defecto. El `[&>button]` en className lo estiliza sin necesidad de sobreescribir el componente.
