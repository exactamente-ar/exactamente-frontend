import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Code2, Sigma } from 'lucide-react';

interface FormatOption {
  label: string;
  category: 'math' | 'code';
  snippet: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    label: 'LaTeX (Fórmula)',
    category: 'math',
    snippet: '$$\n\n$$',
  },
  {
    label: 'Python',
    category: 'code',
    snippet: '```python\n\n```',
  },
  {
    label: 'C / C++',
    category: 'code',
    snippet: '```cpp\n\n```',
  },
  {
    label: 'Haskell',
    category: 'code',
    snippet: '```haskell\n\n```',
  },
  {
    label: 'Java',
    category: 'code',
    snippet: '```java\n\n```',
  },
  {
    label: 'SQL',
    category: 'code',
    snippet: '```sql\n\n```',
  },
  {
    label: 'R',
    category: 'code',
    snippet: '```r\n\n```',
  },
  {
    label: 'Rust',
    category: 'code',
    snippet: '```rust\n\n```',
  },
  {
    label: 'TypeScript / JS',
    category: 'code',
    snippet: '```typescript\n\n```',
  },
  {
    label: 'Bash / Terminal',
    category: 'code',
    snippet: '```bash\n\n```',
  },
  {
    label: 'Código genérico',
    category: 'code',
    snippet: '```\n\n```',
  },
];

interface FormatSelectorProps {
  onSelectFormat: (snippet: string) => void;
  className?: string;
}

export function FormatSelector({ onSelectFormat, className = '' }: FormatSelectorProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(snippet: string) {
    onSelectFormat(snippet);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-colors ${className}`}
          title='Formato de código o LaTeX'
          aria-label='Formato de código o LaTeX'
        >
          <Code2 size={18} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-56 p-1.5 bg-zinc-900 border-zinc-700 text-zinc-100 shadow-xl rounded-xl z-[60]'
      >
        <div className='flex flex-col gap-0.5 text-xs'>
          <div className='px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500'>
            Fórmulas Matemáticas
          </div>
          {FORMAT_OPTIONS.filter((o) => o.category === 'math').map((option) => (
            <button
              key={option.label}
              type='button'
              onClick={() => handleSelect(option.snippet)}
              className='flex items-center gap-2 rounded-lg px-2 py-1.5 text-left font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors'
            >
              <Sigma size={14} className='text-yellow-400' />
              <span>{option.label}</span>
            </button>
          ))}

          <div className='mt-1 border-t border-zinc-800/80 px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500'>
            Lenguajes de Programación
          </div>
          <div className='max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5'>
            {FORMAT_OPTIONS.filter((o) => o.category === 'code').map((option) => (
              <button
                key={option.label}
                type='button'
                onClick={() => handleSelect(option.snippet)}
                className='flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors'
              >
                <Code2 size={14} className='text-sky-400' />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
