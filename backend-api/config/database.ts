/**
 * Database Configuration
 *
 * Configuration for database connections.
 */

import { z } from 'zod';

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
  default: process.env.DB_CONNECTION || 'postgresql',
  connections: {
    postgresql: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://root:root@localhost:5432/frourio_framework',
      schema: process.env.DB_SCHEMA || 'public',
    },
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
  },
  migrations: {
    tableName: process.env.DB_MIGRATIONS_TABLE || 'migrations',
    directory: './prisma/migrations',
  },
  seeds: {
    directory: './prisma/seeders',
  },
});
