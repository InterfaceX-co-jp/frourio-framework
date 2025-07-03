/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  define: { 'import.meta.vitest': false },
  plugins: [tsconfigPaths()],
  test: {
    includeSource: ['src/**/*.{ts,tsx}'],
    exclude: ['node_modules', 'server', 'out'],
  },
})
