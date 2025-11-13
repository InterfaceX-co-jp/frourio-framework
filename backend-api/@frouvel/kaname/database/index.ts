/**
 * Database Module
 *
 * Provides database abstraction supporting Prisma and Drizzle ORM.
 * Use the DB facade for ORM-agnostic access with zero performance overhead.
 */

// DB Facade (recommended)
export { DB } from './DB';

// Database Manager
export { DatabaseManager } from './DatabaseManager';

// Interfaces
export type {
  DatabaseManager as IDatabaseManager,
  DatabaseConfig,
  ConnectionConfig,
} from './contracts/DatabaseManager.interface';

// Legacy Prisma utilities (deprecated, use DB.prisma() instead)
export {
  getPrismaClient,
  disconnectPrismaClient,
  withRetry,
  checkDatabaseConnection,
  resetPrismaConnection,
} from './PrismaClientManager';