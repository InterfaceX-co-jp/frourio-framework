/**
 * Enhanced Prisma Client Service with Connection Pool Management
 *
 * This service provides:
 * - Connection pool configuration via environment variables
 * - Graceful shutdown handling
 * - Connection retry logic
 * - Health check functionality
 * - Proper cleanup and error handling
 *
 * Environment Variables:
 * - DATABASE_CONNECTION_POOL_SIZE: Max connections in pool (default: 10)
 * - DATABASE_CONNECTION_TIMEOUT: Connection timeout in seconds (default: 30)
 * - DATABASE_POOL_TIMEOUT: Pool timeout in seconds (default: 2)
 */

import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    // Build connection URL with pool parameters
    const databaseUrl = process.env.DATABASE_URL;
    const connectionPoolSize = parseInt(
      process.env.DATABASE_CONNECTION_POOL_SIZE || '10',
      10,
    );
    const connectionTimeout = parseInt(
      process.env.DATABASE_CONNECTION_TIMEOUT || '30',
      10,
    );
    const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '2', 10);

    // Add connection pool parameters to URL if not already present
    let enhancedUrl = databaseUrl;
    if (databaseUrl && !databaseUrl.includes('connection_limit')) {
      const separator = databaseUrl.includes('?') ? '&' : '?';
      enhancedUrl = `${databaseUrl}${separator}connection_limit=${connectionPoolSize}&pool_timeout=${poolTimeout}&connect_timeout=${connectionTimeout}`;
    }

    prisma = new PrismaClient({
      // Connection pool configuration
      datasources: {
        db: {
          url: enhancedUrl,
        },
      },
      // Logging configuration
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
      // Error formatting
      errorFormat: 'pretty',
    });

    // Test connection on initialization
    prisma.$connect().catch((error) => {
      console.error('Failed to connect to database on initialization:', error);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async () => {
      if (prisma) {
        console.log('Disconnecting Prisma Client...');
        try {
          await prisma.$disconnect();
          prisma = null;
          console.log('Prisma Client disconnected');
        } catch (error) {
          console.error('Error during Prisma Client disconnect:', error);
          prisma = null;
        }
      }
    };

    // Register shutdown handlers (only once)
    if (!process.listenerCount('SIGINT')) {
      process.on('SIGINT', gracefulShutdown);
    }
    if (!process.listenerCount('SIGTERM')) {
      process.on('SIGTERM', gracefulShutdown);
    }
    if (!process.listenerCount('beforeExit')) {
      process.on('beforeExit', gracefulShutdown);
    }
  }

  return prisma;
};

// Function to manually disconnect (useful for testing)
export const disconnectPrismaClient = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};

// Function to execute database operations with retry logic
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `Database operation failed (attempt ${attempt}/${maxRetries}):`,
        error,
      );

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

// Function to check connection health with retry
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await withRetry(
      async () => {
        const client = getPrismaClient();
        await client.$queryRaw`SELECT 1`;
      },
      2,
      500,
    );

    return true;
  } catch (error) {
    console.error('Database connection check failed after retries:', error);

    return false;
  }
};

// Function to reset connection (useful when connection is stale)
export const resetPrismaConnection = async (): Promise<void> => {
  if (prisma) {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.warn('Error disconnecting stale connection:', error);
    }
    prisma = null;
  }
  // Next call to getPrismaClient() will create a new connection
};
