/**
 * Admin Configuration
 * 
 * Configuration for admin user credentials and settings.
 */

import { z } from 'zod';
import { env } from '$/env';

export const adminConfigSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  sessionTimeout: z.number().positive(),
  tokenExpiration: z.number().positive(),
});

export type AdminConfig = z.infer<typeof adminConfigSchema>;

export default adminConfigSchema.parse({
  email: env.ADMIN_EMAIL,
  password: env.ADMIN_PASSWORD,
  sessionTimeout: env.ADMIN_SESSION_TIMEOUT,
  tokenExpiration: env.ADMIN_TOKEN_EXPIRATION,
});