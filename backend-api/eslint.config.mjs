import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-expressions': 'warn',

      // Code quality rules
      eqeqeq: 'error',
      complexity: ['error', 15],
      'max-depth': ['error', 3],
      'max-nested-callbacks': ['error', 4],
      'max-lines': ['error', 300],
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',

      // Disable formatting rules (let Prettier handle these)
      indent: 'off',
      '@typescript-eslint/indent': 'off',
      'no-mixed-spaces-and-tabs': 'off',
      'no-trailing-spaces': 'off',
      'linebreak-style': 'off',
      'newline-before-return': 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'comma-spacing': 'off',
      'key-spacing': 'off',
      'keyword-spacing': 'off',
      semi: 'off',
      '@typescript-eslint/semi': 'off',
      quotes: 'off',
      '@typescript-eslint/quotes': 'off',
      'comma-dangle': 'off',
      '@typescript-eslint/comma-dangle': 'off',
    },
  },
  {
    ignores: [
      'index.js',
      '__generated__/**/*',
      '$server.ts',
      'prisma/__generated__/**/*',
    ],
  },
];
