# Migration Guide: Legacy to RFC9457 Error Handling

This guide helps you migrate existing error handling code to RFC9457-compliant format.

## Why Migrate?

RFC9457 provides:
- **Standardization**: Industry-standard error format
- **Better tooling**: Client libraries can parse errors consistently
- **Richer context**: Extension members allow detailed error information
- **Documentation**: Type URIs link to error documentation

## Migration Overview

The migration is **backward compatible** - existing code continues to work while you gradually adopt RFC9457.

## Quick Migration Checklist

- [ ] Update import statements to use new response helpers
- [ ] Replace direct status/body returns with response helpers
- [ ] Update error type definitions to include `ProblemDetails`
- [ ] Test error responses match RFC9457 format
- [ ] Update API documentation

## Step-by-Step Migration

### Step 1: Update Imports

**Before:**
```typescript
// No imports or custom response helpers
```

**After:**
```typescript
import {
  returnSuccess,
  returnGetError,
  returnPostError,
  returnNotFound,
  returnBadRequest,
} from '$/app/http/response';
```

### Step 2: Replace Direct Returns

**Before:**
```typescript
export default defineController(() => ({
  get: ({ params }) => {
    const user = findUser(params.id);
    if (!user) {
      return { status: 404, body: { error: 'User not found' } };
    }
    return { status: 200, body: user };
  },
}));
```

**After:**
```typescript
export default defineController(() => ({
  get: ({ params }) => {
    try {
      const user = findUser(params.id);
      if (!user) {
        return returnNotFound(`User with ID ${params.id} not found`, {
          userId: params.id,
        });
      }
      return returnSuccess(user);
    } catch (error) {
      return returnGetError(error);
    }
  },
}));
```

### Step 3: Update Type Definitions

**Before:**
```typescript
export type Methods = DefineMethods<{
  get: {
    resBody: User | { error: string };
  };
}>;
```

**After:**
```typescript
import type { ProblemDetails } from '$/app/http/rfc9457.types';

export type Methods = DefineMethods<{
  get: {
    resBody: User | ProblemDetails;
  };
}>;
```

### Step 4: Migrate Error Classes

**Before:**
```typescript
// Custom error without RFC9457 support
class CustomError extends Error {
  constructor(message: string) {
    super(message);
  }
}
```

**After:**
```typescript
import { AbstractFrourioFrameworkError } from '$/app/error/FrourioFrameworkError';

class CustomError extends AbstractFrourioFrameworkError {
  constructor(args: { message: string; details?: Record<string, any> }) {
    super({
      message: args.message,
      code: 'CUSTOM_ERROR', // Add to ErrorCode enum
      details: args.details,
      typeUri: 'https://example.com/errors/custom',
    });
  }
  
  static create(message: string, details?: Record<string, any>) {
    return new CustomError({ message, details });
  }
}
```

### Step 5: Update UseCase Error Handling

**Before:**
```typescript
export default defineController(() => ({
  post: ({ body }) =>
    CreateUserUseCase.create()
      .handle(body)
      .then(user => ({ status: 200, body: user }))
      .catch(error => ({ status: 500, body: { error: error.message } })),
}));
```

**After:**
```typescript
export default defineController(() => ({
  post: ({ body }) =>
    CreateUserUseCase.create()
      .handle(body)
      .then(returnSuccess)
      .catch(returnPostError),
}));
```

## Common Migration Patterns

### Pattern 1: Simple Status Returns

**Before:**
```typescript
return { status: 400, body: 'Invalid request' };
```

**After:**
```typescript
return returnBadRequest('Invalid request');
```

### Pattern 2: Error Objects

**Before:**
```typescript
return {
  status: 404,
  body: {
    error: 'Not found',
    code: 'USER_NOT_FOUND',
    userId: params.id,
  },
};
```

**After:**
```typescript
return returnNotFound('User not found', {
  userId: params.id,
});
```

### Pattern 3: Try-Catch Blocks

**Before:**
```typescript
try {
  const result = doSomething();
  return { status: 200, body: result };
} catch (error) {
  return { status: 500, body: { error: error.message } };
}
```

**After:**
```typescript
try {
  const result = doSomething();
  return returnSuccess(result);
} catch (error) {
  return returnPostError(error);
}
```

### Pattern 4: Validation Errors

**Before:**
```typescript
if (!body.email) {
  return {
    status: 400,
    body: {
      error: 'Validation failed',
      fields: ['email'],
    },
  };
}
```

**After:**
```typescript
import { ValidationError } from '$/app/error/CommonErrors';

if (!body.email) {
  throw ValidationError.create('Validation failed', {
    errors: [{ field: 'email', message: 'Required' }],
  });
}
```

## Testing Migration

### Test Your API Responses

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';

describe('User API', () => {
  it('should return RFC9457 error for not found', async () => {
    const response = await fetch('/api/users/999');
    const body = await response.json();
    
    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toBe('application/problem+json');
    expect(body).toMatchObject({
      type: expect.any(String),
      title: expect.any(String),
      status: 404,
      detail: expect.any(String),
    });
  });
});
```

## Gradual Migration Strategy

You don't need to migrate everything at once:

1. **Phase 1**: Update new endpoints to use RFC9457
2. **Phase 2**: Update frequently-used endpoints
3. **Phase 3**: Update remaining endpoints
4. **Phase 4**: Deprecate old format (optional)

## Backward Compatibility

Old error format still works via the deprecated `toJSON()` method:

```typescript
// Still works but deprecated
const error = new NotFoundError({ message: 'Not found' });
const json = error.toJSON();
// Returns: { error: { code: 'NOT_FOUND', message: '...', ... } }
```

New format via `toProblemDetails()`:
```typescript
const error = NotFoundError.create('Not found');
const problem = error.toProblemDetails();
// Returns RFC9457 format
```

## Common Issues

### Issue 1: Headers Not Set

**Problem:**
```typescript
return { status: 404, body: problemDetails };
```

**Solution:**
```typescript
return returnNotFound('Resource not found');
// Automatically sets Content-Type: application/problem+json
```

### Issue 2: Missing Type Definitions

**Problem:**
```typescript
// TypeScript error: Type 'ProblemDetails' is not assignable
resBody: User;
```

**Solution:**
```typescript
import type { ProblemDetails } from '$/app/http/rfc9457.types';

resBody: User | ProblemDetails;
```

### Issue 3: Error Not Caught

**Problem:**
```typescript
// Error thrown but not caught, returns 500 with stack trace
throw NotFoundError.create('Not found');
```

**Solution:**
```typescript
try {
  throw NotFoundError.create('Not found');
} catch (error) {
  return returnGetError(error);
}
```

## Checklist for Each Endpoint

- [ ] Imports updated to use new helpers
- [ ] Success responses use `returnSuccess()`
- [ ] Error responses use appropriate helper functions
- [ ] Error responses include relevant context
- [ ] Type definitions include `ProblemDetails`
- [ ] Tests verify RFC9457 format
- [ ] Documentation updated

## Getting Help

- See [Quick Start Guide](./RFC9457_QUICK_START.md)
- See [Full Documentation](./RFC9457_ERROR_HANDLING.md)
- See [Example Controller](../api/example-rfc9457/controller.ts)

## Example: Complete Migration

**Before (Legacy):**
```typescript
import { defineController } from './$relay';

export default defineController(() => ({
  get: ({ params }) => {
    const user = findUser(params.id);
    if (!user) {
      return { status: 404, body: { error: 'User not found' } };
    }
    return { status: 200, body: user };
  },
  
  post: ({ body }) => {
    if (!body.email) {
      return { status: 400, body: { error: 'Email required' } };
    }
    try {
      const user = createUser(body);
      return { status: 200, body: user };
    } catch (error) {
      return { status: 500, body: { error: error.message } };
    }
  },
}));
```

**After (RFC9457):**
```typescript
import { defineController } from './$relay';
import {
  returnSuccess,
  returnGetError,
  returnPostError,
  returnBadRequest,
} from '$/app/http/response';
import { NotFoundError } from '$/app/error/CommonErrors';

export default defineController(() => ({
  get: ({ params }) => {
    try {
      const user = findUser(params.id);
      if (!user) {
        throw NotFoundError.create(`User ${params.id} not found`, {
          userId: params.id,
        });
      }
      return returnSuccess(user);
    } catch (error) {
      return returnGetError(error);
    }
  },
  
  post: ({ body }) => {
    try {
      if (!body.email) {
        return returnBadRequest('Email is required', { field: 'email' });
      }
      const user = createUser(body);
      return returnSuccess(user);
    } catch (error) {
      return returnPostError(error);
    }
  },
}));
```

## Next Steps

After migration:
1. Update API documentation to reflect RFC9457 responses
2. Update client-side error handling to parse ProblemDetails
3. Consider adding error type URI documentation
4. Monitor logs for any regression issues