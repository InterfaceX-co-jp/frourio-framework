# Swagger/OpenAPI Module

Provides automatic OpenAPI specification generation and Swagger UI integration for frourio-framework APIs.

## Features

- 🔄 **Automatic Generation**: Generates OpenAPI 3.0 specs from aspida type definitions
- 🎨 **Swagger UI**: Interactive API documentation interface
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

### 3. Service Provider Registration

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

The [`OpenApiGenerator`](OpenApiGenerator.ts) scans your `api/` directory and:

- Discovers routes from file structure
- Extracts type definitions from aspida `index.ts` files
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

### 3. Type Extraction

Method definitions are extracted from aspida types:

```typescript
// api/users/index.ts
export type Methods = DefineMethods<{
  get: {
    query: {
      page: number;
      limit: number;
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
    parameters:
      - name: page
        in: query
        required: true
        schema:
          type: number
      - name: limit
        in: query
        required: true
        schema:
          type: number
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
};
```

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
2. **Documentation**: Add JSDoc comments to types for richer descriptions
3. **Security**: Disable Swagger in production or protect with authentication
4. **Validation**: Keep aspida type definitions in sync with actual API behavior

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

## Related Documentation

- [API Response Handling](../docs/RFC9457_QUICK_START.md)
- [Response Builder](.../docs/RESPONSE_BUILDER.md)
- [Service Providers](../foundation/README.md)