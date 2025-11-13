/**
 * Admin Configuration
 * 
 * Configuration for admin user credentials and settings.
 */

import { z } from 'zod';

export const adminConfigSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  sessionTimeout: z.number().positive(),
  tokenExpiration: z.number().positive(),
});

export type AdminConfig = z.infer<typeof adminConfigSchema>;

export default adminConfigSchema.parse({
  email: process.env.ADMIN_EMAIL || 'admin@frourio-framework.com',
  password: process.env.ADMIN_PASSWORD || 'Qwerty1!',
  sessionTimeout: Number(process.env.ADMIN_SESSION_TIMEOUT || 3600),
  tokenExpiration: Number(process.env.ADMIN_TOKEN_EXPIRATION || 86400),
});