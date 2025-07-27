/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  define: { 'import.meta.vitest': false },
  plugins: [tsconfigPaths()],
  // @ts-expect-error - Vitest extends Vite config with test property
  test: {
    includeSource: ['src/**/*.{ts,tsx}'],
    exclude: ['node_modules', 'server', 'out'],
  },
})
