# Environment Module

A Laravel-inspired facade for environment variable management with type-safe validation support.

## Features

- 🔒 **Type-Safe**: Zod schema validation for environment variables
- 🎯 **Type Helpers**: Built-in methods for boolean, int, float, and JSON parsing
- 🛡️ **Fail-Safe**: Required variables with `getOrFail()`
- 🏷️ **Environment Detection**: Easy checks for production, development, and test environments
- 📝 **Well-Documented**: Comprehensive JSDoc comments and examples

## Installation

```typescript
import { Env } from '$/@frouvel/kaname/env';
```

## Basic Usage

### Get Environment Variables

```typescript
// Get with default value
const apiUrl = Env.get('API_URL', 'http://localhost:3000');

// Get required variable (throws if missing)
const dbUrl = Env.getOrFail('DATABASE_URL');

// Check if variable exists
if (Env.has('OPTIONAL_FEATURE')) {
  // Variable exists (even if empty)
}

// Check if variable is set with a value
if (Env.isSet('API_KEY')) {
  // Variable has a non-empty value
}
```

### Type Helpers

```typescript
// Boolean values (handles 'true', '1', 'yes', 'on')
const isDebug = Env.getBoolean('DEBUG', false);
const useCache = Env.getBoolean('USE_CACHE', true);

// Integer values
const port = Env.getInt('PORT', 3000);
const maxConnections = Env.getInt('MAX_CONNECTIONS', 100);

// Float values
const timeout = Env.getFloat('TIMEOUT', 1.5);
const ratio = Env.getFloat('CACHE_RATIO', 0.75);

// JSON values
const config = Env.getJson('APP_CONFIG', { feature: 'enabled' });
const options = Env.getJson<MyOptions>('OPTIONS', defaultOptions);
```

### Environment Detection

```typescript
// Check environment
if (Env.isProduction()) {
  // Production-only logic
}

if (Env.isDevelopment()) {
  // Development-only logging
}

if (Env.isTesting()) {
  // Use test database
}

// Get environment name
const env = Env.getEnvironment('development');
console.log(`Running in ${env} mode`);
```

## Schema Validation

### Basic Validation

```typescript
import { z } from 'zod';
import { Env } from '$/@frouvel/kaname/env';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().regex(/^\d+$/),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(32),
});

// Register and validate schema
Env.registerSchema(envSchema);
```

### Custom Error Handling

```typescript
Env.registerSchema(envSchema, {
  exitOnError: false,
  onError: (error) => {
    logger.error('Environment validation failed:', error.flatten().fieldErrors);
    // Custom error handling logic
  },
});
```

### Check Validation Status

```typescript
if (!Env.isValidated()) {
  console.warn('Environment not validated yet');
}

const schema = Env.getSchema();
if (schema) {
  // Schema is registered
}
```

## API Reference

### Core Methods

#### `get(key: string, defaultValue?: string): string | undefined`

Get an environment variable with optional default value.

#### `getOrFail(key: string): string`

Get a required environment variable. Throws if missing.

#### `has(key: string): boolean`

Check if environment variable exists (even if empty).

#### `isSet(key: string): boolean`

Check if environment variable is set with a non-empty value.

#### `all(): NodeJS.ProcessEnv`

Get all environment variables.

### Type Helpers

#### `getBoolean(key: string, defaultValue?: boolean): boolean`

Get environment variable as boolean. Recognizes:
- Truthy: `'true'`, `'1'`, `'yes'`, `'on'`
- Falsy: `'false'`, `'0'`, `'no'`, `'off'`

#### `getInt(key: string, defaultValue?: number): number | undefined`

Parse environment variable as integer.

#### `getFloat(key: string, defaultValue?: number): number | undefined`

Parse environment variable as float.

#### `getJson<T>(key: string, defaultValue?: T): T | undefined`

Parse environment variable as JSON.

### Schema Validation

#### `registerSchema(schema: z.ZodSchema, options?: SchemaValidationOptions): void`

Register and validate a Zod schema against environment variables.

Options:
- `exitOnError`: Whether to exit process on failure (default: `true`)
- `onError`: Custom error handler function

#### `getSchema(): z.ZodSchema | null`

Get the registered schema.

#### `isValidated(): boolean`

Check if environment has been validated successfully.

### Environment Detection

#### `isProduction(): boolean`

Check if `NODE_ENV === 'production'`.

#### `isDevelopment(): boolean`

Check if `NODE_ENV === 'development'`.

#### `isTesting(): boolean`

Check if `NODE_ENV === 'test'`.

#### `getEnvironment(defaultEnv?: string): string`

Get current environment name with fallback.

## Examples

### Complete Application Setup

```typescript
// env.ts
import { z } from 'zod';
import { Env } from '$/@frouvel/kaname/env';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Define schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  API_SERVER_PORT: z.coerce.number().min(1024).max(65535).default(8080),
  API_BASE_PATH: z.string().default('/api'),
  API_JWT_SECRET: z.string().min(32),
  WEB_FRONTEND_URL: z.string().url(),
  DEBUG: z.string().optional(),
  USE_CACHE: z.string().optional(),
});

// Validate environment
Env.registerSchema(envSchema);

// Export parsed values
export const env = envSchema.parse(process.env);
```

### Using in Application

```typescript
import { Env } from '$/@frouvel/kaname/env';

// Configuration
const config = {
  port: Env.getInt('API_SERVER_PORT', 8080),
  isDebug: Env.getBoolean('DEBUG', false),
  useCache: Env.getBoolean('USE_CACHE', true),
  jwtSecret: Env.getOrFail('API_JWT_SECRET'),
};

// Conditional logic
if (Env.isProduction()) {
  // Enable production optimizations
  config.useCache = true;
} else if (Env.isDevelopment()) {
  // Enable development features
  config.isDebug = true;
}

// Start server
console.log(`Starting server in ${Env.getEnvironment()} mode`);
console.log(`Port: ${config.port}`);
```

### Error Handling

```typescript
try {
  const requiredApiKey = Env.getOrFail('THIRD_PARTY_API_KEY');
  // Use API key
} catch (error) {
  console.error('Missing required API key');
  process.exit(1);
}
```

## Migration from Legacy API

If you're using the old `registerZodSchema` method:

```typescript
// Old (deprecated)
Env.registerZodSchema(schema);

// New
Env.registerSchema(schema);
```

The deprecated method is still available but will be removed in a future version.

## Best Practices

1. **Validate Early**: Register your schema at application startup
2. **Use Type Helpers**: Prefer `getInt()`, `getBoolean()` over manual parsing
3. **Fail Fast**: Use `getOrFail()` for required variables
4. **Provide Defaults**: Always provide sensible defaults where possible
5. **Document Schema**: Keep your Zod schema well-documented
6. **Environment Checks**: Use `isProduction()`, `isDevelopment()` instead of manual checks

## Architecture

This module follows the Laravel-inspired facade pattern used throughout `@frouvel/kaname`:

- **Stateless API**: Simple, functional interface
- **Single Responsibility**: Focused on environment variable management
- **Well-Documented**: Comprehensive JSDoc comments and examples
- **Type-Safe**: Full TypeScript support with Zod integration
- **Tested**: (Add tests following the Hash module pattern)

## Related Modules

- [`@frouvel/kaname/hash`](../hash/README.md) - Password hashing utilities
- [`@frouvel/kaname/foundation`](../foundation/README.md) - Application foundation