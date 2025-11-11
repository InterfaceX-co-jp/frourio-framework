/**
 * Application Configuration
 * 
 * This file contains core application settings.
 */

import { z } from 'zod';
import { env } from '$/env';

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
  name: env.APP_NAME,
  env: env.NODE_ENV,
  debug: env.APP_DEBUG,
  url: env.APP_URL,
  timezone: env.TZ,
  locale: env.APP_LOCALE,
  fallbackLocale: env.APP_FALLBACK_LOCALE,
});