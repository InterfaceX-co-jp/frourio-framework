/**
 * CORS Configuration
 *
 * Configure allowed origins for Cross-Origin Resource Sharing.
 */

import { z } from 'zod';

export const corsConfigSchema = z.object({
  origins: z.array(z.string()),
  methods: z.array(z.string()),
  allowedHeaders: z.array(z.string()),
  exposedHeaders: z.array(z.string()),
  credentials: z.boolean(),
  maxAge: z.number().positive(),
});

export type CorsConfig = z.infer<typeof corsConfigSchema>;

// Helper to get CORS origins for backward compatibility
export const CORS_ORIGINS = [
  process.env.WEB_FRONTEND_URL || 'http://localhost:3000',
  ...(process.env.CORS_ADDITIONAL_ORIGINS
    ? process.env.CORS_ADDITIONAL_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : []),
];

export default corsConfigSchema.parse({
  origins: CORS_ORIGINS,
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
