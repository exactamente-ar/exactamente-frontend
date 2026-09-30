import React, { useMemo } from 'react';
import katex from 'katex';

interface MathBlockProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export function MathBlock({ formula, displayMode = false, className = '' }: MathBlockProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return null;
    }
  }, [formula, displayMode]);

  if (!html) {
    // Fallback en caso de error grave
    return (
      <span
        className={`inline-block font-mono text-red-400 bg-red-950/40 px-1 py-0.5 rounded text-xs ${className}`}
      >
        {formula}
      </span>
    );
  }

  if (displayMode) {
    return (
      <div
        className={`my-3 overflow-x-auto py-2 text-center text-zinc-100 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block align-middle text-zinc-100 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
