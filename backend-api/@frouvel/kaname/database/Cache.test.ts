/* eslint-disable max-lines */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Cache } from './Cache';

describe('Cache Facade', () => {
  beforeEach(() => {
    // Force in-memory Redis for tests
    process.env.USE_IN_MEMORY_REDIS = '1';
  });

  afterEach(async () => {
    await Cache.flush();
    await Cache.reset();
    delete process.env.USE_IN_MEMORY_REDIS;
  });

  describe('Basic Operations', () => {
    it('should store and retrieve string values', async () => {
      await Cache.put('test:string', 'hello world');
      const value = await Cache.get('test:string');
      expect(value).toBe('hello world');
    });

    it('should store and retrieve objects', async () => {
      const data = { name: 'John', age: 30 };
      await Cache.put('test:object', data);
      const value = await Cache.get<typeof data>('test:object');
      expect(value).toEqual(data);
    });

    it('should store and retrieve arrays', async () => {
      const data = [1, 2, 3, 4, 5];
      await Cache.put('test:array', data);
      const value = await Cache.get<typeof data>('test:array');
      expect(value).toEqual(data);
    });

    it('should return null for non-existent keys', async () => {
      const value = await Cache.get('test:nonexistent');
      expect(value).toBeNull();
    });

    it('should return default value for non-existent keys', async () => {
      const value = await Cache.get('test:nonexistent', 'default');
      expect(value).toBe('default');
    });

    it('should store values with TTL', async () => {
      await Cache.put('test:ttl', 'expires', 1);
      expect(await Cache.has('test:ttl')).toBe(true);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(await Cache.has('test:ttl')).toBe(false);
    });

    it('should store values forever', async () => {
      await Cache.forever('test:forever', 'permanent');
      const value = await Cache.get('test:forever');
      expect(value).toBe('permanent');
    });
  });

  describe('Existence and Deletion', () => {
    it('should check if key exists', async () => {
      await Cache.put('test:exists', 'value');
      expect(await Cache.has('test:exists')).toBe(true);
      expect(await Cache.has('test:notexists')).toBe(false);
    });

    it('should forget a key', async () => {
      await Cache.put('test:forget', 'value');
      expect(await Cache.has('test:forget')).toBe(true);

      await Cache.forget('test:forget');
      expect(await Cache.has('test:forget')).toBe(false);
    });

    it('should forget multiple keys', async () => {
      await Cache.put('test:key1', 'value1');
      await Cache.put('test:key2', 'value2');
      await Cache.put('test:key3', 'value3');

      const deleted = await Cache.forgetMany(['test:key1', 'test:key2']);
      expect(deleted).toBe(2);

      expect(await Cache.has('test:key1')).toBe(false);
      expect(await Cache.has('test:key2')).toBe(false);
      expect(await Cache.has('test:key3')).toBe(true);
    });

    it('should flush all cache', async () => {
      await Cache.put('test:key1', 'value1');
      await Cache.put('test:key2', 'value2');

      await Cache.flush();

      expect(await Cache.has('test:key1')).toBe(false);
      expect(await Cache.has('test:key2')).toBe(false);
    });
  });

  describe('Remember Pattern', () => {
    it('should cache computed value', async () => {
      let callCount = 0;

      const getExpensiveValue = async () => {
        callCount++;
        return 'computed value';
      };

      const value1 = await Cache.remember(
        'test:remember',
        60,
        getExpensiveValue,
      );
      const value2 = await Cache.remember(
        'test:remember',
        60,
        getExpensiveValue,
      );

      expect(value1).toBe('computed value');
      expect(value2).toBe('computed value');
      expect(callCount).toBe(1); // Callback only called once
    });

    it('should recompute when cache expires', async () => {
      let callCount = 0;

      const getExpensiveValue = async () => {
        callCount++;
        return `value ${callCount}`;
      };

      const value1 = await Cache.remember('test:expire', 1, getExpensiveValue);
      expect(value1).toBe('value 1');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const value2 = await Cache.remember('test:expire', 1, getExpensiveValue);
      expect(value2).toBe('value 2');
      expect(callCount).toBe(2);
    });

    it('should remember forever', async () => {
      let callCount = 0;

      const getExpensiveValue = async () => {
        callCount++;
        return 'forever value';
      };

      const value1 = await Cache.rememberForever(
        'test:forever',
        getExpensiveValue,
      );
      const value2 = await Cache.rememberForever(
        'test:forever',
        getExpensiveValue,
      );

      expect(value1).toBe('forever value');
      expect(value2).toBe('forever value');
      expect(callCount).toBe(1);
    });
  });

  describe('Pull Pattern', () => {
    it('should retrieve and delete value', async () => {
      await Cache.put('test:pull', 'temp value');

      const value = await Cache.pull('test:pull');
      expect(value).toBe('temp value');

      const afterPull = await Cache.get('test:pull');
      expect(afterPull).toBeNull();
    });

    it('should return default when pulling non-existent key', async () => {
      const value = await Cache.pull('test:nonexistent', 'default');
      expect(value).toBe('default');
    });
  });

  describe('Atomic Operations', () => {
    it('should increment a value', async () => {
      const value1 = await Cache.increment('test:counter');
      expect(value1).toBe(1);

      const value2 = await Cache.increment('test:counter');
      expect(value2).toBe(2);

      const value3 = await Cache.increment('test:counter', 5);
      expect(value3).toBe(7);
    });

    it('should decrement a value', async () => {
      await Cache.put('test:stock', '100');

      const value1 = await Cache.decrement('test:stock');
      expect(value1).toBe(99);

      const value2 = await Cache.decrement('test:stock', 10);
      expect(value2).toBe(89);
    });
  });

  describe('Bulk Operations', () => {
    it('should get many values', async () => {
      await Cache.put('test:key1', 'value1');
      await Cache.put('test:key2', 'value2');
      await Cache.put('test:key3', 'value3');

      const values = await Cache.many([
        'test:key1',
        'test:key2',
        'test:key3',
        'test:nonexistent',
      ]);

      expect(values).toEqual({
        'test:key1': 'value1',
        'test:key2': 'value2',
        'test:key3': 'value3',
        'test:nonexistent': null,
      });
    });

    it('should put many values', async () => {
      await Cache.putMany(
        {
          'test:bulk1': 'value1',
          'test:bulk2': 'value2',
          'test:bulk3': 'value3',
        },
        60,
      );

      expect(await Cache.get('test:bulk1')).toBe('value1');
      expect(await Cache.get('test:bulk2')).toBe('value2');
      expect(await Cache.get('test:bulk3')).toBe('value3');
    });
  });

  describe('Pattern-Based Operations', () => {
    it('should get keys matching pattern', async () => {
      await Cache.put('user:1', 'user1');
      await Cache.put('user:2', 'user2');
      await Cache.put('session:abc', 'session');

      const userKeys = await Cache.keys('user:*');
      expect(userKeys).toContain('user:1');
      expect(userKeys).toContain('user:2');
      expect(userKeys).not.toContain('session:abc');
    });
  });

  describe('TTL Management', () => {
    it('should get TTL for a key', async () => {
      await Cache.put('test:ttl', 'value', 3600);

      const ttl = await Cache.ttl('test:ttl');
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(3600);
    });

    it('should return -1 for keys without expiration', async () => {
      await Cache.forever('test:noexpire', 'value');

      const ttl = await Cache.ttl('test:noexpire');
      expect(ttl).toBe(-1);
    });

    it('should return -2 for non-existent keys', async () => {
      const ttl = await Cache.ttl('test:nonexistent');
      expect(ttl).toBe(-2);
    });

    it('should set expiration on existing key', async () => {
      await Cache.forever('test:addttl', 'value');

      const success = await Cache.expire('test:addttl', 60);
      expect(success).toBe(true);

      const ttl = await Cache.ttl('test:addttl');
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(60);
    });

    it('should preserve ttl when incrementing', async () => {
      await Cache.put('test:ttl-inc', '1', 2);

      await Cache.increment('test:ttl-inc');
      const ttl = await Cache.ttl('test:ttl-inc');

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(2);
    });
  });

  describe('Connection Management', () => {
    it('should get default connection', () => {
      expect(Cache.getDefaultConnection()).toBe('cache');
    });

    it('should set default connection', () => {
      Cache.setDefaultConnection('cache');
      expect(Cache.getDefaultConnection()).toBe('cache');
    });

    it('should get Redis client for advanced operations', async () => {
      const redis = await Cache.getRedisClient();
      expect(redis).toBeDefined();
      expect(typeof redis.get).toBe('function');
    });
  });

  describe('Type Safety', () => {
    interface User {
      id: number;
      name: string;
      email: string;
    }

    it('should work with typed objects', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      await Cache.put('test:user', user);
      const retrieved = await Cache.get<User>('test:user');

      expect(retrieved).toEqual(user);
    });

    it('should work with typed remember pattern', async () => {
      const user: User = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const retrieved = await Cache.remember<User>(
        'test:remember:user',
        60,
        async () => user,
      );

      expect(retrieved).toEqual(user);
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis connection gracefully', async () => {
      // Cache uses global Redis connection, so it will use in-memory client
      const value = await Cache.get('test:nonexistent');
      expect(value).toBeNull();
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle session caching', async () => {
      const sessionId = 'sess_123';
      const sessionData = {
        userId: 1,
        expiresAt: new Date().toISOString(),
      };

      await Cache.put(`session:${sessionId}`, sessionData, 3600);

      const retrieved = await Cache.get(`session:${sessionId}`);
      expect(retrieved).toEqual(sessionData);
    });

    it('should handle rate limiting', async () => {
      const userId = 'user_1';
      const limit = 5;

      for (let i = 0; i < limit; i++) {
        await Cache.increment(`ratelimit:${userId}`);
      }

      const count = await Cache.get<number>(`ratelimit:${userId}`);
      expect(count).toBe(limit);
    });

    it('should handle API response caching', async () => {
      const apiResponse = {
        data: [{ id: 1, name: 'Item 1' }],
        timestamp: new Date().toISOString(),
      };

      await Cache.remember('api:items', 300, async () => apiResponse);

      const cached = await Cache.get('api:items');
      expect(cached).toEqual(apiResponse);
    });
  });
});
