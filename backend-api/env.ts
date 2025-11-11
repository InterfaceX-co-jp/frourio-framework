import dotenv from 'dotenv';
import { z } from 'zod';
import { Env } from './@frouvel/kaname/env/Env.js';

dotenv.config();

export const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_NAME: z.string().default('Frourio Framework'),
  APP_DEBUG: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default('true'),
  APP_URL: z.string().url().default('http://localhost:8080'),
  APP_LOCALE: z.string().default('en'),
  APP_FALLBACK_LOCALE: z.string().default('en'),
  TZ: z.string().default('UTC'),

  // Database
  DATABASE_URL: z.string().url(),
  DB_CONNECTION: z.string().default('postgresql'),
  DB_SCHEMA: z.string().default('public'),
  DB_POOL_MIN: z.coerce.number().min(1).default(2),
  DB_POOL_MAX: z.coerce.number().min(1).default(10),
  DB_MIGRATIONS_TABLE: z.string().default('migrations'),

  // API Server
  API_SERVER_PORT: z.coerce.number().min(1024).max(65535).default(8080),
  API_BASE_PATH: z.string().default('/api'),

  // JWT Authentication
  API_JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.coerce.number().positive().default(86400),
  JWT_REFRESH_EXPIRES_IN: z.coerce.number().positive().default(604800),
  JWT_ISSUER: z.string().default('frourio-framework'),
  JWT_AUDIENCE: z.string().default('frourio-framework-api'),

  // Admin
  ADMIN_EMAIL: z.string().email().default('admin@frourio-framework.com'),
  ADMIN_PASSWORD: z.string().min(1).default('Qwerty1!'),
  ADMIN_SESSION_TIMEOUT: z.coerce.number().positive().default(3600),
  ADMIN_TOKEN_EXPIRATION: z.coerce.number().positive().default(86400),

  // CORS
  WEB_FRONTEND_URL: z.string().url(),
  CORS_ADDITIONAL_ORIGINS: z.string().optional().default(''),
});

Env.registerSchema(envSchema);

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;