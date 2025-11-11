/**
 * Database Configuration
 *
 * Configuration for database connections.
 */

import { env } from '$/env';

export default {
  /**
   * Default Database Connection
   */
  default: env.DB_CONNECTION,

  /**
   * Database Connections
   */
  connections: {
    postgresql: {
      url: env.DATABASE_URL,
      schema: env.DB_SCHEMA,
    },
  },

  /**
   * Connection Pool Settings
   */
  pool: {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
  },

  /**
   * Migration Settings
   */
  migrations: {
    tableName: env.DB_MIGRATIONS_TABLE,
    directory: './prisma/migrations',
  },

  /**
   * Seed Settings
   */
  seeds: {
    directory: './prisma/seeders',
  },
};
