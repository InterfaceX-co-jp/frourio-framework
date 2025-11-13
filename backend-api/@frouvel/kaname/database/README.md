# Database Module

Enhanced Prisma Client management with connection pooling, retry logic, and graceful shutdown handling.

## Overview

The `@frouvel/kaname/database` module provides a production-ready Prisma Client wrapper with:

- **Connection Pool Management**: Configurable connection pooling via environment variables
- **Automatic Retry Logic**: Exponential backoff for failed operations
- **Graceful Shutdown**: Proper connection cleanup on application exit
- **Health Checks**: Database connection health monitoring
- **Pagination Extension**: Automatic integration with `@frouvel/kaname/paginator`

## Quick Start

```typescript
import { getPrismaClient } from '$/@frouvel/kaname/database';

const prisma = getPrismaClient();

// Use Prisma client as normal
const users = await prisma.user.findMany();
```

## Configuration

### Environment Variables

Configure database connection pooling via environment variables:

```bash
# Maximum number of connections in the pool (default: 10)
DATABASE_CONNECTION_POOL_SIZE=10

# Connection timeout in seconds (default: 30)
DATABASE_CONNECTION_TIMEOUT=30

# Pool timeout in seconds (default: 2)
DATABASE_POOL_TIMEOUT=2
```

### Connection String Enhancement

The module automatically enhances your `DATABASE_URL` with pool parameters if not already present.

**Before:**
```
postgresql://user:pass@localhost:5432/mydb
```

**After:**
```
postgresql://user:pass@localhost:5432/mydb?connection_limit=10&pool_timeout=2&connect_timeout=30
```

## Core Functions

### `getPrismaClient()`

Get the singleton Prisma client instance.

```typescript
import { getPrismaClient } from '$/@frouvel/kaname/database';

const prisma = getPrismaClient();
```

**Features:**
- Returns the same instance on subsequent calls (singleton pattern)
- Auto-connects on first use
- Registers graceful shutdown handlers
- Applies pagination extension automatically

### `disconnectPrismaClient()`

Manually disconnect the Prisma client (useful for testing).

```typescript
import { disconnectPrismaClient } from '$/@frouvel/kaname/database';

await disconnectPrismaClient();
```

### `withRetry()`

Execute database operations with automatic retry logic.

```typescript
import { withRetry } from '$/@frouvel/kaname/database';

const result = await withRetry(
  async () => {
    return await prisma.user.findMany();
  },
  3,    // maxRetries (default: 3)
  1000  // initialDelay in ms (default: 1000)
);
```

**Retry Strategy:**
- Exponential backoff: delay × 2^(attempt-1)
- Attempt 1: 1000ms delay
- Attempt 2: 2000ms delay
- Attempt 3: 4000ms delay

### `checkDatabaseConnection()`

Check database connection health.

```typescript
import { checkDatabaseConnection } from '$/@frouvel/kaname/database';

const isHealthy = await checkDatabaseConnection();

if (!isHealthy) {
  console.error('Database connection failed');
}
```

**Features:**
- Uses `withRetry()` internally (2 retries, 500ms delay)
- Returns `true` if connection is healthy
- Returns `false` if all retries fail

### `resetPrismaConnection()`

Reset the Prisma connection (useful when connection is stale).

```typescript
import { resetPrismaConnection } from '$/@frouvel/kaname/database';

await resetPrismaConnection();

// Next call to getPrismaClient() will create a new connection
const prisma = getPrismaClient();
```

## Usage in Repositories

### Basic Usage

```typescript
import { getPrismaClient } from '$/@frouvel/kaname/database';
import { UserModel } from '$/prisma/__generated__/models/User.model';

export class UserRepository {
  constructor(private readonly _prisma: PrismaClient) {}

  async findById(args: { id: number }): Promise<UserModel | null> {
    const data = await this._prisma.user.findUnique({
      where: { id: args.id },
    });

    if (!data) return null;

    return UserModel.fromPrismaValue({ self: data });
  }
}
```

### In Use Cases

```typescript
import { getPrismaClient } from '$/@frouvel/kaname/database';
import { UserRepository } from '../repository/User.repository';

export class FindUserUseCase {
  private readonly _userRepository: IUserRepository;

  private constructor(args: { userRepository: IUserRepository }) {
    this._userRepository = args.userRepository;
  }

  static create() {
    return new FindUserUseCase({
      userRepository: new UserRepository(getPrismaClient()),
    });
  }

  async handleById(args: { id: number }) {
    const user = await this._userRepository.findById({ id: args.id });
    
    if (!user) {
      throw NotFoundError.create(`User with ID ${args.id} not found`, {
        userId: args.id,
      });
    }

    return user.toDto();
  }
}
```

## Service Provider Integration

The database module is automatically registered via [`DatabaseServiceProvider`](../foundation/providers/DatabaseServiceProvider.ts):

```typescript
// backend-api/bootstrap/app.ts
import {
  DatabaseServiceProvider,
  ConsoleServiceProvider,
} from '$/@frouvel/kaname/foundation';

const providers = [
  DatabaseServiceProvider,  // Registers 'prisma' singleton
  ConsoleServiceProvider,
  // ... other providers
];
```

**What it does:**
1. Registers Prisma client as singleton in the application container
2. Connects to database on boot
3. Implements graceful disconnection on shutdown

## Pagination Extension

The Prisma client is automatically extended with pagination capabilities:

```typescript
const prisma = getPrismaClient();

// Use pagination extension methods
const result = await prisma.user.paginate({
  limit: 10,
  page: 1,
});
```

See [`@frouvel/kaname/paginator/README.md`](../paginator/README.md) for details on pagination features.

## Graceful Shutdown

Shutdown handlers are automatically registered to ensure proper cleanup:

```typescript
// Listens for these signals:
- SIGINT  (Ctrl+C)
- SIGTERM (container shutdown)
- beforeExit (Node.js process exit)
```

**Shutdown Process:**
1. Log disconnect message
2. Call `prisma.$disconnect()`
3. Set prisma instance to null
4. Log completion

## Best Practices

### 1. Use Singleton Pattern

Always use `getPrismaClient()` instead of creating new instances:

```typescript
// ✅ Good
import { getPrismaClient } from '$/@frouvel/kaname/database';
const prisma = getPrismaClient();

// ❌ Bad
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

### 2. Use Retry Logic for Critical Operations

```typescript
import { withRetry, getPrismaClient } from '$/@frouvel/kaname/database';

const prisma = getPrismaClient();

// Wrap critical operations
const result = await withRetry(async () => {
  return await prisma.user.create({
    data: { /* ... */ },
  });
});
```

### 3. Health Checks in Production

```typescript
import { checkDatabaseConnection } from '$/@frouvel/kaname/database';

// Add to your health check endpoint
export default defineController(() => ({
  get: async () => {
    const dbHealthy = await checkDatabaseConnection();
    
    return ApiResponse.success({
      database: dbHealthy ? 'healthy' : 'unhealthy',
    });
  },
}));
```

### 4. Access via Container

In service providers or when you need dependency injection:

```typescript
import type { Application } from '$/@frouvel/kaname/foundation';
import type { PrismaClient } from '@prisma/client';

const prisma = app.make<PrismaClient>('prisma');
```

## Testing

### Reset Connection Between Tests

```typescript
import { resetPrismaConnection } from '$/@frouvel/kaname/database';

afterEach(async () => {
  await resetPrismaConnection();
});
```

### Mock Prisma Client

```typescript
import { vi } from 'vitest';

vi.mock('$/@frouvel/kaname/database', () => ({
  getPrismaClient: () => mockPrismaClient,
}));
```

## Architecture

```
@frouvel/kaname/database/
├── index.ts                    # Main exports
├── PrismaClientManager.ts      # Core implementation
└── README.md                   # This file
```

**Features in `PrismaClientManager.ts`:**

1. **Connection Pool Configuration** (`createPrismaClient`)
   - Reads environment variables
   - Enhances DATABASE_URL with pool parameters
   - Configures logging based on environment

2. **Singleton Management** (`getPrismaClient`)
   - Creates instance on first call
   - Returns same instance on subsequent calls
   - Auto-connects and registers shutdown handlers

3. **Retry Logic** (`withRetry`)
   - Exponential backoff algorithm
   - Configurable max retries and delay
   - Detailed error logging

4. **Health Checks** (`checkDatabaseConnection`)
   - Simple SELECT 1 query
   - Uses retry logic internally
   - Returns boolean status

5. **Connection Management** (`resetPrismaConnection`, `disconnectPrismaClient`)
   - Clean disconnection
   - Instance reset
   - Preparation for reconnection

## Environment-Specific Configuration

### Development

```typescript
// Logging enabled: query, info, warn, error
// Connection pool: 10 connections (or env override)
```

### Production

```typescript
// Logging: warn, error only
// Connection pool: configured via env (recommended: 10-20)
// Always cache configuration: npm run artisan config:cache
```

### Testing

```typescript
// Use separate test database
// Reset connections between tests
// Mock Prisma client where appropriate
```

## Troubleshooting

### Connection Pool Exhausted

**Symptoms:** `PrismaPool` errors, timeout errors

**Solution:**
```bash
# Increase pool size
DATABASE_CONNECTION_POOL_SIZE=20
```

### Slow Queries

**Symptoms:** Timeouts, slow response times

**Solution:**
```bash
# Increase connection timeout
DATABASE_CONNECTION_TIMEOUT=60
```

### Connection Leaks

**Symptoms:** Connections not released, memory growth

**Solution:**
```typescript
// Ensure all queries complete
// Check for unhandled promise rejections
// Use withRetry for flaky operations
```

### Stale Connections

**Symptoms:** "Connection reset" errors

**Solution:**
```typescript
import { resetPrismaConnection } from '$/@frouvel/kaname/database';

await resetPrismaConnection();
```

## Migration from Old Pattern

**Before:**
```typescript
import { getPrismaClient } from '$/service/getPrismaClient';
```

**After:**
```typescript
import { getPrismaClient } from '$/@frouvel/kaname/database';
```

All other usage remains the same!

## See Also

- [`@frouvel/kaname/paginator`](../paginator/README.md) - Pagination extension
- [`DatabaseServiceProvider`](../foundation/providers/DatabaseServiceProvider.ts) - Service provider
- [Prisma Documentation](https://www.prisma.io/docs) - Official Prisma docs