# Frontend Usage of RFC9457 Error Handling

This guide shows how to use RFC9457 error responses on the frontend with type-safe error handling.

## Overview

The `ApiResponse<T>` type automatically wraps your success response type with `ProblemDetails` for error cases, making it easy to handle both success and error responses in a type-safe way.

## Type Definition

Instead of manually typing both success and error cases:

```typescript
// ❌ Verbose way
resBody: User | ProblemDetails;
```

Use the `ApiResponse<T>` wrapper:

```typescript
// ✅ Clean way
resBody: ApiResponse<User>;
```

## Backend Usage

### Define API Types

```typescript
import type { DefineMethods } from 'aspida';
import type { ApiResponse } from '$/commonTypesWithClient';

export type Methods = DefineMethods<{
  get: {
    resBody: ApiResponse<User>;
  };
  post: {
    reqBody: { name: string };
    resBody: ApiResponse<User>;
  };
}>;
```

## Frontend Usage

### Setup

The type guards are automatically available when you import from `commonTypesWithClient`:

```typescript
import { isApiSuccess, isApiError } from '@/path/to/commonTypesWithClient';
```

### Pattern 1: Using `isApiSuccess`

```typescript
import { isApiSuccess } from '@/commonTypesWithClient';

const response = await apiClient.users._id(123).$get();

if (isApiSuccess(response)) {
  // TypeScript knows response is User here
  console.log(response.name);
  console.log(response.email);
} else {
  // TypeScript knows response is ProblemDetails here
  console.error(`Error: ${response.title}`);
  console.error(`Detail: ${response.detail}`);
  console.error(`Status: ${response.status}`);
}
```

### Pattern 2: Using `isApiError`

```typescript
import { isApiError } from '@/commonTypesWithClient';

const response = await apiClient.users.$post({ body: { name: 'John' } });

if (isApiError(response)) {
  // Handle error case first
  console.error(`Error: ${response.detail}`);
  return;
}

// TypeScript knows response is User here
console.log(`Created user: ${response.name}`);
```

### Pattern 3: React Component

```tsx
import { useState, useEffect } from 'react';
import { isApiSuccess, type ApiResponse } from '@/commonTypesWithClient';

type User = {
  id: number;
  name: string;
  email: string;
};

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await apiClient.users._id(userId).$get();

        if (isApiSuccess(response)) {
          setUser(response);
          setError(null);
        } else {
          setError(response.detail);
          setUser(null);
        }
      } catch (err) {
        setError('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Pattern 4: Custom Hook

```typescript
import { useState, useCallback } from 'react';
import { isApiSuccess, type ApiResponse } from '@/commonTypesWithClient';

type UseApiResult<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  execute: () => Promise<void>;
};

function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();

      if (isApiSuccess(response)) {
        setData(response);
        setError(null);
      } else {
        setError(response.detail);
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { data, error, loading, execute };
}

// Usage
function MyComponent() {
  const { data, error, loading, execute } = useApi(() =>
    apiClient.users._id(123).$get()
  );

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return <div>{data.name}</div>;
}
```

### Pattern 5: Error Display Component

```tsx
import type { ProblemDetails } from '@/commonTypesWithClient';

function ErrorDisplay({ error }: { error: ProblemDetails }) {
  return (
    <div className="error-container">
      <h3>{error.title}</h3>
      <p>{error.detail}</p>
      {error.code && <p>Error Code: {error.code}</p>}
      {error.timestamp && (
        <p>Time: {new Date(error.timestamp).toLocaleString()}</p>
      )}
      
      {/* Display additional fields if present */}
      {Object.entries(error).map(([key, value]) => {
        if (['type', 'title', 'status', 'detail', 'code', 'timestamp'].includes(key)) {
          return null;
        }
        return (
          <p key={key}>
            {key}: {JSON.stringify(value)}
          </p>
        );
      })}
    </div>
  );
}

// Usage
function MyComponent() {
  const [response, setResponse] = useState<ApiResponse<User> | null>(null);

  if (!response) return null;

  if (isApiError(response)) {
    return <ErrorDisplay error={response} />;
  }

  return <div>User: {response.name}</div>;
}
```

## Type Safety Benefits

### Before (Manual Union Types)

```typescript
// Type definition
resBody: User | ProblemDetails;

// Frontend usage - no type narrowing
const response = await apiClient.users.$get();
// TypeScript doesn't know if response is User or ProblemDetails
// You have to manually check properties
if ('detail' in response) {
  // Error case
} else {
  // Success case
}
```

### After (ApiResponse with Type Guards)

```typescript
// Type definition
resBody: ApiResponse<User>;

// Frontend usage - automatic type narrowing
const response = await apiClient.users.$get();

if (isApiSuccess(response)) {
  // TypeScript automatically knows response is User
  console.log(response.name); // ✅ Type-safe
  console.log(response.detail); // ❌ TypeScript error
}
```

## Error Handling Best Practices

### 1. Always Handle Errors

```typescript
const response = await apiClient.users.$get();

if (isApiError(response)) {
  // Always handle the error case
  console.error(response.detail);
  return;
}

// Continue with success case
console.log(response.name);
```

### 2. Display User-Friendly Messages

```typescript
if (isApiError(response)) {
  // Use the detail field for user-friendly messages
  toast.error(response.detail);
  
  // Log full error for debugging
  console.error('API Error:', response);
}
```

### 3. Handle Specific Error Codes

```typescript
if (isApiError(response)) {
  switch (response.code) {
    case 'UNAUTHORIZED':
      // Redirect to login
      router.push('/login');
      break;
    case 'NOT_FOUND':
      // Show 404 page
      router.push('/404');
      break;
    default:
      // Show generic error
      toast.error(response.detail);
  }
}
```

### 4. Retry Logic

```typescript
async function fetchWithRetry<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await apiCall();
    
    if (isApiSuccess(response)) {
      return response;
    }
    
    // Only retry on server errors (5xx)
    if (response.status < 500) {
      throw new Error(response.detail);
    }
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
  }
  
  throw new Error('Max retries reached');
}
```

## Common Patterns

### Loading States

```typescript
const [state, setState] = useState<{
  data: User | null;
  error: string | null;
  loading: boolean;
}>({
  data: null,
  error: null,
  loading: false,
});

async function loadData() {
  setState(prev => ({ ...prev, loading: true }));
  
  const response = await apiClient.users.$get();
  
  if (isApiSuccess(response)) {
    setState({ data: response, error: null, loading: false });
  } else {
    setState({ data: null, error: response.detail, loading: false });
  }
}
```

### Form Submission

```typescript
async function handleSubmit(data: CreateUserInput) {
  const response = await apiClient.users.$post({ body: data });
  
  if (isApiError(response)) {
    // Show validation errors
    if (response.errors) {
      // Assuming errors field contains field-specific errors
      Object.entries(response.errors).forEach(([field, message]) => {
        setFieldError(field, message);
      });
    } else {
      toast.error(response.detail);
    }
    return;
  }
  
  // Success
  toast.success('User created successfully');
  router.push(`/users/${response.id}`);
}
```

## See Also

- [RFC9457 Error Handling Guide](./RFC9457_ERROR_HANDLING.md)
- [Quick Start Guide](./RFC9457_QUICK_START.md)
- [API Response Types](../commonTypesWithClient/apiResponse.types.ts)