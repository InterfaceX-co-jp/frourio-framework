/* eslint-disable complexity */
/**
 * Redis Client Manager with Connection Pool Management
 *
 * This service provides:
 * - Connection configuration via environment variables
 * - Graceful shutdown handling
 * - Connection retry logic
 * - Health check functionality
 * - Proper cleanup and error handling
 *
 * Environment Variables:
 * - REDIS_URL: Redis connection URL (default: redis://localhost:6379)
 * - REDIS_HOST: Redis host (default: localhost)
 * - REDIS_PORT: Redis port (default: 6379)
 * - REDIS_PASSWORD: Redis password (optional)
 * - REDIS_DB: Redis database number (default: 0)
 * - REDIS_MAX_RETRIES: Max connection retries (default: 3)
 * - REDIS_RETRY_DELAY: Retry delay in ms (default: 1000)
 */

import type { RedisClientType as NodeRedisClient } from 'redis';
import type * as Redis from 'redis';
import type { InMemoryRedisClient } from './InMemoryRedisClient';
import { createInMemoryRedisClient } from './InMemoryRedisClient';

type RedisModuleType = typeof Redis;

type NodeRedisClientType = NodeRedisClient<any, any, any>;

export type RedisClientType = InMemoryRedisClient | NodeRedisClientType;

const DEFAULT_CONNECTION = 'default';
const redisClients = new Map<string, InMemoryRedisClient | NodeRedisClient<any, any, any>>();
let redisModulePromise: Promise<RedisModuleType | null> | null = null;
let shutdownHandlersRegistered = false;

interface RedisClientConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  database?: number;
  maxRetries?: number;
  retryDelay?: number;
}

const getRedisModule = async (): Promise<RedisModuleType | null> => {
  if (!redisModulePromise) {
    redisModulePromise = import('redis').catch(() => null);
  }
  return redisModulePromise;
};

async function createRedisClient(config?: RedisClientConfig) {
  if (process.env.USE_IN_MEMORY_REDIS === '1') {
    return createInMemoryRedisClient();
  }

  const redisModule = await getRedisModule();
  if (!redisModule) {
    console.warn(
      '[RedisClientManager] redis package not installed, using in-memory Redis mock.',
    );
    return createInMemoryRedisClient();
  }

  const redisUrl =
    config?.url ||
    process.env.REDIS_URL ||
    `redis://${config?.host || process.env.REDIS_HOST || 'localhost'}:${config?.port || process.env.REDIS_PORT || '6379'}`;

  const redisPassword = config?.password || process.env.REDIS_PASSWORD;
  const redisDb = config?.database || parseInt(process.env.REDIS_DB || '0', 10);
  const maxRetries =
    config?.maxRetries || parseInt(process.env.REDIS_MAX_RETRIES || '3', 10);
  const retryDelay =
    config?.retryDelay || parseInt(process.env.REDIS_RETRY_DELAY || '1000', 10);

  const client = redisModule.createClient({
    url: redisUrl,
    password: redisPassword,
    database: redisDb,
    socket: {
      reconnectStrategy: (retries: number) => {
        if (retries > maxRetries) {
          console.error(
            `Redis connection failed after ${maxRetries} retries. Giving up.`,
          );
          return new Error('Max retries reached');
        }
        const delay = Math.min(retryDelay * Math.pow(2, retries), 5000);
        console.log(
          `Retrying Redis connection in ${delay}ms... (attempt ${retries + 1}/${maxRetries})`,
        );
        return delay;
      },
    },
  });

  // Error handling
  client.on('error', (error) => {
    console.error('Redis Client Error:', error);
  });

  client.on('connect', () => {
    console.log('Redis Client connecting...');
  });

  client.on('ready', () => {
    console.log('Redis Client ready');
  });

  client.on('reconnecting', () => {
    console.log('Redis Client reconnecting...');
  });

  client.on('end', () => {
    console.log('Redis Client connection ended');
  });

  return client;
}

const getConnectionKey = (name?: string) => name || DEFAULT_CONNECTION;

const connectClient = async (client: InMemoryRedisClient | NodeRedisClient<any, any, any>) => {
  await client.connect();
};

const registerShutdownHandlers = () => {
  if (shutdownHandlersRegistered) return;

  const gracefulShutdown = async () => {
    await disconnectRedisClient();
  };

  if (!process.listenerCount('SIGINT')) {
    process.on('SIGINT', gracefulShutdown);
  }
  if (!process.listenerCount('SIGTERM')) {
    process.on('SIGTERM', gracefulShutdown);
  }
  if (!process.listenerCount('beforeExit')) {
    process.on('beforeExit', gracefulShutdown);
  }

  shutdownHandlersRegistered = true;
};

export const getRedisClient = async (
  config?: RedisClientConfig,
  name?: string,
): Promise<RedisClientType> => {
  const key = getConnectionKey(name);
  const existing = redisClients.get(key);
  if (existing) {
    return existing;
  }

  const client = await createRedisClient(config);

  try {
    await connectClient(client);
    console.log(`Redis Client connected successfully (${key})`);
    redisClients.set(key, client);
  } catch (error) {
    console.error(
      'Failed to connect Redis Client on initialization, falling back to in-memory Redis:',
      error,
    );
    const fallback = createInMemoryRedisClient();
    await fallback.connect();
    redisClients.set(key, fallback);
  }

  registerShutdownHandlers();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return redisClients.get(key)!;
};

/**
 * Get Redis client synchronously (must be connected first)
 */
export const getRedisClientSync = (name?: string): RedisClientType | null => {
  const key = getConnectionKey(name);
  return redisClients.get(key) || null;
};

/**
 * Manually disconnect Redis client (useful for testing)
 */
export const disconnectRedisClient = async (name?: string): Promise<void> => {
  const disconnectOne = async (key: string) => {
    const client = redisClients.get(key);
    if (!client) return;
    try {
      await client.quit();
    } catch (error) {
      console.warn(`Error disconnecting Redis client (${key}):`, error);
    } finally {
      redisClients.delete(key);
    }
  };

  if (name) {
    await disconnectOne(getConnectionKey(name));
    return;
  }

  const keys = Array.from(redisClients.keys());
  for (const key of keys) {
    await disconnectOne(key);
  }
};

/**
 * Execute Redis operations with retry logic
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let lastError: Error | undefined = undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `Redis operation failed (attempt ${attempt}/${maxRetries}):`,
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

  throw lastError ?? new Error('Redis operation failed after maximum retries');
};

/**
 * Check Redis connection health with retry
 */
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    await withRetry(
      async () => {
        const client = await getRedisClient();
        await client.ping();
      },
      2,
      500,
    );

    return true;
  } catch (error) {
    console.error('Redis connection check failed after retries:', error);
    return false;
  }
};

/**
 * Reset Redis connection (useful when connection is stale)
 */
export const resetRedisConnection = async (name?: string): Promise<void> => {
  await disconnectRedisClient(name);
  // Next call to getRedisClient() will create a new connection
};
