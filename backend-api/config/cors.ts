/**
 * CORS Configuration
 *
 * Configure allowed origins for Cross-Origin Resource Sharing.
 */

import { z } from 'zod';
import { env } from '$/env';

export const corsConfigSchema = z.object({
  origins: z.array(z.string()),
  methods: z.array(z.string()),
  allowedHeaders: z.array(z.string()),
  exposedHeaders: z.array(z.string()),
  credentials: z.boolean(),
  maxAge: z.number().positive(),
});

export type CorsConfig = z.infer<typeof corsConfigSchema>;

export default corsConfigSchema.parse({
  origins: [
    env.WEB_FRONTEND_URL,
    ...(env.CORS_ADDITIONAL_ORIGINS
      ? env.CORS_ADDITIONAL_ORIGINS.split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : []),
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: ['X-Total-Count'],
  credentials: true,
  maxAge: 86400,
});
