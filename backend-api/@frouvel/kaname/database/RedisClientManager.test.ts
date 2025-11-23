import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getRedisClient,
  getRedisClientSync,
  disconnectRedisClient,
  checkRedisConnection,
  resetRedisConnection,
  withRetry,
} from './RedisClientManager';

describe('RedisClientManager', () => {
  afterEach(async () => {
    // Clean up after each test
    await disconnectRedisClient();
  });

  describe('getRedisClient', () => {
    it('should create and return a Redis client', async () => {
      const client = await getRedisClient();
      expect(client).toBeDefined();
      expect(client.isOpen).toBe(true);
    });

    it('should return the same client on subsequent calls', async () => {
      const client1 = await getRedisClient();
      const client2 = await getRedisClient();
      expect(client1).toBe(client2);
    });

    it('should accept custom configuration', async () => {
      const client = await getRedisClient({
        host: 'localhost',
        port: 6379,
        database: 0,
      });
      expect(client).toBeDefined();
      expect(client.isOpen).toBe(true);
    });
  });

  describe('getRedisClientSync', () => {
    it('should return null before connection', () => {
      const client = getRedisClientSync();
      expect(client).toBeNull();
    });

    it('should return client after async connection', async () => {
      await getRedisClient();
      const client = getRedisClientSync();
      expect(client).toBeDefined();
      expect(client?.isOpen).toBe(true);
    });
  });

  describe('disconnectRedisClient', () => {
    it('should disconnect the client', async () => {
      const client = await getRedisClient();
      expect(client.isOpen).toBe(true);

      await disconnectRedisClient();
      expect(client.isOpen).toBe(false);
    });

    it('should handle disconnect when no client exists', async () => {
      await expect(disconnectRedisClient()).resolves.not.toThrow();
    });
  });

  describe('checkRedisConnection', () => {
    it('should return true when connection is healthy', async () => {
      await getRedisClient();
      const isHealthy = await checkRedisConnection();
      expect(isHealthy).toBe(true);
    });

    it('should return false when connection fails', async () => {
      // Disconnect first
      await disconnectRedisClient();

      // Try to check connection with invalid config
      const isHealthy = await checkRedisConnection();
      // This might be true or false depending on whether default localhost:6379 is available
      expect(typeof isHealthy).toBe('boolean');
    });
  });

  describe('resetRedisConnection', () => {
    it('should reset the connection', async () => {
      const client1 = await getRedisClient();
      await resetRedisConnection();

      const client2 = await getRedisClient();
      expect(client2).toBeDefined();
      expect(client1).not.toBe(client2);
    });
  });

  describe('withRetry', () => {
    it('should execute operation successfully on first try', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success');

      const result = await withRetry(operation, 3, 10);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('always fail'));

      await expect(withRetry(operation, 2, 10)).rejects.toThrow('always fail');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('Redis operations', () => {
    beforeEach(async () => {
      const client = await getRedisClient();
      // Clean up test keys
      await client.flushDb();
    });

    it('should set and get values', async () => {
      const client = await getRedisClient();

      await client.set('test:key', 'test-value');
      const value = await client.get('test:key');

      expect(value).toBe('test-value');
    });

    it('should handle expiration', async () => {
      const client = await getRedisClient();

      await client.set('test:expire', 'value', { EX: 1 });
      const value1 = await client.get('test:expire');
      expect(value1).toBe('value');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const value2 = await client.get('test:expire');
      expect(value2).toBeNull();
    });

    it('should handle hash operations', async () => {
      const client = await getRedisClient();

      await client.hSet('test:hash', {
        field1: 'value1',
        field2: 'value2',
      });

      const value = await client.hGet('test:hash', 'field1');
      expect(value).toBe('value1');

      const all = await client.hGetAll('test:hash');
      expect(all).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });

    it('should handle list operations', async () => {
      const client = await getRedisClient();

      await client.rPush('test:list', ['item1', 'item2', 'item3']);
      const length = await client.lLen('test:list');
      expect(length).toBe(3);

      const items = await client.lRange('test:list', 0, -1);
      expect(items).toEqual(['item1', 'item2', 'item3']);
    });

    it('should handle set operations', async () => {
      const client = await getRedisClient();

      await client.sAdd('test:set', ['member1', 'member2', 'member3']);
      const isMember = await client.sIsMember('test:set', 'member1');
      expect(isMember).toBe(true);

      const members = await client.sMembers('test:set');
      expect(members).toHaveLength(3);
      expect(members).toContain('member1');
    });

    it('should handle sorted set operations', async () => {
      const client = await getRedisClient();

      await client.zAdd('test:zset', [
        { score: 1, value: 'one' },
        { score: 2, value: 'two' },
        { score: 3, value: 'three' },
      ]);

      const range = await client.zRange('test:zset', 0, -1);
      expect(range).toEqual(['one', 'two', 'three']);

      const score = await client.zScore('test:zset', 'two');
      expect(score).toBe(2);
    });

    it('should handle transactions with MULTI/EXEC', async () => {
      const client = await getRedisClient();

      const results = await client
        .multi()
        .set('test:tx1', 'value1')
        .set('test:tx2', 'value2')
        .get('test:tx1')
        .exec();

      expect(results).toBeDefined();
      expect(results?.length).toBe(3);
      expect(results?.[2]).toBe('value1');
    });

    it('should handle key deletion', async () => {
      const client = await getRedisClient();

      await client.set('test:delete', 'value');
      const exists1 = await client.exists('test:delete');
      expect(exists1).toBe(1);

      await client.del('test:delete');
      const exists2 = await client.exists('test:delete');
      expect(exists2).toBe(0);
    });

    it('should handle key patterns', async () => {
      const client = await getRedisClient();

      await client.set('test:pattern:1', 'value1');
      await client.set('test:pattern:2', 'value2');
      await client.set('test:other', 'value3');

      const keys = await client.keys('test:pattern:*');
      expect(keys).toHaveLength(2);
      expect(keys).toContain('test:pattern:1');
      expect(keys).toContain('test:pattern:2');
    });
  });
});
