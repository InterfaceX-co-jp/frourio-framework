/**
 * JWT Configuration
 * 
 * Configuration for JSON Web Token authentication.
 */

import { z } from 'zod';

export const jwtConfigSchema = z.object({
  secret: z.string().min(1),
  expiresIn: z.number().positive(),
  refreshExpiresIn: z.number().positive(),
  scope: z.object({
    admin: z.tuple([z.literal('admin')]),
    user: z.object({
      default: z.tuple([z.literal('user')]),
    }),
  }),
  algorithm: z.literal('HS256'),
  issuer: z.string(),
  audience: z.string(),
});

export type JwtConfig = z.infer<typeof jwtConfigSchema>;

export default jwtConfigSchema.parse({
  secret: process.env.API_JWT_SECRET || 'your-secret-key-change-this-in-production',
  expiresIn: Number(process.env.JWT_EXPIRES_IN || 86400),
  refreshExpiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN || 604800),
  scope: {
    admin: ['admin'] as const,
    user: {
      default: ['user'] as const,
    },
  },
  algorithm: 'HS256' as const,
  issuer: process.env.JWT_ISSUER || 'frourio-framework',
  audience: process.env.JWT_AUDIENCE || 'frourio-framework-api',
});