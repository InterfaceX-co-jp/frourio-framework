/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  define: { 'import.meta.vitest': false },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [tsconfigPaths() as any],
  test: {
    includeSource: ['src/**/*.{ts,tsx}'],
    exclude: ['node_modules', 'server', 'out'],
  },
})
