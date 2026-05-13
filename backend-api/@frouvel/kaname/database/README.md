# Database Module

Database abstraction layer supporting Prisma, Drizzle ORM, and Redis with **zero performance overhead** through direct pass-through access.

## Philosophy

Unlike traditional ORMs that add abstraction layers, our approach:

1. **Direct Pass-Through**: Zero overhead access to Prisma/Drizzle clients
2. **No Query Builder**: Use each ORM's native API (they're already excellent!)
3. **Simple Facade**: Just connection management and transactions
4. **Type-Safe**: Full TypeScript support maintained

## Quick Start

### Using Prisma (Default)

```typescript
import { DB } from '$/@frouvel/kaname/database';

// Direct Prisma access - zero overhead!
const prisma = DB.prisma();

// Use Prisma's full API
const users = await prisma.user.findMany({
  where: { age: { gte: 18 } },
  include: { posts: true },
  orderBy: { createdAt: 'desc' },
});

// Transactions
await DB.transaction(async (tx) => {
  const user = await tx.user.create({
    data: { name: 'John Doe', email: 'john@example.com' },
  });
  
  await tx.profile.create({
    data: { userId: user.id, bio: 'Hello!' },
  });
});
```

### Using Drizzle

```typescript
import { DB } from '$/@frouvel/kaname/database';
import { users, posts } from '$/schema';
import { eq } from 'drizzle-orm';

// Direct Drizzle access - zero overhead!
const db = DB.drizzle();

// Use Drizzle's full API
const result = await db
  .select()
  .from(users)
  .where(eq(users.age, 18))
  .leftJoin(posts, eq(users.id, posts.userId));

// Transactions
await DB.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({
    name: 'John Doe',
    email: 'john@example.com'
  }).returning();
  
  await tx.insert(profiles).values({
    userId: user.id,
    bio: 'Hello!',
  });
});
```

### Using Redis

```typescript
import { DB } from '$/@frouvel/kaname/database';

// Direct Redis access - zero overhead!
const redis = await DB.redis();

// Use Redis full API
await redis.set('user:1', JSON.stringify({ name: 'John', age: 30 }));
const user = await redis.get('user:1');

// Set with expiration
await redis.set('session:abc', 'token', { EX: 3600 }); // Expires in 1 hour

// Hash operations
await redis.hSet('user:1:profile', {
  name: 'John Doe',
  email: 'john@example.com',
  age: '30',
});
const profile = await redis.hGetAll('user:1:profile');

// List operations
await redis.rPush('user:1:notifications', ['New message', 'New follower']);
const notifications = await redis.lRange('user:1:notifications', 0, -1);

// Transactions (MULTI/EXEC)
await DB.transaction(async (multi) => {
  multi.set('counter:1', '10');
  multi.incr('counter:1');
  multi.get('counter:1');
  return await multi.exec();
});
```

### Using Cache Facade (Laravel-style) 🆕

For Laravel developers or those preferring a simpler caching API:

```typescript
import { Cache } from '$/@frouvel/kaname/database';

// Basic operations
await Cache.put('user:1', userData, 3600); // Store with TTL (seconds)
const user = await Cache.get('user:1'); // Retrieve
await Cache.forget('user:1'); // Delete

// Remember pattern (get or compute and cache)
const user = await Cache.remember('user:1', 3600, async () => {
  return await db.user.findUnique({ where: { id: 1 } });
});

// Atomic operations
await Cache.increment('page_views');
await Cache.decrement('stock_count', 5);

// Bulk operations
await Cache.putMany({
  'user:1': user1,
  'user:2': user2,
}, 3600);

const values = await Cache.many(['user:1', 'user:2']);

// Advanced operations
await Cache.forever('settings', config); // No expiration
const token = await Cache.pull('temp_token'); // Get and delete
```

**See [Cache Usage Guide](./CACHE_USAGE.md) for complete API reference.**

## Configuration

### config/database.ts

```typescript
import type { DatabaseConfig } from '$/@frouvel/kaname/database';
import { env } from '$/env';

export default {
  // Default connection
  default: 'primary',

  // Connection configurations
  connections: {
    // Prisma connection
    primary: {
      driver: 'prisma',
      url: env('DATABASE_URL'),
      pool: {
        min: env('DB_POOL_MIN', 2),
        max: env('DB_POOL_MAX', 10),
      },
    },

    // Drizzle connection (optional)
    analytics: {
      driver: 'drizzle',
      connection: {
        host: env('ANALYTICS_DB_HOST', 'localhost'),
        port: env('ANALYTICS_DB_PORT', 5432),
        user: env('ANALYTICS_DB_USER'),
        password: env('ANALYTICS_DB_PASSWORD'),
        database: env('ANALYTICS_DB_DATABASE'),
      },
    },

    // Redis connection (optional)
    cache: {
      driver: 'redis',
      connection: {
        host: env('REDIS_HOST', 'localhost'),
        port: env('REDIS_PORT', 6379),
        password: env('REDIS_PASSWORD'),
        database: env('REDIS_DB', 0),
      },
    },

    // Read replica (optional)
    'read-replica': {
      driver: 'prisma',
      url: env('READ_REPLICA_URL'),
    },
  },
} satisfies DatabaseConfig;
```

### Adding a custom driver

You can plug in another ORM/driver by implementing `DatabaseDriver` and registering it before use:

```typescript
import { DB, type DatabaseDriver } from '$/@frouvel/kaname/database';

const myDriver: DatabaseDriver = {
  createClient: (config) => /* return client from config */ {},
  transaction: (client, cb) => client.transaction(cb),
  disconnect: (client) => client.disconnect?.(),
};

DB.getManager().registerDriver('my-driver', myDriver);
```

## API Reference

### DB.prisma()

Get direct access to Prisma client (zero overhead).

```typescript
const prisma = DB.prisma(); // Default connection
const replica = DB.prisma('read-replica'); // Specific connection

// Use Prisma's full API
const users = await prisma.user.findMany({
  where: { status: 'active' },
  include: { posts: { take: 5 } },
});
```

### DB.drizzle()

Get direct access to Drizzle client (zero overhead).

```typescript
const db = DB.drizzle(); // Default connection
const analytics = DB.drizzle('analytics'); // Specific connection

// Use Drizzle's full API
const users = await db.select().from(usersTable);
```

### DB.redis()

Get direct access to Redis client (zero overhead).

```typescript
const redis = await DB.redis(); // Default connection
const cache = await DB.redis('cache'); // Specific connection

// Use Redis full API
await redis.set('key', 'value');
await redis.get('key');
await redis.del('key');

// Hash operations
await redis.hSet('hash', 'field', 'value');
await redis.hGet('hash', 'field');

// List operations
await redis.lPush('list', 'item');
await redis.lRange('list', 0, -1);

// Set operations
await redis.sAdd('set', 'member');
await redis.sMembers('set');

// Sorted set operations
await redis.zAdd('zset', { score: 1, value: 'member' });
await redis.zRange('zset', 0, -1);
```

### DB.transaction()

Execute operations within a transaction.

```typescript
// Prisma transaction
await DB.transaction(async (prisma) => {
  await prisma.user.create({ data: { name: 'John' } });
  await prisma.profile.create({ data: { userId: 1 } });
});

// Drizzle transaction
await DB.transaction(async (tx) => {
  await tx.insert(users).values({ name: 'John' });
  await tx.insert(profiles).values({ userId: 1 });
});

// Redis transaction (MULTI/EXEC)
await DB.transaction(async (multi) => {
  multi.set('key1', 'value1');
  multi.set('key2', 'value2');
  multi.get('key1');
  return await multi.exec();
});

// Specific connection
await DB.transaction(async (tx) => {
  // ... operations
}, 'read-replica');
```

### DB.client()

Get the underlying client (ORM-agnostic).

```typescript
const client = DB.client(); // Returns Prisma or Drizzle based on config
```

### Multiple Connections

```typescript
// Switch default connection
DB.setDefaultConnection('read-replica');
const users = DB.prisma().user.findMany(); // Uses read replica

// Or specify connection directly
const primary = DB.prisma('primary');
const replica = DB.prisma('read-replica');
const analytics = DB.drizzle('analytics');
```

## Usage Patterns

### Pattern 1: Direct Usage (Simplest)

```typescript
import { DB } from '$/@frouvel/kaname/database';

export class UserService {
  async getActiveUsers() {
    const prisma = DB.prisma();
    return prisma.user.findMany({
      where: { status: 'active' },
    });
  }
}
```

### Pattern 2: Repository Pattern (Recommended)

```typescript
import { DB } from '$/@frouvel/kaname/database';

export class UserRepository {
  private prisma = DB.prisma();

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { posts: true },
    });
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  async paginate(page: number, limit: number) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prisma.user.count(),
    ]);

    return { users, total };
  }
}
```

### Pattern 3: Multiple ORMs

```typescript
import { DB } from '$/@frouvel/kaname/database';
import { analyticsEvents } from '$/schema';

export class AnalyticsService {
  private prisma = DB.prisma('primary');
  private analytics = DB.drizzle('analytics');

  async trackUserAction(userId: string, action: string) {
    // Store in Drizzle analytics DB
    await this.analytics.insert(analyticsEvents).values({
      userId,
      action,
      timestamp: new Date(),
    });

    // Update user stats in Prisma
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });
  }
}
```

### Pattern 4: Caching with Redis

```typescript
import { DB } from '$/@frouvel/kaname/database';

export class UserService {
  private prisma = DB.prisma('primary');
  private redis = await DB.redis('cache');

  async getUserById(id: string) {
    // Try cache first
    const cached = await this.redis.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      // Cache for 5 minutes
      await this.redis.set(
        `user:${id}`,
        JSON.stringify(user),
        { EX: 300 }
      );
    }

    return user;
  }

  async invalidateUserCache(id: string) {
    await this.redis.del(`user:${id}`);
  }
}
```

## Testing Support

The `TestCaseDatabase` works seamlessly with the DB facade:

```typescript
import { TestCaseDatabase, DB } from '$/@frouvel/kaname/testing';
import { expect } from 'vitest';

class UserRepositoryTest extends TestCaseDatabase {
  private repository: UserRepository;

  protected async setUp() {
    await super.setUp();
    this.repository = new UserRepository();
  }

  run() {
    this.suite('UserRepository', () => {
      this.test('can create user', async () => {
        const user = await this.repository.create({
          name: 'John Doe',
          email: 'john@example.com',
        });

        expect(user).toBeDefined();
        expect(user.name).toBe('John Doe');

        // Can also use DB facade directly in tests
        const found = await DB.prisma().user.findUnique({
          where: { id: user.id },
        });
        expect(found).toBeDefined();
      });
    });
  }
}

new UserRepositoryTest().run();
```

## Migration from Direct Prisma

### Before

```typescript
import { getPrismaClient } from '$/@frouvel/kaname/database';

const prisma = getPrismaClient();
const users = await prisma.user.findMany();
```

### After

```typescript
import { DB } from '$/@frouvel/kaname/database';

const prisma = DB.prisma();
const users = await prisma.user.findMany();
```

**Note**: `getPrismaClient()` still works for backward compatibility but is deprecated.

## Performance

**Zero overhead!** The DB facade provides direct pass-through to the underlying ORM client:

```typescript
// These are equivalent in performance:
const prisma = getPrismaClient();
const users1 = await prisma.user.findMany();

const users2 = await DB.prisma().user.findMany();
// Same speed - DB.prisma() just returns the client directly!
```

## Redis Operations Guide

### String Operations

```typescript
const redis = await DB.redis();

// Set and get
await redis.set('key', 'value');
const value = await redis.get('key');

// Set with expiration (EX in seconds)
await redis.set('session:123', 'token', { EX: 3600 });

// Multiple keys
await redis.mSet({ key1: 'value1', key2: 'value2' });
const values = await redis.mGet(['key1', 'key2']);

// Increment/Decrement
await redis.incr('counter');
await redis.incrBy('counter', 5);
await redis.decr('counter');
```

### Hash Operations

```typescript
// Set hash fields
await redis.hSet('user:1', {
  name: 'John',
  email: 'john@example.com',
  age: '30',
});

// Get single field
const name = await redis.hGet('user:1', 'name');

// Get all fields
const user = await redis.hGetAll('user:1');

// Check field exists
const exists = await redis.hExists('user:1', 'name');

// Delete field
await redis.hDel('user:1', 'age');
```

### List Operations

```typescript
// Push to list
await redis.rPush('notifications', 'New message');
await redis.lPush('notifications', 'Urgent!'); // Push to front

// Get range
const items = await redis.lRange('notifications', 0, -1); // All items
const first = await redis.lRange('notifications', 0, 0); // First item

// Pop from list
const item = await redis.rPop('notifications');
const firstItem = await redis.lPop('notifications');

// List length
const length = await redis.lLen('notifications');
```

### Set Operations

```typescript
// Add members
await redis.sAdd('tags', ['nodejs', 'typescript', 'redis']);

// Check membership
const isMember = await redis.sIsMember('tags', 'nodejs');

// Get all members
const members = await redis.sMembers('tags');

// Remove member
await redis.sRem('tags', 'redis');

// Set operations
await redis.sUnion(['set1', 'set2']);
await redis.sInter(['set1', 'set2']);
await redis.sDiff(['set1', 'set2']);
```

### Sorted Set Operations

```typescript
// Add members with scores
await redis.zAdd('leaderboard', [
  { score: 100, value: 'player1' },
  { score: 95, value: 'player2' },
  { score: 90, value: 'player3' },
]);

// Get range by rank
const top3 = await redis.zRange('leaderboard', 0, 2, { REV: true });

// Get score
const score = await redis.zScore('leaderboard', 'player1');

// Increment score
await redis.zIncrBy('leaderboard', 10, 'player2');

// Get rank
const rank = await redis.zRevRank('leaderboard', 'player1');
```

### Key Management

```typescript
// Check if key exists
const exists = await redis.exists('key');

// Set expiration
await redis.expire('key', 3600); // Seconds
await redis.expireAt('key', Math.floor(Date.now() / 1000) + 3600);

// Get TTL
const ttl = await redis.ttl('key'); // -1 if no expiration, -2 if not exists

// Delete keys
await redis.del('key');
await redis.del(['key1', 'key2', 'key3']);

// Pattern matching (use sparingly in production)
const keys = await redis.keys('user:*');

// Rename key
await redis.rename('oldKey', 'newKey');
```

### Pub/Sub

```typescript
const redis = await DB.redis();

// Subscribe to channel
const subscriber = redis.duplicate();
await subscriber.connect();

await subscriber.subscribe('notifications', (message) => {
  console.log('Received:', message);
});

// Publish message
await redis.publish('notifications', 'Hello, World!');

// Unsubscribe
await subscriber.unsubscribe('notifications');
```

## Why Not a Query Builder?

Query builders add abstraction and learning curves. Instead:

1. **Prisma** already has excellent TypeScript support and query API
2. **Drizzle** is designed to be close to SQL with great DX
3. **Redis** is designed with a simple command API
4. **Zero Overhead**: Direct access means no performance penalty
5. **Full Features**: Access to all ORM/driver-specific features
6. **Type Safety**: Maintain full TypeScript types from your ORM/driver

## Advanced Usage

### Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  await DB.disconnectAll();
  process.exit(0);
});
```

### Health Checks

```typescript
export async function checkDatabaseHealth() {
  try {
    const prisma = DB.prisma();
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error };
  }
}
```

### Custom Connection Registration

```typescript
import { PrismaClient } from '@prisma/client';
import { DB } from '$/@frouvel/kaname/database';

// Create custom Prisma client with extensions
const prisma = new PrismaClient().$extends({
  // Your extensions here
});

// Register it
DB.register('custom', prisma, 'prisma');

// Use it
const users = await DB.prisma('custom').user.findMany();
```

## Best Practices

1. **Use DB Facade**: Import `DB` instead of `getPrismaClient()`
2. **Repository Pattern**: Encapsulate data access in repository classes
3. **Connection Names**: Use descriptive names (`primary`, `read-replica`, `analytics`)
4. **Transactions**: Always use `DB.transaction()` for multiple operations
5. **Testing**: Use `TestCaseDatabase` for integration tests
6. **Read Replicas**: Route read-heavy operations to read replicas

## Troubleshooting

### "Database manager not initialized"

Make sure `DatabaseServiceProvider` is registered in your `bootstrap/app.ts`:

```typescript
import { DatabaseServiceProvider } from '$/@frouvel/kaname/foundation';

const providers = [
  DatabaseServiceProvider,
  // ... other providers
];
```

### Type Errors with Prisma Client

Make sure you've generated Prisma client:

```bash
npm run generate:prisma
```

### Multiple Connections Not Working

Check your `config/database.ts` has all connections defined and the connection name matches.

### Redis Connection Issues

Make sure Redis is running:

```bash
# Using Docker Compose
docker-compose up redis

# Check if Redis is accessible
redis-cli ping
```

Update your `.env` file:

```env
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## See Also

- [Architecture Document](./ARCHITECTURE.md) - Detailed architectural design
- [Prisma Documentation](https://www.prisma.io/docs)
- [Drizzle Documentation](https://orm.drizzle.team/docs/overview)
- [Redis Documentation](https://redis.io/docs/)
- [node-redis Documentation](https://github.com/redis/node-redis)
