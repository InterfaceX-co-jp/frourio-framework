/**
 * Sentry Monitoring Configuration
 *
 * This file contains Sentry error monitoring and performance tracking settings.
 */

import { z } from 'zod';
import { defineConfig, type ConfigType } from '$/@frouvel/kaname/config';
import { env } from '../env';

const sentryConfig = defineConfig({
  schema: z.object({
    enabled: z.boolean().default(false),
    dsn: z.string().optional(),
    environment: z.string().optional(),
    release: z.string().optional(),
    tracesSampleRate: z.number().min(0).max(1).default(1.0),
    profilesSampleRate: z.number().min(0).max(1).default(1.0),
    debug: z.boolean().default(false),
    serverName: z.string().optional(),
    attachStacktrace: z.boolean().default(true),
    beforeSend: z.any().optional(),
    beforeSendTransaction: z.any().optional(),
    integrations: z.array(z.any()).optional(),
  }),
  load: () => ({
    enabled: env.SENTRY_ENABLED,
    dsn: env.SENTRY_DSN,
  }),
});

export type SentryConfig = ConfigType<typeof sentryConfig>;
export const sentryConfigSchema = sentryConfig.schema;
export default sentryConfig;
