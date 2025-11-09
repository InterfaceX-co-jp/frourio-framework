import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import tailwindcssPlugin from 'eslint-plugin-tailwindcss'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'writable',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      tailwindcss: tailwindcssPlugin,
      '@next/next': nextPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/self-closing-comp': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js rules
      '@next/next/no-sync-scripts': 'error',

      // TypeScript rules
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      eqeqeq: 'error',
      complexity: ['error', 15],
      'max-depth': ['error', 3],
      'max-nested-callbacks': ['error', 4],
      'max-lines': ['error', 300],
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',

      // Formatting rules (let Prettier handle these)
      indent: 'off',
      '@typescript-eslint/indent': 'off',
      semi: 'off',
      '@typescript-eslint/semi': 'off',
      quotes: 'off',
      '@typescript-eslint/quotes': 'off',
      'comma-dangle': 'off',
      '@typescript-eslint/comma-dangle': 'off',

      // Tailwind rules
      'tailwindcss/no-custom-classname': 'off',
    },
  },
  {
    files: ['*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['*.test.ts', '*.test.tsx'],
    rules: {
      'max-lines': 'off',
      'max-nested-callbacks': 'off',
      'max-depth': 'off',
      complexity: ['error', 20],
    },
  },
]
