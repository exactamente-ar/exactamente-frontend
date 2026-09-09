import React, { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-haskell';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-latex';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  py: 'python',
  'c++': 'cpp',
  c: 'c',
  cpp: 'cpp',
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  hs: 'haskell',
  rs: 'rust',
  tex: 'latex',
};

export function CodeBlock({ code, language = 'plaintext', className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const normalizedLang = LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();

  const highlightedHtml = useMemo(() => {
    const grammar = Prism.languages[normalizedLang] || Prism.languages.plaintext;
    if (!grammar) {
      return null;
    }
    try {
      return Prism.highlight(code, grammar, normalizedLang);
    } catch {
      return null;
    }
  }, [code, normalizedLang]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  const lines = useMemo(() => code.split('\n'), [code]);

  return (
    <div
      className={`group my-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/90 shadow-lg ${className}`}
    >
      {/* Obsidian-style header */}
      <div className='flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-400'>
        <span className='font-mono font-medium lowercase text-zinc-400'>{language || 'code'}</span>
        <button
          type='button'
          onClick={handleCopy}
          className='flex items-center gap-1 rounded-md px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors'
          title='Copiar código'
          aria-label='Copiar código'
        >
          {copied ? (
            <>
              <Check size={13} className='text-green-400' />
              <span className='text-[11px] text-green-400 font-medium'>Copiado</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className='text-[11px] font-medium'>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Code view */}
      <div className='overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-zinc-200'>
        <pre className='flex'>
          {lines.length > 1 && (
            <div className='mr-3 select-none text-right text-zinc-600' aria-hidden='true'>
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <code
            className='flex-1 font-mono'
            dangerouslySetInnerHTML={{
              __html: highlightedHtml || code,
            }}
          />
        </pre>
      </div>
    </div>
  );
}
