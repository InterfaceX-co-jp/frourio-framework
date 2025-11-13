import type { DatabaseConfig } from '$/@frouvel/kaname/database';
import { env } from '$/env';

/**
 * Database Configuration
 *
 * Configure database connections for your application.
 * Supports both Prisma and Drizzle ORM.
 */
const databaseConfig = {
  /**
   * Default database connection
   */
  default: 'default',

  /**
   * Database connections
   */
  connections: {
    /**
     * Default Prisma connection
     */
    default: {
      driver: 'prisma',
      url: env.DATABASE_URL,
      pool: {
        min: env.DB_POOL_MIN,
        max: env.DB_POOL_MAX,
      },
    },

    // Example: Read replica (uncomment to use)
    // 'read-replica': {
    //   driver: 'prisma',
    //   url: env.READ_REPLICA_URL,
    //   pool: {
    //     min: 2,
    //     max: 5,
    //   },
    // },

    // Example: Drizzle connection (uncomment to use)
    // analytics: {
    //   driver: 'drizzle',
    //   connection: {
    //     host: env.ANALYTICS_DB_HOST,
    //     port: env.ANALYTICS_DB_PORT,
    //     user: env.ANALYTICS_DB_USER,
    //     password: env.ANALYTICS_DB_PASSWORD,
    //     database: env.ANALYTICS_DB_DATABASE,
    //   },
    // },
  },
} satisfies DatabaseConfig;

export default databaseConfig;
export type { DatabaseConfig };