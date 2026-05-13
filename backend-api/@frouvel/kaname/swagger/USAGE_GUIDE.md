# Swagger API Documentation Guide

This guide explains how to add Swagger/OpenAPI documentation to your frourio-framework APIs.

## Current Status

The Swagger infrastructure is **fully functional** with advanced features. The system automatically scans your `api/` directory, generates OpenAPI documentation, and supports **JSDoc comments** for enhanced documentation and **custom tag descriptions** for better organization.

## How It Works

### Automatic Documentation

The system automatically:

1. **Discovers Routes** from your file structure:
   ```
   api/
     index.ts           → GET /
     health/
       index.ts         → GET /health
     users/
       index.ts         → GET,POST /users
       _id@string/
         index.ts       → GET,PUT,DELETE /users/{id}
   ```

2. **Extracts Types & JSDoc** from your aspida definitions:
   ```typescript
   // api/health/index.ts
   /**
    * Health check endpoint
    * @description Returns server health status
    * @tag Health
    */
   export type Methods = DefineMethods<{
     get: {
       resBody: string;
     };
   }>;
   ```

3. **Generates Complete OpenAPI Spec** with:
   - Route paths and parameters
   - HTTP methods
   - Request/response types
   - JSDoc summaries and descriptions
   - Tag grouping with custom descriptions
   - RFC9457 error schemas

## Accessing API Documentation

### Interactive Swagger UI

Access your current API documentation at:
- **Swagger UI**: http://localhost:31577/api-docs
- **OpenAPI JSON**: http://localhost:31577/api-docs/json

### Generate Spec Files

Create standalone OpenAPI specification files:

```bash
# Generate YAML file (default)
npm run artisan openapi:generate

# Generate JSON file
npm run artisan openapi:generate -f json

# Custom output path
npm run artisan openapi:generate -o ./docs/openapi.yaml
```

Use these files with:
- API testing tools (Postman, Insomnia)
- Client SDK generators
- API gateways
- Documentation hosting platforms

## Adding Rich Documentation

### JSDoc Comments (Fully Supported!)

Add JSDoc comments to enhance your API documentation:

```typescript
// api/users/index.ts
import type { DefineMethods } from 'aspida';
import type { UserModelDto, ProblemDetails } from 'commonTypesWithClient';

/**
 * List all users
 * @description Returns a paginated list of users with optional search
 * @tag Users
 */
export type Methods = DefineMethods<{
  get: {
    query: {
      /** Page number for pagination (default: 1) */
      page: number;
      /** Number of items per page (default: 10) */
      limit: number;
      /** Optional search term for filtering users */
      searchValue?: string;
    };
    resBody: {
      data: UserModelDto[];
      meta: PaginationMeta;
    } | ProblemDetails;
  };

  /**
   * Create new user
   * @description Creates a new user account with validation
   * @tag Users
   */
  post: {
    reqBody: {
      /** User's full name (required) */
      name: string;
      /** Valid email address (must be unique) */
      email: string;
      /** User age (must be 18 or older) */
      age: number;
    };
    resBody: UserModelDto | ProblemDetails;
  };
}>;
```

**Supported JSDoc Tags:**

- **`@tag`** - Assigns the endpoint to a tag group (e.g., `@tag Users`)
- **`@description`** - Detailed endpoint description
- **`@deprecated`** - Marks the endpoint as deprecated
- **Parameter descriptions** - Use `/** comment */` above parameter fields

### Custom Tag Descriptions

Define custom descriptions for your API tags in [`config/swagger.ts`](../../../../config/swagger.ts):

```typescript
const tagDescriptions: Record<string, string> = {
  Users: 'User management and account operations',
  Health: 'Service health and status checks',
  Auth: 'Authentication and authorization',
  Admin: 'Administrative operations',
  Posts: 'Blog post management',
};

export default {
  enabled: true,
  // ... other config
  tagDescriptions,
};
```

Tags will be automatically collected from your JSDoc `@tag` annotations and displayed in Swagger UI with your custom descriptions.

## Features & Capabilities

### Fully Supported ✅
- Automatic route discovery from file structure
- Type extraction from aspida definitions
- **JSDoc comment parsing** for summaries and descriptions
- **Custom tag descriptions** via config
- **OpenAPI spec file generation** (YAML/JSON)
- RFC9457 ProblemDetails error schemas
- Interactive Swagger UI
- Parameter documentation from JSDoc
- Tag-based endpoint grouping

### Future Enhancements 🚧
- Zod schema to OpenAPI schema conversion
- Example response generation from sample data
- Security scheme auto-detection from middleware
- Request/response example values

## Best Practices

### 1. Always Use ProblemDetails

```typescript
import type { ProblemDetails } from 'commonTypesWithClient';

export type Methods = DefineMethods<{
  get: {
    resBody: UserDto | ProblemDetails;  // ✅ Good
  };
  post: {
    resBody: UserDto;  // ❌ Missing error type
  };
}>;
```

### 2. Add JSDoc Documentation

```typescript
/**
 * Summary goes here
 * @description Detailed description goes here
 * @tag TagName
 */
export type Methods = DefineMethods<{
  get: {
    query: {
      /** Describe each parameter */
      page: number;
    };
    resBody: Data | ProblemDetails;
  };
}>;
```

### 3. Use Meaningful Tags

```typescript
/**
 * @tag Users    // ✅ Good - clear category
 */

/**
 * @tag API      // ❌ Too generic
 */
```

### 4. Define Tag Descriptions

In [`config/swagger.ts`](../../../../config/swagger.ts):

```typescript
const tagDescriptions: Record<string, string> = {
  Users: 'User account management and profile operations',
  Auth: 'Authentication, authorization, and session management',
  // Add all your tags here
};
```

### 5. Use Descriptive Type Names

```typescript
// ✅ Good
export type UserCreateRequest = {
  name: string;
  email: string;
};

// ❌ Not descriptive
export type Request = {
  name: string;
};
```

### 6. Group Related APIs

```
api/
  users/
    index.ts          # User listing and creation
    _id@string/
      index.ts        # User detail operations
    search/
      index.ts        # User search
```

## Complete Example

Here's a complete example showing all features:

```typescript
// api/users/index.ts
import type { DefineMethods } from 'aspida';
import type { UserModelDto, PaginationMeta, ProblemDetails } from 'commonTypesWithClient';

/**
 * List all users with pagination
 * @description Returns a paginated list of users. Supports optional search filtering
 * by name or email. Results are ordered by creation date (newest first).
 * @tag Users
 */
export type Methods = DefineMethods<{
  get: {
    query: {
      /** Current page number (starts at 1) */
      page: number;
      /** Number of users per page (max: 100) */
      limit: number;
      /** Optional search term to filter users by name or email */
      searchValue?: string;
    };
    resBody: {
      data: UserModelDto[];
      meta: PaginationMeta;
    } | ProblemDetails;
  };

  /**
   * Create a new user
   * @description Creates a new user account. Email must be unique and age must be 18+.
   * @tag Users
   */
  post: {
    reqBody: {
      /** User's full name (2-100 characters) */
      name: string;
      /** Valid email address (must be unique) */
      email: string;
      /** User's age (must be 18 or older) */
      age: number;
    };
    resBody: UserModelDto | ProblemDetails;
  };
}>;
```

```typescript
// config/swagger.ts
const tagDescriptions: Record<string, string> = {
  Users: 'User account management, profile operations, and user search',
  Health: 'Service health checks and system status monitoring',
  Auth: 'Authentication, authorization, and session management',
};

export default {
  enabled: process.env.NODE_ENV !== 'production',
  path: '/api-docs',
  title: 'My API',
  version: '1.0.0',
  description: 'Complete API documentation with examples',
  servers: [
    {
      url: 'http://localhost:31577',
      description: 'Development server',
    },
  ],
  tagDescriptions,
};
```

## Troubleshooting

### Routes Not Appearing

1. **Check file structure**: Ensure `index.ts` files exist in route directories
2. **Verify exports**: Must export `Methods` type with `DefineMethods`
3. **Restart server**: Changes require server restart
4. **Check logs**: Look for `[HttpKernel] Swagger UI available at /api-docs`

### JSDoc Not Showing

1. **Verify JSDoc format**: Must be above `export type Methods`
2. **Check supported tags**: Use `@tag`, `@description`, `@deprecated`
3. **Server restart**: Required after JSDoc changes
4. **Check console**: Look for `[OpenApiGenerator] Found JSDoc for X method(s)`

### Tags Not Grouped

1. **Add @tag annotation**: Each method needs `@tag TagName`
2. **Define tag descriptions**: Add to [`config/swagger.ts`](../../../../config/swagger.ts)
3. **Restart server**: Required for config changes

### Spec Generation Fails

1. **Check Swagger config**: Ensure [`config/swagger.ts`](../../../../config/swagger.ts) has no syntax errors
2. **Verify OpenAPI generator**: Check that `SwaggerServiceProvider` is registered
3. **Check permissions**: Ensure write permissions for output directory

## CLI Commands

### Generate OpenAPI Specification

```bash
# Generate YAML (default)
npm run artisan openapi:generate

# Generate JSON
npm run artisan openapi:generate -f json
npm run artisan openapi:generate --format json

# Custom output path
npm run artisan openapi:generate -o ./docs/openapi.yaml
npm run artisan openapi:generate --output ./public/api-spec.json

# Combined options
npm run artisan openapi:generate -f json -o ./docs/api.json
```

## Real-World Examples

### Example 1: User Management API

```typescript
// api/users/_id@string/index.ts
import type { DefineMethods } from 'aspida';
import type { UserModelDto, ProblemDetails } from 'commonTypesWithClient';

/**
 * Get user details by ID
 * @description Retrieves complete user profile information including metadata
 * @tag Users
 */
export type Methods = DefineMethods<{
  get: {
    resBody: UserModelDto | ProblemDetails;
  };

  /**
   * Update user profile
   * @description Updates user profile. Only provided fields will be updated.
   * @tag Users
   */
  put: {
    reqBody: {
      /** User's full name */
      name?: string;
      /** Email address (must be unique) */
      email?: string;
    };
    resBody: UserModelDto | ProblemDetails;
  };

  /**
   * Delete user account
   * @description Permanently deletes the user account and all associated data
   * @tag Users
   * @deprecated Use POST /users/{id}/deactivate instead
   */
  delete: {
    resBody: void | ProblemDetails;
  };
}>;
```

### Example 2: Health Check

```typescript
// api/health/index.ts
import type { DefineMethods } from 'aspida';

/**
 * Service health check
 * @description Returns 200 OK if service is healthy
 * @tag Health
 */
export type Methods = DefineMethods<{
  get: {
    resBody: string;
  };
}>;
```

## Support

For issues or enhancements:
- Check [Swagger Module README](README.md)
- Review [OpenApiGenerator source](OpenApiGenerator.ts)
- See framework documentation