# Swagger/OpenAPI Module

Provides automatic OpenAPI specification generation and Swagger UI integration for frourio-framework APIs.

## Features

- 🔄 **Automatic Generation**: Generates OpenAPI 3.0 specs from aspida type definitions
- 📖 **JSDoc Support**: Parses JSDoc comments for enhanced documentation
- 🏷️ **Tag Descriptions**: Custom tag grouping and descriptions via config
- 🎨 **Swagger UI**: Interactive API documentation interface
- 📄 **Spec File Export**: Generate OpenAPI spec files (YAML/JSON) via CLI command
- 🔧 **Framework Integration**: Seamlessly integrated via service provider
- ⚙️ **Configurable**: Customize via environment variables and config file
- 🛡️ **RFC9457 Support**: Includes ProblemDetails schema for error responses

## Quick Start

### 1. Configuration

Swagger is automatically enabled in development mode. Configure via environment variables:

```bash
# .env
SWAGGER_ENABLED=true
SWAGGER_PATH=/api-docs
SWAGGER_TITLE=My API
SWAGGER_VERSION=1.0.0
SWAGGER_DESCRIPTION=API Documentation
```

Or via [`config/swagger.ts`](../../../../config/swagger.ts):

```typescript
const tagDescriptions: Record<string, string> = {
  Users: 'User management and account operations',
  Health: 'Service health and status checks',
  Auth: 'Authentication and authorization',
};

export default {
  enabled: true,
  path: '/api-docs',
  title: 'My API',
  version: '1.0.0',
  description: 'API Documentation',
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Development',
    },
  ],
  tagDescriptions,  // Custom tag descriptions
};
```

### 2. Access Swagger UI

Once your server is running, access Swagger UI at:

```
http://localhost:8080/api-docs
```

View the raw OpenAPI JSON at:

```
http://localhost:8080/api-docs/json
```

### 3. Generate OpenAPI Spec File

Generate OpenAPI specification files for documentation or external tools:

```bash
# Generate YAML file (default)
npm run artisan openapi:generate

# Generate JSON file
npm run artisan openapi:generate -f json

# Custom output path
npm run artisan openapi:generate -o ./docs/api-spec.yaml
```

This creates a standalone OpenAPI spec file that can be used with:
- External API testing tools (Postman, Insomnia)
- API gateway configuration
- Client SDK generation
- Documentation hosting platforms

### 4. Service Provider Registration

The [`SwaggerServiceProvider`](../foundation/providers/SwaggerServiceProvider.ts) is automatically registered in [`bootstrap/app.ts`](../../../../bootstrap/app.ts):

```typescript
const providers = [
  DatabaseServiceProvider,
  ConsoleServiceProvider,
  SwaggerServiceProvider,  // ← Framework provider
  AppServiceProvider,
];
```

## How It Works

### 1. OpenAPI Generation

The [`OpenApiGenerator`](OpenApiGenerator.ts:39) scans your `api/` directory and:

- Discovers routes from file structure
- Extracts type definitions from aspida `index.ts` files
- Parses JSDoc comments for documentation metadata
- Applies custom tag descriptions from config
- Generates OpenAPI 3.0 specification
- Includes RFC9457 ProblemDetails schema

### 2. Route Discovery

Routes are discovered from the file structure:

```
api/
  users/
    index.ts          → /users
    [id]/
      index.ts        → /users/{id}
  posts/
    index.ts          → /posts
```

### 3. Type Extraction & JSDoc Parsing

Method definitions and JSDoc comments are extracted from aspida types:

```typescript
// api/users/index.ts
/**
 * List all users
 * @description Returns a paginated list of users with search support
 * @tag Users
 */
export type Methods = DefineMethods<{
  get: {
    query: {
      /** Page number for pagination */
      page: number;
      /** Number of items per page */
      limit: number;
      /** Optional search term */
      searchValue?: string;
    };
    resBody: {
      data: UserModelDto[];
      meta: PaginationMeta;
    } | ProblemDetails;
  };
}>;
```

Generates:

```yaml
/users:
  get:
    summary: List all users
    description: Returns a paginated list of users with search support
    tags:
      - Users
    parameters:
      - name: page
        in: query
        required: true
        description: Page number for pagination
        schema:
          type: number
      - name: limit
        in: query
        required: true
        description: Number of items per page
        schema:
          type: number
      - name: searchValue
        in: query
        required: false
        description: Optional search term
        schema:
          type: string
    responses:
      200:
        description: Successful response
      400/404/500:
        description: Error responses (ProblemDetails)
```

## Configuration Reference

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SWAGGER_ENABLED` | `true` (dev), `false` (prod) | Enable/disable Swagger |
| `SWAGGER_PATH` | `/api-docs` | Swagger UI route path |
| `SWAGGER_TITLE` | `${APP_NAME}` | API title |
| `SWAGGER_VERSION` | `1.0.0` | API version |
| `SWAGGER_DESCRIPTION` | `API Documentation` | API description |

### Config File Schema

See [`config/swagger.ts`](../../../../config/swagger.ts:26) for the complete schema:

```typescript
type SwaggerConfig = {
  enabled: boolean;
  path: string;
  title: string;
  version: string;
  description?: string;
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  tagDescriptions?: Record<string, string>;  // NEW: Custom tag descriptions
};
```

### Tag Descriptions

Define custom descriptions for API tags in [`config/swagger.ts`](../../../../config/swagger.ts:32):

```typescript
const tagDescriptions: Record<string, string> = {
  Users: 'User management and account operations',
  Health: 'Service health and status checks',
  Auth: 'Authentication and authorization',
  Admin: 'Administrative operations',
};
```

Tags are automatically collected from your JSDoc `@tag` annotations and grouped in Swagger UI.

## Architecture

```
@frouvel/kaname/swagger/
├── OpenApiGenerator.ts       # Core spec generator
├── index.ts                  # Module exports
└── README.md                 # This file

@frouvel/kaname/foundation/
└── providers/
    └── SwaggerServiceProvider.ts  # Framework integration

config/
└── swagger.ts                # Configuration file
```

## Customization

### JSDoc Documentation

Enhance your API documentation with JSDoc comments:

```typescript
/**
 * Create a new user
 * @description Creates a new user account with validation
 * @tag Users
 */
export type Methods = DefineMethods<{
  post: {
    reqBody: {
      /** User's full name */
      name: string;
      /** Valid email address */
      email: string;
      /** User age (must be 18+) */
      age: number;
    };
    resBody: UserModelDto | ProblemDetails;
  };
}>;
```

**Supported JSDoc Tags:**
- `@tag` - Assign endpoint to a tag group
- `@description` - Detailed endpoint description
- `@deprecated` - Mark endpoint as deprecated
- Parameter descriptions via `/** comment */` above fields

### Custom Servers

```typescript
// config/swagger.ts
export default {
  enabled: true,
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Local development',
    },
    {
      url: 'https://api.example.com',
      description: 'Production',
    },
  ],
};
```

### Disable in Production

```bash
# .env.production
SWAGGER_ENABLED=false
```

## Best Practices

1. **Type Definitions**: Always include [`ProblemDetails`](../../../../commonTypesWithClient/ProblemDetails.types.ts) in error response types
2. **JSDoc Comments**: Use JSDoc for summaries, descriptions, and parameter documentation
3. **Tag Organization**: Use `@tag` annotations to group related endpoints
4. **Custom Descriptions**: Define tag descriptions in [`config/swagger.ts`](../../../../config/swagger.ts)
5. **Security**: Disable Swagger in production or protect with authentication
6. **Validation**: Keep aspida type definitions in sync with actual API behavior
7. **Spec Export**: Generate and version OpenAPI spec files for external tools

## Troubleshooting

### Swagger UI not accessible

Check server logs for:
```
[HttpKernel] Swagger UI available at /api-docs
```

If not present, verify:
- `SWAGGER_ENABLED=true` in `.env`
- [`SwaggerServiceProvider`](../foundation/providers/SwaggerServiceProvider.ts) is registered
- Server restarted after config changes

### Routes not appearing

Ensure:
- `index.ts` files exist in `api/` directories
- Files export valid `DefineMethods` types
- Server has been restarted after route changes

### Config not loading

Check:
- [`config/swagger.ts`](../../../../config/swagger.ts) has no import errors
- Uses relative imports, not path aliases (`$/`)
- Server logs show config discovery

## CLI Commands

### Generate OpenAPI Spec

```bash
# Generate YAML (default)
npm run artisan openapi:generate

# Generate JSON
npm run artisan openapi:generate --format json
npm run artisan openapi:generate -f json

# Custom output path
npm run artisan openapi:generate --output ./openapi.yaml
npm run artisan openapi:generate -o ./docs/api.yaml

# Combined
npm run artisan openapi:generate -f json -o ./public/openapi.json
```

The command is provided by [`GenerateOpenApiCommand`](../../../../app/console/GenerateOpenApiCommand.ts) and registered in [`AppServiceProvider`](../../../../app/providers/AppServiceProvider.ts).

## Related Documentation

- [Usage Guide](USAGE_GUIDE.md) - Detailed examples and patterns
- [API Response Handling](../docs/RFC9457_QUICK_START.md)
- [Response Builder](../docs/RESPONSE_BUILDER.md)
- [Service Providers](../foundation/README.md)
- [Console Commands](../console/README.md)