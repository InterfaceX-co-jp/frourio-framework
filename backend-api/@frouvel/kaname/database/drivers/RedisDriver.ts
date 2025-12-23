import type { DatabaseDriver } from '../contracts/DatabaseDriver.interface';
import type { ConnectionConfig } from '../contracts/DatabaseManager.interface';
import { getRedisClient, type RedisClientType } from '../RedisClientManager';

/**
 * Redis database driver
 *
 * Note: Redis doesn't support traditional ACID transactions like SQL databases.
 * The transaction() method uses MULTI/EXEC for atomic command execution.
 */
export class RedisDriver implements DatabaseDriver {
  async createClient(
    config: ConnectionConfig,
    name: string,
  ): Promise<RedisClientType> {
    const redisConfig = {
      url: config.url,
      host: config.connection?.host,
      port: config.connection?.port,
      password: config.connection?.password,
      database: config.connection?.database
        ? parseInt(String(config.connection.database), 10)
        : undefined,
    };

    return await getRedisClient(redisConfig, name);
  }

  /**
   * Execute commands atomically using MULTI/EXEC
   *
   * Note: Redis MULTI/EXEC doesn't support rollback.
   * Commands are either all executed or none (if EXEC fails).
   *
   * @example
   * ```typescript
   * await transaction(client, async (multi) => {
   *   multi.set('key1', 'value1');
   *   multi.set('key2', 'value2');
   *   return await multi.exec();
   * });
   * ```
   */
  async transaction<T>(
    client: RedisClientType,
    callback: (multi: any) => Promise<T>,
  ): Promise<T> {
    const multi = client.multi();
    return await callback(multi);
  }

  async disconnect(client: RedisClientType): Promise<void> {
    if (client?.quit) {
      await client.quit();
    }
  }
}
