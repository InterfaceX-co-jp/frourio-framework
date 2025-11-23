# Cache Facade Usage Guide

The Cache facade provides a Laravel-style interface for Redis caching operations in the frourio-framework.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Basic Operations](#basic-operations)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Overview

The Cache facade offers a clean, intuitive API for:

- Storing and retrieving data with optional expiration
- Remember patterns (get or compute and cache)
- Atomic operations (increment/decrement)
- Bulk operations
- Pattern-based key management

## Configuration

### 1. Configure Redis Connection

In your `config/database.ts`:

```typescript
import { defineConfig } from '$/@frouvel/kaname/config';

export default defineConfig('database', {
  default: 'primary',
  connections: {
    primary: {
      driver: 'prisma',
      // ... prisma config
    },
    cache: {
      driver: 'redis',
      url: process.env.REDIS_URL,
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        database: 0,
      },
    },
  },
});
```

### 2. Initialize in Application Bootstrap

In your `bootstrap/app.ts`:

```typescript
import { Application, DatabaseServiceProvider } from '$/@frouvel/kaname/foundation';
import { Cache } from '$/@frouvel/kaname/database';
import config from '$/config/database';

const app = Application.getInstance();

// Register and boot providers
app.register(new DatabaseServiceProvider());
await app.boot();

// Initialize Cache facade (optional, uses default redis config)
Cache.init();
```

### Key prefix & default TTL

`config/redis.ts` exposes `keyPrefix` and `defaultTTL`. The Cache facade reads these automatically:

- `REDIS_KEY_PREFIX` lets you namespace cache keys across apps/stores.
- `REDIS_DEFAULT_TTL` applies when you call `Cache.put`/`Cache.putMany` without an explicit TTL.
```

## Basic Operations

### Storing Data

```typescript
import { Cache } from '$/@frouvel/kaname/database';

// Store with expiration (in seconds)
await Cache.put('user:1', userData, 3600); // Expires in 1 hour

// Store without expiration
await Cache.put('settings', settingsData);

// Store forever (explicit)
await Cache.forever('app_version', '1.0.0');
```

### Retrieving Data

```typescript
// Get value or null
const user = await Cache.get('user:1');

// Get with default value
const user = await Cache.get('user:1', defaultUser);

// Get with type safety
const user = await Cache.get<User>('user:1');
```

### Deleting Data

```typescript
// Remove single item
await Cache.forget('user:1');

// Remove multiple items
await Cache.forgetMany(['user:1', 'user:2', 'user:3']);

// Clear all cache
await Cache.flush();
```

### Checking Existence

```typescript
if (await Cache.has('user:1')) {
  console.log('User exists in cache');
}
```

## Advanced Features

### Remember Pattern

Cache the result of an expensive operation:

```typescript
// Get from cache or compute and store
const user = await Cache.remember('user:1', 3600, async () => {
  return await db.user.findUnique({ where: { id: 1 } });
});

// Remember forever
const settings = await Cache.rememberForever('app_settings', async () => {
  return await loadSettingsFromConfig();
});
```

### Pull Pattern

Retrieve and delete in one operation:

```typescript
// Get value and remove from cache
const token = await Cache.pull('temp_token');
// token is now null in cache
```

### Atomic Operations

```typescript
// Increment
await Cache.increment('page_views');
await Cache.increment('counter', 5);

// Decrement
await Cache.decrement('stock_count');
await Cache.decrement('remaining', 10);
```

### Bulk Operations

```typescript
// Get multiple values
const values = await Cache.many(['user:1', 'user:2', 'user:3']);
// Returns: { 'user:1': data1, 'user:2': data2, 'user:3': data3 }

// Store multiple values
await Cache.putMany({
  'user:1': user1,
  'user:2': user2,
  'user:3': user3,
}, 3600);
```

### Pattern-Based Keys

```typescript
// Get all keys matching a pattern
const userKeys = await Cache.keys('user:*');

// Get all session keys
const sessionKeys = await Cache.keys('session:*');
```

### TTL Management

```typescript
// Get remaining time to live
const ttl = await Cache.ttl('user:1');
if (ttl > 0) {
  console.log(`Expires in ${ttl} seconds`);
}

// Set expiration on existing key
await Cache.expire('user:1', 3600);
```

## Best Practices

### 1. Consistent Naming Conventions

```typescript
// Good: Use namespace prefixes
await Cache.put('user:1', user);
await Cache.put('session:abc123', session);
await Cache.put('cache:stats:views', views);

// Avoid: Generic names
await Cache.put('data', user); // ❌
```

### 2. Use Type Safety

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Type-safe cache operations
const user = await Cache.get<User>('user:1');
await Cache.put('user:1', user, 3600);
```

### 3. Handle Cache Misses Gracefully

```typescript
const user = await Cache.get<User>('user:1');

if (!user) {
  // Fetch from database
  const dbUser = await db.user.findUnique({ where: { id: 1 } });
  if (dbUser) {
    await Cache.put('user:1', dbUser, 3600);
  }
  return dbUser;
}

return user;
```

### 4. Use Remember Pattern for Expensive Operations

```typescript
// Cache database queries
const stats = await Cache.remember('dashboard:stats', 300, async () => {
  return await calculateDashboardStats();
});

// Cache API responses
const weather = await Cache.remember('weather:tokyo', 1800, async () => {
  return await fetchWeatherApi('tokyo');
});
```

### 5. Set Appropriate TTL Values

```typescript
// Short TTL for frequently changing data
await Cache.put('stock:price:AAPL', price, 60); // 1 minute

// Medium TTL for semi-static data
await Cache.put('user:profile:1', profile, 3600); // 1 hour

// Long TTL for rarely changing data
await Cache.put('app:config', config, 86400); // 24 hours

// No expiration for static data
await Cache.forever('terms:version', '1.0');
```

### 6. Cache Invalidation

```typescript
// Invalidate related caches
async function updateUser(id: number, data: UpdateUserDto) {
  const user = await db.user.update({
    where: { id },
    data,
  });
  
  // Clear cached user data
  await Cache.forget(`user:${id}`);
  await Cache.forget(`user:profile:${id}`);
  
  return user;
}
```

### 7. Use Multiple Connections for Different Purposes

```typescript
// Cache facade with different connections
await Cache.put('session:abc', session, 3600, 'sessions');
await Cache.put('user:1', user, 3600, 'cache');
```

## API Reference

### Storage Methods

| Method | Description |
|--------|-------------|
| `put(key, value, ttl?)` | Store a value with optional expiration |
| `forever(key, value)` | Store a value without expiration |
| `putMany(values, ttl?)` | Store multiple values |

### Retrieval Methods

| Method | Description |
|--------|-------------|
| `get(key, default?)` | Retrieve a value |
| `many(keys)` | Retrieve multiple values |
| `pull(key, default?)` | Retrieve and delete |

### Cache-or-Compute Methods

| Method | Description |
|--------|-------------|
| `remember(key, ttl, callback)` | Get or compute and cache |
| `rememberForever(key, callback)` | Get or compute and cache forever |

### Deletion Methods

| Method | Description |
|--------|-------------|
| `forget(key)` | Remove a key |
| `forgetMany(keys)` | Remove multiple keys |
| `flush()` | Clear all cache |

### Utility Methods

| Method | Description |
|--------|-------------|
| `has(key)` | Check if key exists |
| `increment(key, value?)` | Increment a value |
| `decrement(key, value?)` | Decrement a value |
| `ttl(key)` | Get time to live |
| `expire(key, seconds)` | Set expiration |
| `keys(pattern)` | Get keys matching pattern |

### Advanced Methods

| Method | Description |
|--------|-------------|
| `getRedisClient()` | Get underlying Redis client |
| `setDefaultConnection(name)` | Set default connection |
| `getDefaultConnection()` | Get default connection name |

## Examples

### User Session Caching

```typescript
class SessionService {
  async getSession(sessionId: string) {
    return Cache.remember(`session:${sessionId}`, 3600, async () => {
      return await db.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
      });
    });
  }
  
  async invalidateSession(sessionId: string) {
    await Cache.forget(`session:${sessionId}`);
  }
}
```

### Rate Limiting

```typescript
class RateLimiter {
  async checkLimit(userId: number, limit: number = 100): Promise<boolean> {
    const key = `ratelimit:${userId}`;
    const current = await Cache.get<number>(key, 0);
    
    if (current >= limit) {
      return false;
    }
    
    await Cache.increment(key);
    await Cache.expire(key, 3600); // 1 hour window
    
    return true;
  }
}
```

### API Response Caching

```typescript
class WeatherService {
  async getWeather(city: string) {
    return Cache.remember(`weather:${city}`, 1800, async () => {
      const response = await fetch(`https://api.weather.com/${city}`);
      return await response.json();
    });
  }
}
```

### View Counter

```typescript
class PageViewCounter {
  async trackView(pageId: string) {
    await Cache.increment(`views:${pageId}`);
  }
  
  async getViews(pageId: string): Promise<number> {
    return await Cache.get<number>(`views:${pageId}`, 0);
  }
}
```

## Testing

```typescript
import { Cache } from '$/@frouvel/kaname/database';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Cache Operations', () => {
  beforeEach(async () => {
    await Cache.flush(); // Clear cache before each test
  });

  it('should store and retrieve data', async () => {
    await Cache.put('test:key', 'test value');
    const value = await Cache.get('test:key');
    expect(value).toBe('test value');
  });

  it('should respect TTL', async () => {
    await Cache.put('test:ttl', 'value', 1); // 1 second
    expect(await Cache.has('test:ttl')).toBe(true);
    
    await new Promise(resolve => setTimeout(resolve, 1100));
    expect(await Cache.has('test:ttl')).toBe(false);
  });

  it('should handle remember pattern', async () => {
    let callCount = 0;
    
    const getValue = async () => {
      callCount++;
      return 'computed value';
    };
    
    const val1 = await Cache.remember('test:remember', 60, getValue);
    const val2 = await Cache.remember('test:remember', 60, getValue);
    
    expect(val1).toBe('computed value');
    expect(val2).toBe('computed value');
    expect(callCount).toBe(1); // Only computed once
  });
});
```

## Migration from Direct Redis Usage

If you're currently using Redis directly:

```typescript
// Before: Direct Redis usage
const redis = await getRedisClient();
await redis.set('user:1', JSON.stringify(user));
await redis.expire('user:1', 3600);
const raw = await redis.get('user:1');
const user = raw ? JSON.parse(raw) : null;

// After: Using Cache facade
await Cache.put('user:1', user, 3600);
const user = await Cache.get<User>('user:1');
```

## See Also

- [Redis Usage Guide](./REDIS_USAGE.md)
- [Database Architecture](./ARCHITECTURE.md)
- [Laravel Cache Documentation](https://laravel.com/docs/cache)
