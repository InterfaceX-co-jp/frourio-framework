module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:tailwindcss/recommended',
    'prettier',
    'plugin:@next/next/recommended',
  ],
  plugins: ['@typescript-eslint', 'react'],
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/self-closing-comp': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    eqeqeq: 'error',
    complexity: ['error', 5],
    'max-depth': ['error', 1],
    'max-nested-callbacks': ['error', 3],
    'max-lines': ['error', 200],
    'object-shorthand': ['error', 'always'],
    'prefer-template': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'error',
    'tailwindcss/no-custom-classname': 'off',
    '@typescript-eslint/no-unused-expressions': 'warn',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: { '@typescript-eslint/no-var-requires': ['off'] },
    },
    {
      files: ['*.test.ts'],
      rules: { 'max-lines': 'off', 'max-nested-callbacks': 'off', 'max-depth': 'off', 'next-line': 'off' },
    },
  ],
}
