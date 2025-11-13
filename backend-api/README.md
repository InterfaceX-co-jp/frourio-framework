# Backend API

Backend API for frourio-framework project.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn
- PostgreSQL (or your preferred database)

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### Database Setup

```bash
# Run migrations
npm run migrate:dev

# Or for production
npm run migrate:deploy
```

### Development

```bash
npm run dev
```

This will start:
- 📦 Build watcher
- 🏃 Application server
- 🏰 Frourio code generator

## Artisan Console

The project includes an Artisan-like CLI for managing your application.

### Running Commands

```bash
npm run artisan <command> [arguments] [options]
```

### Available Commands

```bash
# Get help
npm run artisan --help
npm run artisan <command> --help

# Built-in commands
npm run artisan inspire                    # Display an inspiring quote
npm run artisan config:cache               # Cache configuration
npm run artisan config:clear               # Clear configuration cache
npm run artisan generate:config-types      # Generate type-safe config types
npm run artisan greet "John" --title "Dr." # Greet command example

# OpenAPI/Swagger commands
npm run artisan openapi:generate           # Generate OpenAPI spec file (YAML)
npm run artisan openapi:generate -f json   # Generate as JSON
npm run artisan openapi:generate -o ./openapi.yaml  # Custom output path
```

### Creating Custom Commands

See the [Console Documentation](@frouvel/kaname/console/README.md) for detailed instructions on creating custom commands.

Quick example:

```typescript
import { Command, type CommandSignature } from '$/@frouvel/kaname/console';

export class MyCommand extends Command {
  protected signature(): CommandSignature {
    return {
      name: 'my:command',
      description: 'Description of my command',
    };
  }

  async handle(): Promise<void> {
    this.info('Running command...');
    this.success('Done!');
  }
}
```

Register in `bootstrap/providers/ConsoleServiceProvider.ts`:

```typescript
kernel.registerCommands([
  new MyCommand(app),
]);
```

## Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run dev:build` - Watch and build TypeScript files
- `npm run dev:run` - Run the server with Node watch mode
- `npm run dev:frourio` - Watch and generate Frourio files

### Building

- `npm run build` - Build for production
- `npm run generate` - Generate Aspida, Frourio, and Prisma types
- `npm run generate:aspida` - Generate Aspida types
- `npm run generate:frourio` - Generate Frourio files
- `npm run generate:prisma` - Generate Prisma client

### Database

- `npm run migrate:dev` - Run migrations and seed database (development)
- `npm run migrate:dev:createonly` - Create migration without running
- `npm run migrate:deploy` - Run migrations and seed (production)
- `npm run migrate:reset` - Reset database
- `npm run seed:dev` - Seed development data
- `npm run seed:production` - Seed production data

### Testing

- `npm run test` - Run tests
- `npm run typecheck` - Check TypeScript types

### Linting

- `npm run lint` - Lint code
- `npm run lint:fix` - Lint and fix code

### Production

- `npm run start` - Start production server
- `npm run artisan` - Run Artisan console commands

### Utility

- `npm run tsx` - Run TypeScript files with tsx
- `npm run cli` - Run the legacy CLI (deprecated, use artisan instead)

## Project Structure

```
backend-api/
├── @frouvel/kaname/          # Core framework modules
│   ├── artisan/              # Artisan CLI entry point
│   ├── console/              # Console command system
│   ├── error/                # Error handling
│   ├── foundation/           # Application foundation
│   ├── hash/                 # Hashing utilities
│   ├── http/                 # HTTP response utilities
│   ├── paginator/            # Pagination utilities
│   └── validation/           # Validation utilities
├── api/                      # API routes (Frourio)
├── bootstrap/                # Application bootstrap
│   ├── cache/                # Configuration cache
│   └── providers/            # Service providers
├── commonConstantsWithClient/# Shared constants
├── commonTypesWithClient/    # Shared types
├── config/                   # Configuration files
├── domain/                   # Domain layer (DDD)
├── entrypoints/              # Application entry points
├── middleware/               # Middleware
├── prisma/                   # Prisma schema and migrations
├── scripts/                  # Build scripts
├── service/                  # Application services
└── tests/                    # Test files
```

## Architecture

This project follows Domain-Driven Design (DDD) principles:

- **API Layer**: Route handlers (controllers)
- **Domain Layer**: Business logic, entities, repositories, use cases
- **Infrastructure Layer**: External services, database access

### @frouvel/kaname

Core framework inspired by Laravel's Illuminate namespace:

- **Foundation**: Application container and kernels
- **Console**: Artisan-like CLI system
- **HTTP**: Response builders and error handling
- **Error**: Structured error classes
- **Hash**: Password hashing
- **Validation**: Zod-based validation
- **Paginator**: Pagination utilities

See [@frouvel/kaname/README.md](@frouvel/kaname/README.md) for more details.

## API Development

### Creating an Endpoint

1. Create route directory in `api/`
2. Define types in `index.ts`
3. Implement controller in `controller.ts`
4. Create use cases in `domain/`

Example:

```typescript
// api/users/index.ts
import type { DefineMethods } from 'aspida';
import type { UserModelDto, ProblemDetails } from 'commonTypesWithClient';

export type Methods = DefineMethods<{
  get: {
    resBody: UserModelDto | ProblemDetails;
  };
}>;

// api/users/controller.ts
import { ApiResponse } from '$/@frouvel/kaname/http/ApiResponse';
import { FindUserUseCase } from '$/domain/user/usecase/FindUser.usecase';
import { defineController } from './$relay';

export default defineController(() => ({
  get: ({ params }) =>
    FindUserUseCase.create()
      .handleById({ id: params.id })
      .then(ApiResponse.success)
      .catch(ApiResponse.method.get),
}));
```

## Testing

The project includes a comprehensive testing framework at `@frouvel/kaname/testing`.

### Quick Start

```typescript
import { IntegrationTestCase } from '$/@frouvel/kaname/testing';
import { expect } from 'vitest';

class MyTest extends IntegrationTestCase {
  run() {
    this.suite('My Test Suite', () => {
      this.test('my test', async () => {
        const response = await this.get('/api/health');
        this.assertOk(response);
      });
    });
  }
}

new MyTest().run();
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/integration/users.integration.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Features

- **Test Case Classes**: `TestCase`, `DatabaseTestCase`, `IntegrationTestCase`
- **Factory Pattern**: Generate test data with `Factory` and `fake` helpers
- **API Client**: Fluent HTTP request interface
- **Automatic Setup**: Database migrations, seeding, and cleanup
- **Rich Assertions**: Expressive assertion helpers

### Documentation

- [Testing Framework Documentation](@frouvel/kaname/testing/README.md)
- [Migration Guide](@frouvel/kaname/testing/MIGRATION_GUIDE.md)
- [Example Tests](tests/integration/)

## Environment Variables

See `.env.example` for required environment variables.

## API Documentation (Swagger/OpenAPI)

This project includes automatic OpenAPI 3.0 specification generation and interactive Swagger UI.

### Access Swagger UI

Once the server is running:

```
http://localhost:31577/api-docs
```

### Features

- **Automatic Generation**: OpenAPI spec auto-generated from aspida type definitions
- **Interactive UI**: Test APIs directly from the browser
- **JSDoc Support**: Enhanced documentation via JSDoc comments
- **Tag Grouping**: Organize endpoints by custom tags
- **RFC9457 Schemas**: Built-in ProblemDetails error schemas

### Generate OpenAPI Spec File

```bash
# Generate YAML file (default)
npm run artisan openapi:generate

# Generate JSON file
npm run artisan openapi:generate -f json

# Custom output path
npm run artisan openapi:generate -o ./docs/openapi.yaml
```

### Configuration

Configure via [`config/swagger.ts`](config/swagger.ts) or environment variables:

```bash
SWAGGER_ENABLED=true
SWAGGER_PATH=/api-docs
SWAGGER_TITLE=My API
SWAGGER_VERSION=1.0.0
```

For detailed documentation, see:
- [Swagger Module README](@frouvel/kaname/swagger/README.md)
- [Usage Guide](@frouvel/kaname/swagger/USAGE_GUIDE.md)

## Documentation

- [Artisan Console](@frouvel/kaname/console/README.md)
- [Testing Framework](@frouvel/kaname/testing/README.md)
- [Swagger/OpenAPI](@frouvel/kaname/swagger/README.md)
- [RFC9457 Error Handling](docs/RFC9457_ERROR_HANDLING.md)
- [Response Builder](docs/RESPONSE_BUILDER.md)
- [Frontend API Usage](docs/RFC9457_FRONTEND_USAGE.md)

## Contributing

1. Follow DDD principles
2. Use TypeScript strict mode
3. Write tests for new features
4. Update documentation
5. Follow the code style (ESLint + Prettier)

## License

ISC