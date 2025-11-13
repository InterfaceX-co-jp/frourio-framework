# Swagger API Documentation Guide

This guide explains how to add Swagger/OpenAPI documentation to your frourio-framework APIs.

## Current Status

The Swagger infrastructure is in place and working. The system automatically scans your `api/` directory and generates OpenAPI documentation. However, the current implementation provides **basic automatic generation**.

## How It Works Now

### Automatic Documentation

The system automatically:

1. **Discovers Routes** from your file structure:
   ```
   api/
     index.ts           → GET /
     health/
       index.ts         → GET /health
     example-rfc9457/
       index.ts         → GET,POST,PUT,DELETE,PATCH /example-rfc9457
   ```

2. **Extracts Types** from your aspida definitions:
   ```typescript
   // api/health/index.ts
   export type Methods = DefineMethods<{
     get: {
       resBody: string;
     };
   }>;
   ```

3. **Generates Basic OpenAPI Spec** with:
   - Route paths
   - HTTP methods
   - Request/response types
   - RFC9457 error schemas

## Current API Documentation

### Your APIs are Already Documented!

Access your current API documentation at:
- **Swagger UI**: http://localhost:31577/api-docs
- **OpenAPI JSON**: http://localhost:31577/api-docs/json

### Example: Health Check API

Your health check endpoint is automatically documented:

```yaml
/health:
  get:
    summary: GET /health
    responses:
      200:
        description: Successful response
        content:
          application/json:
            schema:
              type: string
      400/404/500:
        description: Error responses (ProblemDetails)
```

### Example: RFC9457 Example API

Your example endpoint with complex types:

```yaml
/example-rfc9457:
  post:
    summary: POST /example-rfc9457
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              simulateNotFound:
                type: boolean
              simulateValidation:
                type: boolean
              resourceId:
                type: string
    responses:
      200:
        description: Successful response
```

## How to Add Better Documentation

### Option 1: JSDoc Comments (Recommended for Future Enhancement)

Add JSDoc comments to your type definitions:

```typescript
// api/users/index.ts
import type { DefineMethods } from 'aspida';
import type { ProblemDetails } from 'commonTypesWithClient';

/**
 * User Management API
 * 
 * Handles user CRUD operations
 */
export type Methods = DefineMethods<{
  /**
   * Get user by ID
   * @description Retrieves a single user by their unique identifier
   * @tag Users
   */
  get: {
    query: {
      /** User's unique identifier */
      id: number;
    };
    resBody: {
      id: number;
      name: string;
      email: string;
    } | ProblemDetails;
  };

  /**
   * Create new user
   * @description Creates a new user account
   * @tag Users
   */
  post: {
    reqBody: {
      /** User's full name */
      name: string;
      /** Valid email address */
      email: string;
      /** User age (must be 18+) */
      age: number;
    };
    resBody: {
      id: number;
      name: string;
      email: string;
    } | ProblemDetails;
  };
}>;
```

### Option 2: Extend with Custom OpenAPI Annotations

Create a `swagger.json` file alongside your route:

```json
// api/users/swagger.json
{
  "tags": ["Users"],
  "description": "User management endpoints",
  "paths": {
    "/users": {
      "get": {
        "summary": "List all users",
        "description": "Returns a paginated list of users",
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "description": "Page number",
            "required": false,
            "schema": { "type": "integer", "default": 1 }
          }
        ]
      }
    }
  }
}
```

### Option 3: Use Response Builder with Descriptions

Use the ResponseBuilder pattern with descriptive names:

```typescript
// api/users/controller.ts
import { ApiResponse, ResponseBuilder } from '$/@frouvel/kaname/http/ApiResponse';

export default defineController(() => ({
  post: ({ body }) =>
    ResponseBuilder.create()
      .withValidation(body, createUserSchema)
      .executeWithSuccess((data) => {
        // Business logic here
        return {
          message: 'User created successfully',
          user: data,
        };
      }),
}));
```

## Current Limitations & Future Enhancements

### What Works Now ✅
- Automatic route discovery
- Basic type extraction
- RFC9457 error schemas
- Swagger UI interface
- OpenAPI 3.0 JSON export

### Planned Enhancements 🚧
- JSDoc comment parsing for descriptions
- Custom OpenAPI annotation support
- Zod schema to OpenAPI schema conversion
- Tag grouping from directory structure
- Example response generation
- Security scheme auto-detection

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

### 2. Use Descriptive Type Names

```typescript
// ✅ Good
export type UserCreateRequest = {
  name: string;
  email: string;
};

export type UserResponse = {
  id: number;
  name: string;
  email: string;
};

// ❌ Not descriptive
export type Request = {
  name: string;
};
```

### 3. Group Related APIs

```
api/
  users/
    index.ts          # User listing and creation
    [id]/
      index.ts        # User detail operations
    search/
      index.ts        # User search
```

## Troubleshooting

### Routes Not Appearing

1. **Check file structure**: Ensure `index.ts` files exist
2. **Verify exports**: Must export `Methods` type with `DefineMethods`
3. **Restart server**: Changes require server restart
4. **Check logs**: Look for `[HttpKernel] Swagger UI available at /api-docs`

### Type Definitions Not Showing

The current implementation shows basic types. For richer types:
- Use specific type names instead of inline types
- Import and use shared DTOs from `commonTypesWithClient`

### Documentation Not Updating

- Clear browser cache
- Restart the development server
- Check `SWAGGER_ENABLED=true` in `.env`

## Examples from Your Current APIs

### 1. Health Check (/health)

```typescript
// api/health/index.ts
import type { DefineMethods } from 'aspida';

export type Methods = DefineMethods<{
  get: {
    resBody: string;
  };
}>;
```

**Generated Docs**: Simple GET endpoint returning a string

### 2. RFC9457 Example (/example-rfc9457)

```typescript
// api/example-rfc9457/index.ts
import type { ApiResponse } from 'commonTypesWithClient';

export type Methods = DefineMethods<{
  post: {
    reqBody: {
      simulateNotFound?: boolean;
      simulateValidation?: boolean;
    };
    resBody: ApiResponse<{ message: string }>;
  };
}>;
```

**Generated Docs**: POST endpoint with optional boolean flags, returns success/error responses

## Next Steps

1. **Access your documentation**: Visit http://localhost:31577/api-docs
2. **Review generated docs**: Check what's automatically generated
3. **Add JSDoc comments**: Enhance with descriptions (future enhancement)
4. **Use shared types**: Import DTOs from `commonTypesWithClient` for consistency

## Support

For issues or enhancements:
- Check [Swagger Module README](README.md)
- Review [OpenApiGenerator source](OpenApiGenerator.ts)
- See framework documentation