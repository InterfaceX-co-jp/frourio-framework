# Redis Usage Guide

Complete guide for using Redis with frourio-framework.

## Installation

```bash
npm install redis@^4.7.0
npm install -D @types/redis@^4.0.11
```

## Configuration

### 1. Environment Variables

Add to your `.env` file:

```env
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=1000
REDIS_KEY_PREFIX=
REDIS_DEFAULT_TTL=
```

### 2. Docker Compose

Redis is already configured in `docker-compose.yml`:

```bash
docker-compose up redis -d
```

### 3. Database Configuration

Update `config/database.ts` to add Redis connection:

```typescript
import { defineConfig } from '$/@frouvel/kaname/config';
import { env } from '../env';

export default defineConfig({
  schema: /* ... */,
  load: () => ({
    default: 'default',
    connections: {
      default: {
        driver: 'prisma',
        url: env.DATABASE_URL,
      },
      cache: {
        driver: 'redis',
        connection: {
          host: env.REDIS_HOST || 'localhost',
          port: parseInt(env.REDIS_PORT || '6379', 10),
          password: env.REDIS_PASSWORD,
          database: parseInt(env.REDIS_DB || '0', 10),
        },
      },
    },
  }),
});
```

## Basic Usage

### Direct Redis Access

```typescript
import { DB } from '$/@frouvel/kaname/database';

// Get Redis client
const redis = await DB.redis();

// Basic operations
await redis.set('key', 'value');
const value = await redis.get('key');
await redis.del('key');

// With expiration (in seconds)
await redis.set('session:123', 'token', { EX: 3600 });
```

### Using RedisClientManager Directly

```typescript
import { getRedisClient } from '$/@frouvel/kaname/database';

const redis = await getRedisClient();

// All Redis operations
await redis.set('user:1', JSON.stringify({ name: 'John' }));
const user = await redis.get('user:1');
```

## Common Patterns

### 1. Cache-Aside Pattern

```typescript
import { DB } from '$/@frouvel/kaname/database';

export class UserService {
  private prisma = DB.prisma();
  private redis = await DB.redis();

  async getUserById(id: string) {
    // Try cache first
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      console.log('Cache hit');
      return JSON.parse(cached);
    }

    // Cache miss - fetch from database
    console.log('Cache miss');
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      // Cache for 5 minutes
      await this.redis.set(
        cacheKey,
        JSON.stringify(user),
        { EX: 300 }
      );
    }

    return user;
  }

  async updateUser(id: string, data: any) {
    // Update database
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    // Invalidate cache
    await this.redis.del(`user:${id}`);

    return user;
  }
}
```

### 2. Session Management

```typescript
import { getRedisClient } from '$/@frouvel/kaname/database';

export class SessionService {
  private redis = await getRedisClient();

  async createSession(userId: string, token: string) {
    const sessionKey = `session:${token}`;
    await this.redis.set(
      sessionKey,
      JSON.stringify({ userId, createdAt: new Date() }),
      { EX: 86400 } // 24 hours
    );
  }

  async getSession(token: string) {
    const sessionKey = `session:${token}`;
    const session = await this.redis.get(sessionKey);
    return session ? JSON.parse(session) : null;
  }

  async deleteSession(token: string) {
    await this.redis.del(`session:${token}`);
  }

  async refreshSession(token: string) {
    const sessionKey = `session:${token}`;
    await this.redis.expire(sessionKey, 86400);
  }
}
```

### 3. Rate Limiting

```typescript
import { getRedisClient } from '$/@frouvel/kaname/database';

export class RateLimiter {
  private redis = await getRedisClient();
  private limit: number = 100;
  private window: number = 60; // seconds

  async checkLimit(identifier: string): Promise<boolean> {
    const key = `rate:${identifier}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      // First request - set expiration
      await this.redis.expire(key, this.window);
    }

    return current <= this.limit;
  }

  async getRemainingRequests(identifier: string): Promise<number> {
    const key = `rate:${identifier}`;
    const current = await this.redis.get(key);
    const count = current ? parseInt(current, 10) : 0;
    return Math.max(0, this.limit - count);
  }
}
```

### 4. Pub/Sub for Real-time Updates

```typescript
import { getRedisClient } from '$/@frouvel/kaname/database';

export class NotificationService {
  private publisher = await getRedisClient();
  private subscriber = await getRedisClient();

  async subscribe(channel: string, handler: (message: string) => void) {
    await this.subscriber.subscribe(channel, handler);
  }

  async publish(channel: string, message: any) {
    await this.publisher.publish(
      channel,
      JSON.stringify(message)
    );
  }

  async unsubscribe(channel: string) {
    await this.subscriber.unsubscribe(channel);
  }
}

// Usage
const notificationService = new NotificationService();

// Subscribe to notifications
await notificationService.subscribe('user:notifications', (message) => {
  const notification = JSON.parse(message);
  console.log('Received notification:', notification);
});

// Publish notification
await notificationService.publish('user:notifications', {
  userId: '123',
  type: 'message',
  content: 'New message received',
});
```

### 5. Sorted Set for Leaderboards

```typescript
import { getRedisClient } from '$/@frouvel/kaname/database';

export class LeaderboardService {
  private redis = await getRedisClient();
  private leaderboardKey = 'leaderboard:points';

  async addScore(userId: string, score: number) {
    await this.redis.zAdd(this.leaderboardKey, {
      score,
      value: userId,
    });
  }

  async incrementScore(userId: string, increment: number) {
    await this.redis.zIncrBy(this.leaderboardKey, increment, userId);
  }

  async getTopPlayers(count: number = 10) {
    return await this.redis.zRangeWithScores(
      this.leaderboardKey,
      0,
      count - 1,
      { REV: true }
    );
  }

  async getUserRank(userId: string) {
    return await this.redis.zRevRank(this.leaderboardKey, userId);
  }

  async getUserScore(userId: string) {
    return await this.redis.zScore(this.leaderboardKey, userId);
  }
}
```

### 6. List for Queues

```typescript
import { getRedisClient } from '$/@frouvel/kaname/database';

export class QueueService {
  private redis = await getRedisClient();

  async enqueue(queueName: string, item: any) {
    await this.redis.rPush(
      `queue:${queueName}`,
      JSON.stringify(item)
    );
  }

  async dequeue(queueName: string) {
    const item = await this.redis.lPop(`queue:${queueName}`);
    return item ? JSON.parse(item) : null;
  }

  async getQueueLength(queueName: string) {
    return await this.redis.lLen(`queue:${queueName}`);
  }

  async peekQueue(queueName: string, count: number = 10) {
    const items = await this.redis.lRange(
      `queue:${queueName}`,
      0,
      count - 1
    );
    return items.map(item => JSON.parse(item));
  }
}
```

## Repository Pattern with Redis

```typescript
import { DB } from '$/@frouvel/kaname/database';

export class UserRepository {
  private prisma = DB.prisma();
  private redis = await DB.redis();
  private cacheTTL = 300; // 5 minutes

  async findById(id: string) {
    const cacheKey = `user:${id}`;
    
    // Try cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    // Cache result
    if (user) {
      await this.redis.set(
        cacheKey,
        JSON.stringify(user),
        { EX: this.cacheTTL }
      );
    }

    return user;
  }

  async create(data: any) {
    const user = await this.prisma.user.create({ data });
    
    // Cache the new user
    await this.redis.set(
      `user:${user.id}`,
      JSON.stringify(user),
      { EX: this.cacheTTL }
    );

    return user;
  }

  async update(id: string, data: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    // Invalidate cache
    await this.redis.del(`user:${id}`);

    return user;
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    
    // Invalidate cache
    await this.redis.del(`user:${id}`);
  }

  async invalidateCache(id: string) {
    await this.redis.del(`user:${id}`);
  }

  async invalidateAllUserCaches() {
    const keys = await this.redis.keys('user:*');
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}
```

## Testing

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getRedisClient, disconnectRedisClient } from '$/@frouvel/kaname/database';

describe('Redis Integration', () => {
  let redis: any;

  beforeEach(async () => {
    redis = await getRedisClient();
    await redis.flushDb(); // Clean database before each test
  });

  afterEach(async () => {
    await disconnectRedisClient();
  });

  it('should set and get values', async () => {
    await redis.set('test:key', 'test-value');
    const value = await redis.get('test:key');
    expect(value).toBe('test-value');
  });

  it('should handle expiration', async () => {
    await redis.set('test:expire', 'value', { EX: 1 });
    
    const value1 = await redis.get('test:expire');
    expect(value1).toBe('value');

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const value2 = await redis.get('test:expire');
    expect(value2).toBeNull();
  });
});
```

## Best Practices

1. **Always set expiration**: Prevent memory leaks by setting TTL
2. **Use key prefixes**: Organize keys with prefixes like `user:`, `session:`, etc.
3. **Handle cache invalidation**: Clear cache when data changes
4. **Connection pooling**: Use the singleton pattern (already implemented)
5. **Error handling**: Always wrap Redis operations in try-catch
6. **Monitoring**: Track cache hit/miss ratios
7. **Serialization**: Use JSON for complex objects
8. **Avoid KEYS command**: Use SCAN for production key searches

## Troubleshooting

### Connection Issues

```bash
# Check if Redis is running
docker-compose ps redis

# Test connection
redis-cli ping
# Should return: PONG

# View logs
docker-compose logs redis
```

### Clear All Data

```typescript
const redis = await getRedisClient();
await redis.flushDb(); // Clear current database
await redis.flushAll(); // Clear all databases
```

### Monitor Redis

```bash
# Redis CLI
docker-compose exec redis redis-cli

# Monitor commands
MONITOR

# Get info
INFO

# Check memory usage
INFO memory

# List all keys (development only!)
KEYS *
```

## See Also

- [Database README](./README.md) - Main database documentation
- [Redis Documentation](https://redis.io/docs/)
- [node-redis Documentation](https://github.com/redis/node-redis)