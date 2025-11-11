# RFC9457 Quick Start Guide

Quick reference for using RFC9457-compliant error handling in controllers.

## TL;DR

```typescript
import { returnSuccess, returnGetError, returnNotFound } from '$/app/http/response';
import { NotFoundError } from '$/app/error/CommonErrors';

export default defineController(() => ({
  get: ({ params }) => {
    try {
      const item = findItem(params.id);
      if (!item) {
        throw NotFoundError.create(`Item ${params.id} not found`, { itemId: params.id });
      }
      return returnSuccess(item);
    } catch (error) {
      return returnGetError(error);
    }
  },
}));
```

## Quick Reference

### Import Response Helpers

```typescript
import {
  returnSuccess,           // For successful responses
  returnGetError,          // For GET errors (default: 404)
  returnPostError,         // For POST errors (default: 500)
  returnPutError,          // For PUT errors (default: 500)
  returnPatchError,        // For PATCH errors (default: 403)
  returnDeleteError,       // For DELETE errors (default: 500)
  returnNotFound,          // For 404 errors
  returnBadRequest,        // For 400 errors
  returnUnauthorized,      // For 401 errors
  returnForbidden,         // For 403 errors
  returnConflict,          // For 409 errors
} from '$/app/http/response';
```

### Import Error Classes

```typescript
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  InternalServerError,
} from '$/app/error/CommonErrors';
```

## Common Patterns

### Pattern 1: Direct Return with Helper

```typescript
post: ({ body }) => {
  if (!body.email) {
    return returnBadRequest('Email is required', { field: 'email' });
  }
  return returnSuccess({ created: true });
},
```

### Pattern 2: Throw Custom Error

```typescript
get: ({ params }) => {
  try {
    const user = findUser(params.id);
    if (!user) {
      throw NotFoundError.create(`User ${params.id} not found`, { userId: params.id });
    }
    return returnSuccess(user);
  } catch (error) {
    return returnGetError(error);
  }
},
```

### Pattern 3: UseCase Integration

```typescript
post: ({ body }) =>
  CreateUserUseCase.create()
    .handle({ email: body.email })
    .then(returnSuccess)
    .catch(returnPostError),
```

## Response Format

All errors return this structure:

```json
{
  "type": "https://example.com/errors/not-found",
  "title": "NOT_FOUND",
  "status": 404,
  "detail": "User 123 not found",
  "code": "NOT_FOUND",
  "timestamp": "2025-11-09T09:00:00.000Z",
  "userId": "123"
}
```

## Headers

Responses include:
```
Content-Type: application/problem+json
```

## Type Definitions

```typescript
import type { ProblemDetails } from '$/app/http/rfc9457.types';

export type Methods = DefineMethods<{
  get: {
    resBody: User | ProblemDetails;
  };
}>;
```

## See Full Documentation

[RFC9457 Error Handling Guide](./RFC9457_ERROR_HANDLING.md)