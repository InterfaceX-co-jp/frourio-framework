# Paginator

Laravel-style pagination utilities for frourio-framework with unified facade interface.

## Quick Start with Paginator Facade

The `Paginator` facade provides a simple, unified interface for creating both types of paginators:

```typescript
import { Paginator } from '$/@frouvel/kaname/paginator';

// Length-aware pagination (offset-based)
const lengthAware = Paginator.lengthAware({
  data: users,
  total: 1000,
  perPage: 10,
  currentPage: 1,
});

// Cursor pagination (for large datasets)
const cursor = Paginator.cursor({
  data: users,
  perPage: 10,
  cursorColumn: 'id',
});
```

## Which Paginator to Use?

### Use LengthAwarePaginator (Offset-based) when:
- ✅ Dataset is small to medium (< 10,000 records)
- ✅ Users need to know total pages/items
- ✅ Users need to jump to specific pages
- ✅ Data doesn't change frequently
- ✅ Simple pagination UI with page numbers

### Use CursorPaginator when:
- ✅ Large datasets (10,000+ records)
- ✅ Real-time feeds (social media, activity logs)
- ✅ Data changes frequently
- ✅ Need consistent performance at any page
- ✅ Infinite scroll interfaces
- ✅ Timeline-based navigation

## LengthAwarePaginator

A comprehensive pagination class that provides rich metadata about paginated results, similar to Laravel's `LengthAwarePaginator`.

### Features

- **Complete Metadata**: Total items, pages, current position, and more
- **Navigation Helpers**: Check if there are more pages, if on first/last page
- **Range Information**: Get the item range (from-to) for the current page
- **Transformations**: Map over items while preserving pagination metadata
- **API Response Format**: Built-in conversion to standard API response structure
- **Type Safety**: Full TypeScript support with generics

### Basic Usage

```typescript
import { LengthAwarePaginator } from '$/@frouvel/kaname/paginator';
import { UserRepository } from '$/domain/user/repository/User.repository';
import { getPrismaClient } from '$/service/getPrismaClient';

// In your repository
export class UserRepository {
  async paginate(args: { limit: number; page: number }) {
    const skip = (args.page - 1) * args.limit;
    
    const [data, total] = await Promise.all([
      this._prisma.user.findMany({
        take: args.limit,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this._prisma.user.count(),
    ]);

    return LengthAwarePaginator.create({
      data: data.map(d => UserModel.fromPrismaValue({ self: d })),
      total,
      perPage: args.limit,
      currentPage: args.page,
    });
  }
}

// In your UseCase
export class PaginateUsersUseCase {
  async handle(args: { limit: number; page: number }) {
    const paginator = await this._userRepository.paginate(args);
    
    // Transform to DTOs
    const dtosPaginator = paginator.map(user => user.toDto());
    
    // Return API response format
    return dtosPaginator.toResponse();
  }
}

// In your controller
export default defineController(() => ({
  get: ({ query }) =>
    PaginateUsersUseCase.create()
      .handle({
        page: query.page,
        limit: query.limit,
      })
      .then(ApiResponse.success)
      .catch(ApiResponse.method.get),
}));
```

### API Response Structure

The `toResponse()` method returns a standard pagination response:

```typescript
{
  data: T[],        // Array of items
  meta: {
    total: number,        // Total items across all pages
    perPage: number,      // Items per page
    currentPage: number,  // Current page number (1-based)
    lastPage: number,     // Total number of pages
    from: number | null,  // First item number on page (1-based)
    to: number | null,    // Last item number on page (1-based)
  }
}
```

### Type Definitions for Frontend

Export the response type in your API endpoint:

```typescript
// backend-api/api/users/index.ts
import type { DefineMethods } from 'aspida';
import type { LengthAwarePaginatorResponse } from '$/@frouvel/kaname/paginator';
import type { UserModelDto, ProblemDetails } from 'commonTypesWithClient';

export type Methods = DefineMethods<{
  get: {
    query: {
      page: number;
      limit: number;
    };
    resBody: LengthAwarePaginatorResponse<UserModelDto> | ProblemDetails;
  };
}>;
```

### Available Methods

#### Metadata Getters

```typescript
const paginator = LengthAwarePaginator.create({ ... });

paginator.data;         // T[] - Array of items
paginator.total;        // number - Total items
paginator.perPage;      // number - Items per page
paginator.currentPage;  // number - Current page (1-based)
paginator.lastPage;     // number - Total pages
paginator.from;         // number | null - First item number on page
paginator.to;           // number | null - Last item number on page
```

#### Navigation Helpers

```typescript
paginator.hasMorePages();  // boolean - Are there more pages?
paginator.onFirstPage();   // boolean - Is this the first page?
paginator.onLastPage();    // boolean - Is this the last page?
paginator.count();         // number - Items on current page
paginator.isEmpty();       // boolean - No items on page?
paginator.isNotEmpty();    // boolean - Has items on page?
```

#### Transformations

```typescript
// Transform items to DTOs
const dtosPaginator = paginator.map(user => user.toDto());

// Transform with index
const indexedPaginator = paginator.map((item, index) => ({
  ...item,
  position: index + 1,
}));
```

#### Output Formats

```typescript
// API response format (recommended)
const response = paginator.toResponse();
// { data: [...], meta: { total, perPage, ... } }

// Get navigation links
const links = paginator.getLinks();
// { first: 1, last: 5, prev: 2, next: 4 }

// Full JSON representation
const json = paginator.toJSON();
// { data: [...], total, perPage, ..., links: { ... } }
```

### Advanced Examples

#### With Search/Filters

```typescript
export class UserRepository {
  async paginate(args: {
    limit: number;
    page: number;
    search?: { value: string };
  }) {
    const where = args.search
      ? {
          OR: [
            { name: { contains: args.search.value } },
            { email: { contains: args.search.value } },
          ],
        }
      : {};

    const skip = (args.page - 1) * args.limit;

    const [data, total] = await Promise.all([
      this._prisma.user.findMany({
        where,
        take: args.limit,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this._prisma.user.count({ where }),
    ]);

    return LengthAwarePaginator.create({
      data: data.map(d => UserModel.fromPrismaValue({ self: d })),
      total,
      perPage: args.limit,
      currentPage: args.page,
    });
  }
}
```

#### Conditional Logic Based on Pagination State

```typescript
const paginator = await repository.paginate({ page: 1, limit: 10 });

if (paginator.isEmpty()) {
  // Handle no results
  return ApiResponse.success({
    data: [],
    meta: paginator.toResponse().meta,
    message: 'No users found',
  });
}

if (paginator.onLastPage()) {
  // Maybe trigger some analytics or logging
  logger.info('User reached last page of results');
}

// Show pagination controls only if needed
const showPagination = paginator.lastPage > 1;
```

#### Frontend Integration

```typescript
// Frontend API call
const result = await apiClient.users.$get({
  query: { page: 1, limit: 10 }
});

if (isApiSuccess(result)) {
  console.log(`Showing ${result.meta.from}-${result.meta.to} of ${result.meta.total}`);
  console.log(`Page ${result.meta.currentPage} of ${result.meta.lastPage}`);
  
  // Render items
  result.data.forEach(user => renderUser(user));
  
  // Show pagination controls
  if (result.meta.lastPage > 1) {
    renderPagination(result.meta);
  }
}
```

### Migration from createPaginationMeta

If you're currently using `createPaginationMeta`, you can migrate to `LengthAwarePaginator`:

**Before:**

```typescript
const data = await this._prisma.user.findMany({ ... });
const totalCount = await this._prisma.user.count();

return {
  data: data.map(d => UserModel.fromPrismaValue({ self: d }).toDto()),
  meta: createPaginationMeta({
    totalCount,
    perPage: args.limit,
  }),
};
```

**After:**

```typescript

## CursorPaginator

A cursor-based pagination class optimized for large datasets and real-time feeds.

### Features

- **High Performance**: No OFFSET queries - consistent performance regardless of page depth
- **Real-time Safe**: Handles data changes gracefully without skipping or duplicating items
- **Infinite Scroll**: Perfect for timeline-based interfaces
- **Simple Integration**: Works seamlessly with Prisma cursor-based queries

### Basic Usage

```typescript
import { Paginator } from '$/@frouvel/kaname/paginator';
import { UserRepository } from '$/domain/user/repository/User.repository';

// In your repository
export class UserRepository {
  async paginateWithCursor(args: {
    limit: number;
    cursor?: string;
  }) {
    const decodedCursor = args.cursor
      ? parseInt(Paginator.decodeCursor(args.cursor))
      : undefined;

    // Fetch perPage + 1 items to detect if there's a next page
    const data = await this._prisma.user.findMany({
      take: args.limit + 1,
      ...(decodedCursor
        ? { cursor: { id: decodedCursor }, skip: 1 }
        : {}),
      orderBy: { id: 'desc' },
    });

    return Paginator.cursor({
      data: data.map(d => UserModel.fromPrismaValue({ self: d })),
      perPage: args.limit,
      cursorColumn: 'id',
      prevCursor: args.cursor,
    });
  }
}

// In your UseCase
export class PaginateUsersWithCursorUseCase {
  async handle(args: { limit: number; cursor?: string }) {
    const paginator = await this._userRepository.paginateWithCursor(args);
    
    // Transform to DTOs
    const dtosPaginator = paginator.map(user => user.toDto());
    
    // Return API response format
    return dtosPaginator.toResponse();
  }
}

// In your controller
export default defineController(() => ({
  get: ({ query }) =>
    PaginateUsersWithCursorUseCase.create()
      .handle({
        limit: query.limit,
        cursor: query.cursor,
      })
      .then(ApiResponse.success)
      .catch(ApiResponse.method.get),
}));
```

### API Response Structure

The `toResponse()` method returns:

```typescript
{
  data: T[],        // Array of items
  meta: {
    perPage: number,      // Items per page
    nextCursor: string | null,  // Cursor for next page
    prevCursor: string | null,  // Cursor for previous page
    path?: string,        // Base path (optional)
  }
}
```

### Type Definitions for Frontend

```typescript
// backend-api/api/users/cursor/index.ts
import type { DefineMethods } from 'aspida';
import type { CursorPaginatorResponse } from '$/@frouvel/kaname/paginator';
import type { UserModelDto, ProblemDetails } from 'commonTypesWithClient';

export type Methods = DefineMethods<{
  get: {
    query: {
      limit: number;
      cursor?: string;
    };
    resBody: CursorPaginatorResponse<UserModelDto> | ProblemDetails;
  };
}>;
```

### Available Methods

#### Metadata Getters

```typescript
const paginator = Paginator.cursor({ ... });

paginator.data;         // T[] - Array of items
paginator.perPage;      // number - Items per page
paginator.cursorColumn; // keyof T - Column used for cursor
paginator.nextCursor;   // string | null - Next page cursor
paginator.prevCursor;   // string | null - Previous page cursor
paginator.path;         // string | undefined - Base path
```

#### Navigation Helpers

```typescript
paginator.hasMorePages();  // boolean - Are there more pages?
paginator.count();         // number - Items on current page
paginator.isEmpty();       // boolean - No items on page?
paginator.isNotEmpty();    // boolean - Has items on page?
```

#### Cursor Handling

```typescript
// Decode cursor
const decodedId = Paginator.decodeCursor(cursor);

// Get pagination links
const links = paginator.getLinks();
// { first: '/api/users', prev: '/api/users?cursor=...', next: '/api/users?cursor=...' }
```

### Advanced Examples

#### With Date-based Cursor

```typescript
export class ActivityRepository {
  async paginateByDate(args: {
    limit: number;
    cursor?: string;
  }) {
    const decodedCursor = args.cursor
      ? new Date(Paginator.decodeCursor(args.cursor))
      : undefined;

    const data = await this._prisma.activity.findMany({
      take: args.limit + 1,
      ...(decodedCursor
        ? { cursor: { createdAt: decodedCursor }, skip: 1 }
        : {}),
      orderBy: { createdAt: 'desc' },
    });

    return Paginator.cursor({
      data: data.map(d => ActivityModel.fromPrismaValue({ self: d })),
      perPage: args.limit,
      cursorColumn: 'createdAt',
      prevCursor: args.cursor,
      path: '/api/activities',
    });
  }
}
```

#### With Filters

```typescript
export class PostRepository {
  async paginateByTag(args: {
    limit: number;
    cursor?: string;
    tag: string;
  }) {
    const decodedCursor = args.cursor
      ? parseInt(Paginator.decodeCursor(args.cursor))
      : undefined;

    const where = {
      tags: {
        some: { name: args.tag },
      },
    };

    const data = await this._prisma.post.findMany({
      where,
      take: args.limit + 1,
      ...(decodedCursor
        ? { cursor: { id: decodedCursor }, skip: 1 }
        : {}),
      orderBy: { createdAt: 'desc' },
    });

    return Paginator.cursor({
      data: data.map(d => PostModel.fromPrismaValue({ self: d })),
      perPage: args.limit,
      cursorColumn: 'id',
      prevCursor: args.cursor,
    });
  }
}
```

#### Frontend Integration (Infinite Scroll)

```typescript
// Frontend API call
const [posts, setPosts] = useState<PostDto[]>([]);
const [cursor, setCursor] = useState<string | null>(null);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const result = await apiClient.posts.$get({
    query: { limit: 20, ...(cursor ? { cursor } : {}) }
  });

  if (isApiSuccess(result)) {
    setPosts(prev => [...prev, ...result.data]);
    setCursor(result.meta.nextCursor);
    setHasMore(result.meta.nextCursor !== null);
  }
};

// Use with intersection observer or scroll event
useEffect(() => {
  if (inView && hasMore) {
    loadMore();
  }
}, [inView]);
```

### Performance Considerations

#### Why Cursor Pagination is Faster

**Offset-based (LengthAwarePaginator):**
```sql
-- Page 1000 with 10 items per page
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 10000;
-- Database must skip 10,000 rows every time!
```

**Cursor-based (CursorPaginator):**
```sql
-- Same page 1000
SELECT * FROM users WHERE id < $cursor ORDER BY id DESC LIMIT 10;
-- Direct index lookup - always fast!
```

#### Best Practices

1. **Always fetch perPage + 1 items** to detect next page existence
2. **Use indexed columns for cursors** (id, createdAt with index)
3. **Consistent ordering** - always use the same ORDER BY
4. **Don't use for user-facing page numbers** - cursors are opaque
5. **Cache cursor values** on client side for back navigation

### Comparison Table

| Feature | LengthAwarePaginator | CursorPaginator |
|---------|---------------------|-----------------|
| Performance at page 1 | ⚡ Fast | ⚡ Fast |
| Performance at page 1000 | 🐌 Slow | ⚡ Fast |
| Total count | ✅ Yes | ❌ No |
| Jump to page N | ✅ Yes | ❌ No |
| Handles data changes | ⚠️ May skip/duplicate | ✅ Gracefully |
| UI Pattern | Page numbers | Infinite scroll |
| Database queries | Less efficient | More efficient |

const [data, total] = await Promise.all([
  this._prisma.user.findMany({ ... }),
  this._prisma.user.count(),
]);

return LengthAwarePaginator.create({
  data: data.map(d => UserModel.fromPrismaValue({ self: d })),
  total,
  perPage: args.limit,
  currentPage: args.page,
})
  .map(model => model.toDto())
  .toResponse();
```

### Best Practices

1. **Always run count query in parallel** with data query using `Promise.all()`
2. **Transform to DTOs using `.map()`** rather than before creating the paginator
3. **Use `.toResponse()`** for consistent API response format
4. **Validate page and perPage** parameters in your UseCase or controller
5. **Export proper types** for frontend consumption via `commonTypesWithClient`

### See Also

- [RFC9457 Error Handling](../../../docs/RFC9457_ERROR_HANDLING.md)
- [Response Builder](../../../docs/RESPONSE_BUILDER.md)
# Paginator

Laravel-style pagination utilities for frourio-framework with unified facade interface and Prisma extension.

## Quick Start

### Option 1: Using Prisma Extension (Recommended)

```typescript
import { PrismaClient } from '@prisma/client';
import { pagination } from '$/@frouvel/kaname/paginator';

// Extend Prisma Client with pagination
const prisma = new PrismaClient().$extends(
  pagination({
    pages: {
      limit: 10,
      includePageCount: true,
    },
    cursor: {
      limit: 10,
    },
  })
);

// Use anywhere in your app
const users = await prisma.user.withPages({
  page: 1,
  limit: 20,
  where: { status: 'active' },
  orderBy: { createdAt: 'desc' },
});

// Transform and return
return users.map(u => UserModel.fromPrismaValue({ self: u }).toDto()).toResponse();
```

### Option 2: Using Paginator Facade

```typescript
import { Paginator } from '$/@frouvel/kaname/paginator';

// Length-aware pagination (offset-based)
const lengthAware = Paginator.lengthAware({
  data: users,
  total: 1000,
  perPage: 10,
  currentPage: 1,
});

// Cursor pagination (for large datasets)
const cursor = Paginator.cursor({
  data: users,
  perPage: 10,
  cursorColumn: 'id',
});
```

## Prisma Extension

### Basic Setup

```typescript
// backend-api/service/getPrismaClient.ts
import { PrismaClient } from '@prisma/client';
import { pagination } from '$/@frouvel/kaname/paginator';

let prisma: ReturnType<typeof createPrismaClient>;

function createPrismaClient() {
  return new PrismaClient().$extends(
    pagination({
      pages: {
        limit: 10,
        includePageCount: true,
      },
      cursor: {
        limit: 10,
      },
    })
  );
}

export const getPrismaClient = () => {
  if (!prisma) {
    prisma = createPrismaClient();
  }
  return prisma;
};
```

### Using in Repository

```typescript
import { getPrismaClient } from '$/service/getPrismaClient';
import { UserModel } from '$/prisma/__generated__/models/User.model';

export class UserRepository {
  private readonly _prisma = getPrismaClient();

  async paginate(args: {
    page: number;
    limit: number;
    search?: { value: string };
  }) {
    const where = args.search
      ? {
          OR: [
            { name: { contains: args.search.value } },
            { email: { contains: args.search.value } },
          ],
        }
      : {};

    // Use Prisma extension - returns LengthAwarePaginator
    const paginator = await this._prisma.user.withPages({
      page: args.page,
      limit: args.limit,
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Transform to models
    return paginator.map(user => UserModel.fromPrismaValue({ self: user }));
  }

  async paginateWithCursor(args: {
    limit: number;
    cursor?: string;
  }) {
    // Use Prisma extension - returns CursorPaginator
    const paginator = await this._prisma.user.withCursor({
      cursor: args.cursor,
      limit: args.limit,
      cursorColumn: 'id',
      orderBy: { id: 'desc' },
    });

    // Transform to models
    return paginator.map(user => UserModel.fromPrismaValue({ self: user }));
  }
}
```

### Configuration Options

#### Global Configuration

```typescript
import { pagination } from '$/@frouvel/kaname/paginator';

const prisma = new PrismaClient().$extends(
  pagination({
    pages: {
      limit: 25,              // Default items per page
      includePageCount: true, // Include total count by default
    },
    cursor: {
      limit: 50,              // Default items per page
      getCursor: (record) => record.id,  // Custom cursor extraction
      parseCursor: (cursor) => parseInt(cursor), // Custom cursor parsing
    },
  })
);
```

#### Per-Model Configuration

```typescript
import { createPaginator } from '$/@frouvel/kaname/paginator';

const userPaginator = createPaginator({
  pages: { limit: 20 },
  cursor: { limit: 30 },
});

const postPaginator = createPaginator({
  pages: { limit: 10 },
  cursor: { limit: 15 },
});

const prisma = new PrismaClient().$extends({
  model: {
    user: { paginate: userPaginator },
    post: { paginate: postPaginator },
  },
});
```

### Available Methods

#### `withPages()` - Offset-based Pagination

```typescript
const result = await prisma.user.withPages({
  page: 1,              // Page number (1-based)
  limit: 20,            // Items per page
  includePageCount: true, // Include total count (optional)
  
  // Standard Prisma query options
  where: { status: 'active' },
  orderBy: { createdAt: 'desc' },
  include: { posts: true },
  select: { id: true, name: true },
});

// Returns LengthAwarePaginator
console.log(result.total);       // Total items
console.log(result.currentPage); // Current page
console.log(result.lastPage);    // Total pages
```

#### `withCursor()` - Cursor-based Pagination

```typescript
const result = await prisma.user.withCursor({
  cursor: encodedCursor, // Cursor string (optional)
  limit: 20,             // Items per page
  cursorColumn: 'id',    // Column to use as cursor
  path: '/api/users',    // Base path for links (optional)
  
  // Standard Prisma query options
  where: { status: 'active' },
  orderBy: { id: 'desc' },
  include: { posts: true },
});

// Returns CursorPaginator
console.log(result.nextCursor);  // Cursor for next page
console.log(result.hasMorePages()); // Boolean
```

### Type Definitions for API

```typescript
// backend-api/api/users/index.ts
import type { DefineMethods } from 'aspida';
import type { LengthAwarePaginatorResponse } from '$/@frouvel/kaname/paginator';
import type { UserModelDto, ProblemDetails } from 'commonTypesWithClient';

export type Methods = DefineMethods<{
  get: {
    query: {
      page: number;
      limit: number;
      searchValue?: string;
    };
    resBody: LengthAwarePaginatorResponse<UserModelDto> | ProblemDetails;
  };
}>;
```

### Complete Example

```typescript
// Repository
export class UserRepository {
  private readonly _prisma = getPrismaClient();

  async paginate(args: {
    page: number;
    limit: number;
    search?: { value: string };
  }) {
    const where = args.search
      ? {
          OR: [
            { name: { contains: args.search.value } },
            { email: { contains: args.search.value } },
          ],
        }
      : {};

    const paginator = await this._prisma.user.withPages({
      page: args.page,
      limit: args.limit,
      where,
      orderBy: { createdAt: 'desc' },
    });

    return paginator.map(user => UserModel.fromPrismaValue({ self: user }));
  }
}

// UseCase
export class PaginateUsersUseCase {
  private readonly _userRepository: IUserRepository;

  static create() {
    return new PaginateUsersUseCase({
      userRepository: new UserRepository(),
    });
  }

  async handle(args: { page: number; limit: number; search?: { value: string } }) {
    const paginator = await this._userRepository.paginate(args);
    
    // Transform to DTOs and return response
    return paginator.map(user => user.toDto()).toResponse();
  }
}

// Controller
export default defineController(() => ({
  get: ({ query }) =>
    PaginateUsersUseCase.create()
      .handle({
        page: query.page,
        limit: query.limit,
        search: query.searchValue ? { value: query.searchValue } : undefined,
      })
      .then(ApiResponse.success)
      .catch(ApiResponse.method.get),
}));
```

---

## Prisma Extension Usage Examples

### Real-World Example: User Repository

```typescript
// backend-api/domain/user/repository/User.repository.ts
import { getPrismaClient } from '$/service/getPrismaClient';
import { UserModel } from '$/prisma/__generated__/models/User.model';

export interface IUserRepository {
  paginate(args: {
    page: number;
    limit: number;
    search?: { value: string };
  }): Promise<ReturnType<typeof import('$/@frouvel/kaname/paginator').Paginator.lengthAware<UserModel>>>;
  
  paginateWithCursor(args: {
    limit: number;
    cursor?: string;
  }): Promise<ReturnType<typeof import('$/@frouvel/kaname/paginator').Paginator.cursor<UserModel>>>;
}

export class UserRepository implements IUserRepository {
  private readonly _prisma = getPrismaClient();

  // Offset-based pagination
  async paginate(args: {
    page: number;
    limit: number;
    search?: { value: string };
  }) {
    const where = args.search
      ? {
          OR: [
            { name: { contains: args.search.value } },
            { email: { contains: args.search.value } },
          ],
        }
      : {};

    // Uses Prisma extension - automatically returns LengthAwarePaginator
    const paginator = await this._prisma.user.withPages({
      page: args.page,
      limit: args.limit,
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Transform Prisma objects to domain models
    return paginator.map(user => UserModel.fromPrismaValue({ self: user }));
  }

  // Cursor-based pagination
  async paginateWithCursor(args: {
    limit: number;
    cursor?: string;
  }) {
    const paginator = await this._prisma.user.withCursor({
      cursor: args.cursor,
      limit: args.limit,
      cursorColumn: 'id',
      orderBy: { id: 'desc' },
    });

    return paginator.map(user => UserModel.fromPrismaValue({ self: user }));
  }
}
```

### UseCase Layer

```typescript
// backend-api/domain/user/usecase/PaginateUsers.usecase.ts
import { UserRepository, IUserRepository } from '../repository/User.repository';
import { getPrismaClient } from '$/service/getPrismaClient';

export class PaginateUsersUseCase {
  private readonly _userRepository: IUserRepository;

  private constructor(args: { userRepository: IUserRepository }) {
    this._userRepository = args.userRepository;
  }

  static create() {
    return new PaginateUsersUseCase({
      userRepository: new UserRepository(),
    });
  }

  async handle(args: {
    page: number;
    limit: number;
    search?: { value: string };
  }) {
    const paginator = await this._userRepository.paginate(args);
    
    // Transform to DTOs for API response
    return paginator.map(user => user.toDto()).toResponse();
  }
}
```

### Controller Layer

```typescript
// backend-api/api/users/index.ts
import type { DefineMethods } from 'aspida';
import type { LengthAwarePaginatorResponse } from '$/@frouvel/kaname/paginator';
import type { UserModelDto, ProblemDetails } from 'commonTypesWithClient';

export type Methods = DefineMethods<{
  get: {
    query: {
      page: number;
      limit: number;
      searchValue?: string;
    };
    resBody: LengthAwarePaginatorResponse<UserModelDto> | ProblemDetails;
  };
}>;
```

```typescript
// backend-api/api/users/controller.ts
import { ApiResponse } from '$/@frouvel/kaname/http/ApiResponse';
import { PaginateUsersUseCase } from '$/domain/user/usecase/PaginateUsers.usecase';
import { defineController } from './$relay';

export default defineController(() => ({
  get: ({ query }) =>
    PaginateUsersUseCase.create()
      .handle({
        page: query.page,
        limit: query.limit,
        search: query.searchValue ? { value: query.searchValue } : undefined,
      })
      .then(ApiResponse.success)
      .catch(ApiResponse.method.get),
}));
```

### Frontend Usage

```typescript
// frontend-web/src/pages/users/index.tsx
import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { isApiSuccess } from 'commonTypesWithClient';

export default function UsersPage() {
  const [users, setUsers] = useState<UserModelDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const result = await apiClient.users.$get({
        query: { page, limit: 20 }
      });

      if (isApiSuccess(result)) {
        setUsers(result.data);
        setMeta(result.meta);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [page]);

  return (
    <div>
      <h1>Users ({meta?.total || 0})</h1>
      
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>

      {meta && (
        <div>
          <p>
            Showing {meta.from}-{meta.to} of {meta.total}
          </p>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {meta.currentPage} of {meta.lastPage}</span>
          <button 
            disabled={page === meta.lastPage} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

---
