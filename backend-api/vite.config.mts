/// <reference types="vitest" />
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

dotenv.config();

export default defineConfig({
  define: { 'import.meta.vitest': false },
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        process.env.DATABASE_URL ??
        'postgresql://root:root@localhost:5432/frourio_framework_test',
      API_JWT_SECRET:
        process.env.API_JWT_SECRET ?? 'test-secret-key-for-testing',
      WEB_FRONTEND_URL: process.env.WEB_FRONTEND_URL ?? 'http://localhost:3000',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? 'admin@test.com',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'TestPassword123!',
    },
    setupFiles: ['@frouvel/kaname/testing/setup.ts'],
    includeSource: ['**/*.ts'],
    hookTimeout: 100000,
    testTimeout: 10000,
  },
});