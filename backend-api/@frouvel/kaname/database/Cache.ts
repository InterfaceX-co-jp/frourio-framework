/* eslint-disable max-lines */
import redisConfig from '../../../config/redis';
import type { RedisClientType } from './RedisClientManager';
import { getRedisClient, resetRedisConnection } from './RedisClientManager';

/**
 * Cache Facade
 *
 * Laravel-style cache interface for Redis operations.
 * Provides a clean, intuitive API for caching data.
 *
 * @example
 * ```typescript
 * import { Cache } from '$/@frouvel/kaname/database';
 *
 * // Store data
 * await Cache.put('user:1', userData, 3600); // Expires in 1 hour
 * await Cache.forever('settings', settings); // Never expires
 *
 * // Retrieve data
 * const user = await Cache.get('user:1');
 * const user = await Cache.get('user:1', defaultValue);
 *
 * // Remember pattern (get or compute and cache)
 * const user = await Cache.remember('user:1', 3600, async () => {
 *   return await fetchUserFromDatabase(1);
 * });
 *
 * // Check existence
 * if (await Cache.has('user:1')) {
 *   // ...
 * }
 *
 * // Delete
 * await Cache.forget('user:1');
 * await Cache.flush(); // Clear all
 *
 * // Atomic operations
 * await Cache.increment('page_views');
 * await Cache.decrement('stock_count', 5);
 *
 * // Pull (get and delete)
 * const value = await Cache.pull('temp_token');
 * ```
 */
class CacheFacade {
  private defaultConnection: string = 'cache';
  private keyPrefix: string = redisConfig.keyPrefix ?? '';
  private defaultTTL: number | undefined = redisConfig.defaultTTL;

  private resolveConnection(connection?: string): string {
    return connection ?? this.defaultConnection;
  }

  private formatKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}${key}` : key;
  }

  private stripPrefix(key: string): string {
    return this.keyPrefix && key.startsWith(this.keyPrefix)
      ? key.slice(this.keyPrefix.length)
      : key;
  }

  private resolveTTL(ttl?: number): number | undefined {
    const resolved = ttl ?? this.defaultTTL;
    return resolved && resolved > 0 ? resolved : undefined;
  }

  private serialize(value: any): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  private deserialize<T>(value: string | null): T | null {
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /**
   * Initialize is optional - the facade will use the default Redis connection
   */
  init(): void {
    // Cache facade uses the global Redis connection
    // No initialization needed
  }

  /**
   * Get the Redis client
   */
  private async getRedis(connection?: string): Promise<RedisClientType> {
    const name = this.resolveConnection(connection);
    return await getRedisClient(undefined, name);
  }

  /**
   * Retrieve an item from the cache
   *
   * @example
   * ```typescript
   * const value = await Cache.get('key');
   * const value = await Cache.get('key', 'default');
   * const value = await Cache.get<User>('user:1');
   * ```
   */
  async get<T = string>(
    key: string,
    defaultValue?: T,
    connection?: string,
  ): Promise<T | null> {
    const redis = await this.getRedis(connection);
    const value = await redis.get(this.formatKey(key));
    const deserialized = this.deserialize<T>(value);
    if (deserialized === null) {
      return defaultValue ?? null;
    }
    return deserialized;
  }

  /**
   * Store an item in the cache
   *
   * @param key - Cache key
   * @param value - Value to cache (will be JSON serialized)
   * @param ttl - Time to live in seconds (optional)
   *
   * @example
   * ```typescript
   * await Cache.put('user:1', userData, 3600); // 1 hour
   * await Cache.put('settings', settings); // No expiration
   * ```
   */
  async put(
    key: string,
    value: any,
    ttl?: number,
    connection?: string,
  ): Promise<void> {
    const redis = await this.getRedis(connection);
    const serialized = this.serialize(value);
    const ttlToUse = this.resolveTTL(ttl);
    const formattedKey = this.formatKey(key);

    if (ttlToUse) {
      await redis.set(formattedKey, serialized, { EX: ttlToUse });
    } else {
      await redis.set(formattedKey, serialized);
    }
  }

  /**
   * Store an item in the cache indefinitely
   *
   * @example
   * ```typescript
   * await Cache.forever('app_settings', settings);
   * ```
   */
  async forever(key: string, value: any, connection?: string): Promise<void> {
    return this.put(key, value, undefined, connection);
  }

  /**
   * Retrieve an item from cache or store the default value
   *
   * @example
   * ```typescript
   * const user = await Cache.remember('user:1', 3600, async () => {
   *   return await db.user.findUnique({ where: { id: 1 } });
   * });
   * ```
   */
  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>,
    connection?: string,
  ): Promise<T> {
    const cached = await this.get<T>(key, undefined, connection);

    if (cached !== null) {
      return cached;
    }

    const value = await callback();
    await this.put(key, value, ttl, connection);

    return value;
  }

  /**
   * Retrieve an item from cache or store it indefinitely
   *
   * @example
   * ```typescript
   * const settings = await Cache.rememberForever('app_settings', async () => {
   *   return await loadSettingsFromConfig();
   * });
   * ```
   */
  async rememberForever<T>(
    key: string,
    callback: () => Promise<T>,
    connection?: string,
  ): Promise<T> {
    const cached = await this.get<T>(key, undefined, connection);

    if (cached !== null) {
      return cached;
    }

    const value = await callback();
    await this.forever(key, value, connection);

    return value;
  }

  /**
   * Retrieve an item and delete it
   *
   * @example
   * ```typescript
   * const token = await Cache.pull('temp_token');
   * // token is retrieved and removed from cache
   * ```
   */
  async pull<T = string>(
    key: string,
    defaultValue?: T,
    connection?: string,
  ): Promise<T | null> {
    const value = await this.get<T>(key, defaultValue, connection);
    await this.forget(key, connection);
    return value;
  }

  /**
   * Check if an item exists in the cache
   *
   * @example
   * ```typescript
   * if (await Cache.has('user:1')) {
   *   // Item exists
   * }
   * ```
   */
  async has(key: string, connection?: string): Promise<boolean> {
    const redis = await this.getRedis(connection);
    const exists = await redis.exists(this.formatKey(key));
    return exists === 1;
  }

  /**
   * Remove an item from the cache
   *
   * @example
   * ```typescript
   * await Cache.forget('user:1');
   * ```
   */
  async forget(key: string, connection?: string): Promise<boolean> {
    const redis = await this.getRedis(connection);
    const deleted = await redis.del(this.formatKey(key));
    return deleted > 0;
  }

  /**
   * Remove multiple items from the cache
   *
   * @example
   * ```typescript
   * await Cache.forgetMany(['user:1', 'user:2', 'user:3']);
   * ```
   */
  async forgetMany(keys: string[], connection?: string): Promise<number> {
    const redis = await this.getRedis(connection);
    const formatted = keys.map((k) => this.formatKey(k));
    return await redis.del(formatted);
  }

  /**
   * Remove all items from the cache
   *
   * @example
   * ```typescript
   * await Cache.flush();
   * ```
   */
  async flush(connection?: string): Promise<void> {
    const redis = await this.getRedis(connection);
    if (this.keyPrefix) {
      const keys = await redis.keys(`${this.keyPrefix}*`);
      if (keys.length) {
        await redis.del(keys);
      }
      return;
    }
    await redis.flushDb();
  }

  /**
   * Increment a numeric value in the cache
   *
   * @example
   * ```typescript
   * await Cache.increment('page_views');
   * await Cache.increment('counter', 5);
   * ```
   */
  async increment(
    key: string,
    value: number = 1,
    connection?: string,
  ): Promise<number> {
    const redis = await this.getRedis(connection);
    const formattedKey = this.formatKey(key);

    if ('incrBy' in redis) {
      const result = await (redis as any).incrBy(formattedKey, value);
      return typeof result === 'number' ? result : parseInt(String(result), 10);
    }

    const client = redis as any;
    const current = await client.get(formattedKey);
    const existingTTL = await this.ttl(key, connection);
    const newValue = (parseInt(current || '0', 10) + value).toString();

    if (existingTTL > 0) {
      await client.set(formattedKey, newValue, { EX: existingTTL });
    } else {
      await client.set(formattedKey, newValue);
    }

    return parseInt(newValue, 10);
  }

  /**
   * Decrement a numeric value in the cache
   *
   * @example
   * ```typescript
   * await Cache.decrement('stock_count');
   * await Cache.decrement('remaining', 5);
   * ```
   */
  async decrement(
    key: string,
    value: number = 1,
    connection?: string,
  ): Promise<number> {
    return this.increment(key, -value, connection);
  }

  /**
   * Get the remaining time to live in seconds
   *
   * @returns -2 if key doesn't exist, -1 if no expiration, positive number otherwise
   *
   * @example
   * ```typescript
   * const ttl = await Cache.ttl('user:1');
   * if (ttl > 0) {
   *   console.log(`Expires in ${ttl} seconds`);
   * }
   * ```
   */
  async ttl(key: string, connection?: string): Promise<number> {
    const redis = await this.getRedis(connection);
    const formattedKey = this.formatKey(key);

    if ('ttl' in redis) {
      return await redis.ttl(formattedKey);
    }

    return -1;
  }

  /**
   * Set expiration on an existing key
   *
   * @example
   * ```typescript
   * await Cache.expire('user:1', 3600); // Expire in 1 hour
   * ```
   */
  async expire(
    key: string,
    seconds: number,
    connection?: string,
  ): Promise<boolean> {
    const redis = await this.getRedis(connection);
    const formattedKey = this.formatKey(key);

    if ('expire' in redis && typeof redis.expire === 'function') {
      return await (redis as any).expire(formattedKey, seconds);
    }

    const value = await (redis as any).get(formattedKey);
    if (value === null) return false;

    await (redis as any).set(formattedKey, value, { EX: seconds });
    return true;
  }

  /**
   * Get multiple cache values
   *
   * @example
   * ```typescript
   * const values = await Cache.many(['user:1', 'user:2', 'user:3']);
   * ```
   */
  async many<T = string>(
    keys: string[],
    connection?: string,
  ): Promise<Record<string, T | null>> {
    const redis = await this.getRedis(connection);
    const formattedKeys = keys.map((key) => this.formatKey(key));

    const values =
      'mGet' in redis
        ? await (redis as any).mGet(formattedKeys)
        : await Promise.all(
            formattedKeys.map((key) => (redis as any).get(key)),
          );

    return keys.reduce<Record<string, T | null>>((acc, key, index) => {
      acc[key] = this.deserialize<T>(values[index]) ?? null;
      return acc;
    }, {});
  }

  /**
   * Store multiple items in the cache
   *
   * @example
   * ```typescript
   * await Cache.putMany({
   *   'user:1': user1,
   *   'user:2': user2,
   * }, 3600);
   * ```
   */
  async putMany(
    values: Record<string, any>,
    ttl?: number,
    connection?: string,
  ): Promise<void> {
    const redis = await this.getRedis(connection);
    const ttlToUse = this.resolveTTL(ttl);
    const entries = Object.entries(values).map(([key, value]) => ({
      key: this.formatKey(key),
      value: this.serialize(value),
    }));

    if (!ttlToUse && 'mSet' in redis) {
      const payload: Record<string, string> = {};
      entries.forEach(({ key, value }) => {
        payload[key] = value;
      });
      await (redis as any).mSet(payload);
      return;
    }

    if ('multi' in redis) {
      const multi = (redis as any).multi();
      for (const { key, value } of entries) {
        if (ttlToUse) {
          multi.set(key, value, { EX: ttlToUse });
        } else {
          multi.set(key, value);
        }
      }
      await multi.exec();
      return;
    }

    await Promise.all(
      entries.map(({ key, value }) =>
        ttlToUse
          ? (redis as any).set(key, value, { EX: ttlToUse })
          : (redis as any).set(key, value),
      ),
    );
  }

  /**
   * Get all keys matching a pattern
   *
   * @example
   * ```typescript
   * const userKeys = await Cache.keys('user:*');
   * ```
   */
  async keys(pattern: string = '*', connection?: string): Promise<string[]> {
    const redis = await this.getRedis(connection);
    const prefixedPattern = this.keyPrefix
      ? `${this.keyPrefix}${pattern}`
      : pattern;
    const keys = await redis.keys(prefixedPattern);
    return keys.map((key) => this.stripPrefix(key));
  }

  /**
   * Set the default connection
   */
  setDefaultConnection(name: string): void {
    this.defaultConnection = name;
  }

  /**
   * Get the default connection name
   */
  getDefaultConnection(): string {
    return this.defaultConnection;
  }

  /**
   * Get direct access to the Redis client for advanced operations
   *
   * @example
   * ```typescript
   * const redis = Cache.getRedisClient();
   * await redis.hSet('user:1', { name: 'John', age: '30' });
   * ```
   */
  async getRedisClient(connection?: string): Promise<RedisClientType> {
    return await this.getRedis(connection);
  }

  /**
   * Reset the cache manager (useful for testing)
   */
  async reset(connection?: string): Promise<void> {
    await resetRedisConnection(this.resolveConnection(connection));
  }
}

/**
 * Global Cache Facade instance
 *
 * Import this in your code to access cache functionality.
 *
 * @example
 * ```typescript
 * import { Cache } from '$/@frouvel/kaname/database';
 *
 * await Cache.put('user:1', userData, 3600);
 * const user = await Cache.get('user:1');
 * ```
 */
export const Cache = new CacheFacade();
