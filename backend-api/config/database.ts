/**
 * Database Configuration
 * 
 * Configuration for database connections.
 */

import { z } from 'zod';
import { env } from '$/env';

export const databaseConfigSchema = z.object({
  default: z.string(),
  connections: z.object({
    postgresql: z.object({
      url: z.string().url(),
      schema: z.string(),
    }),
  }),
  pool: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
  }),
  migrations: z.object({
    tableName: z.string(),
    directory: z.string(),
  }),
  seeds: z.object({
    directory: z.string(),
  }),
});

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

export default databaseConfigSchema.parse({
  default: env.DB_CONNECTION,
  connections: {
    postgresql: {
      url: env.DATABASE_URL,
      schema: env.DB_SCHEMA,
    },
  },
  pool: {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
  },
  migrations: {
    tableName: env.DB_MIGRATIONS_TABLE,
    directory: './prisma/migrations',
  },
  seeds: {
    directory: './prisma/seeders',
  },
});