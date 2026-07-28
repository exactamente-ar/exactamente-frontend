import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.vercel/**',
      'node_modules/**',
      // Generado por `pnpm gen:api`.
      'src/shared/types/api.d.ts',
      '.claude/**',
      '_bmad/**',
      '_bmad-output/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    // Scripts de tooling: corren en Node, no en el navegador.
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },

  // Islands de React
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // `_` para lo que se descarta a propósito, e ignoreRestSiblings para el
      // patrón `const { a, ...resto } = obj` que se usa para omitir campos.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },

  // Componentes .astro — necesitan astro-eslint-parser
  ...astro.configs.recommended,

  // Prettier último: apaga todo lo que sea formato para que no compita.
  prettier,
);
