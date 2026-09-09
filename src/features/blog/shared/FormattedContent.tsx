import React, { useMemo } from 'react';
import { parseContent } from './utils/contentParser';
import { CodeBlock } from './CodeBlock';
import { MathBlock } from './MathBlock';

interface FormattedContentProps {
  text: string;
  className?: string;
}

export function FormattedContent({ text, className = '' }: FormattedContentProps) {
  const tokens = useMemo(() => parseContent(text), [text]);

  if (!tokens || tokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <div className={`space-y-1 text-zinc-200 leading-relaxed break-words ${className}`}>
      {tokens.map((token, index) => {
        switch (token.type) {
          case 'text':
            return (
              <span key={index} className='whitespace-pre-wrap'>
                {token.content}
              </span>
            );
          case 'inline-code':
            return (
              <code
                key={index}
                className='mx-0.5 rounded-md border border-zinc-700/60 bg-zinc-800/80 px-1.5 py-0.5 font-mono text-xs text-yellow-300'
              >
                {token.content}
              </code>
            );
          case 'code-block':
            return <CodeBlock key={index} code={token.content} language={token.language} />;
          case 'inline-math':
            return <MathBlock key={index} formula={token.content} displayMode={false} />;
          case 'block-math':
            return <MathBlock key={index} formula={token.content} displayMode={true} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
