/**
 * JWT Configuration
 * 
 * Configuration for JSON Web Token authentication.
 */

import { z } from 'zod';
import { env } from '$/env';

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
  secret: env.API_JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  scope: {
    admin: ['admin'] as const,
    user: {
      default: ['user'] as const,
    },
  },
  algorithm: 'HS256' as const,
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
});