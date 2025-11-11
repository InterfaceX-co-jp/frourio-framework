import dotenv from 'dotenv';
import { z } from 'zod';
import { Env } from './@frouvel/kaname/env/Env.js';

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  API_SERVER_PORT: z.coerce.number().min(1024).max(65535).default(8080),
  API_BASE_PATH: z.string().default('/api'),
  API_JWT_SECRET: z.string().min(1),
  WEB_FRONTEND_URL: z.string().url(),
});

Env.registerSchema(envSchema);

export const env = envSchema.parse(process.env);
