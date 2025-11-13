/**
 * Application Configuration
 * 
 * This file contains core application settings.
 */

import { z } from 'zod';

export const appConfigSchema = z.object({
  name: z.string(),
  env: z.enum(['development', 'production', 'test']),
  debug: z.boolean(),
  url: z.string().url(),
  timezone: z.string(),
  locale: z.string(),
  fallbackLocale: z.string(),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export default appConfigSchema.parse({
  name: process.env.APP_NAME || 'Frourio Framework',
  env: process.env.NODE_ENV || 'development',
  debug: process.env.APP_DEBUG === 'true',
  url: process.env.APP_URL || 'http://localhost:8080',
  timezone: process.env.TZ || 'UTC',
  locale: process.env.APP_LOCALE || 'en',
  fallbackLocale: process.env.APP_FALLBACK_LOCALE || 'en',
});