export type ContentToken =
  | { type: 'text'; content: string }
  | { type: 'inline-code'; content: string }
  | { type: 'code-block'; content: string; language: string }
  | { type: 'inline-math'; content: string }
  | { type: 'block-math'; content: string };

/**
 * Expresión regular que matchea los 4 tipos de bloques en orden de precedencia:
 * 1. Bloque de código: ```lang\ncode```
 * 2. Bloque LaTeX: $$formula$$
 * 3. Código inline: `code`
 * 4. LaTeX inline: $formula$
 */
const TOKEN_REGEX =
  /(?:```([a-zA-Z0-9_+#.-]*)\r?\n?([\s\S]*?)```)|(?:\$\$([\s\S]+?)\$\$)|(?:`([^`\r\n]+)`)|(?:\$(?!\s)([^$\r\n]+?)(?<!\s)\$)/g;

/**
 * Determina si el texto dentro de $...$ parece ser solo un precio en dinero
 * (ej: "500", "1.500", "20,50") sin símbolos matemáticos.
 */
function isPlainCurrency(text: string): boolean {
  return /^\d+(?:[.,]\d+)?$/.test(text.trim());
}

/**
 * Tokeniza un texto reconociendo bloques de código, código inline y fórmulas LaTeX.
 */
export function parseContent(text: string): ContentToken[] {
  if (!text || !text.trim()) {
    return [];
  }

  const tokens: ContentToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN_REGEX.lastIndex = 0;

  while ((match = TOKEN_REGEX.exec(text)) !== null) {
    const matchIndex = match.index;

    // Texto previo al token
    if (matchIndex > lastIndex) {
      tokens.push({
        type: 'text',
        content: text.slice(lastIndex, matchIndex),
      });
    }

    const [fullMatch, codeLang, codeContent, blockMath, inlineCode, inlineMath] = match;

    if (codeContent !== undefined) {
      // 1. Bloque de código ```lang\ncode```
      tokens.push({
        type: 'code-block',
        language: (codeLang || 'plaintext').trim().toLowerCase(),
        content: codeContent.replace(/^\r?\n/, '').replace(/\r?\n$/, ''),
      });
    } else if (blockMath !== undefined) {
      // 2. Bloque matemático $$...$$
      tokens.push({
        type: 'block-math',
        content: blockMath.trim(),
      });
    } else if (inlineCode !== undefined) {
      // 3. Código inline `...`
      tokens.push({
        type: 'inline-code',
        content: inlineCode,
      });
    } else if (inlineMath !== undefined) {
      // 4. LaTeX inline $...$
      if (isPlainCurrency(inlineMath)) {
        // Tratar como texto plano si parece un precio
        tokens.push({
          type: 'text',
          content: fullMatch,
        });
      } else {
        tokens.push({
          type: 'inline-math',
          content: inlineMath,
        });
      }
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  // Texto restante tras el último token
  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  // Fusionar tokens de texto consecutivos si los hubiera
  const merged: ContentToken[] = [];
  for (const token of tokens) {
    const prev = merged[merged.length - 1];
    if (prev && prev.type === 'text' && token.type === 'text') {
      prev.content += token.content;
    } else {
      merged.push(token);
    }
  }

  return merged;
}
