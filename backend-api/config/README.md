# Configuration Files

This directory contains all application configuration files, following Laravel's configuration pattern.

## Available Configuration Files

### `app.ts`

Core application settings including name, environment, debug mode, URL, timezone, and locale.

### `admin.ts`

Admin user configuration including default credentials and session settings.

### `cors.ts`

Cross-Origin Resource Sharing (CORS) configuration with allowed origins, methods, and headers.

### `database.ts`

Database connection configuration including connection pool settings and migration paths.

### `jwt.ts`

JSON Web Token (JWT) authentication configuration including secrets, expiration times, and scopes.

## Usage

### Accessing Configuration Values

Use the `config()` helper function to access configuration values using dot notation:

```typescript
import { config } from '$/@frouvel/kaname/config';

// Get a simple value
const appName = config('app.name');

// Get nested values
const jwtSecret = config('jwt.secret');
const dbUrl = config('database.connections.postgresql.url');

// With default value
const customValue = config('app.custom', 'default-value');
```

### Checking if Configuration Exists

```typescript
import { hasConfig } from '$/@frouvel/kaname/config';

if (hasConfig('app.debug')) {
  // Configuration exists
}
```

### Getting All Config for a File

```typescript
import { configAll } from '$/@frouvel/kaname/config';

const allAppConfig = configAll('app');
// Returns: { name: '...', env: '...', debug: true, ... }
```

## Environment Variables

Configuration files can reference environment variables using `process.env` or the validated `env` object from `$/env`:

```typescript
export default {
  // Using process.env with fallback
  name: process.env.APP_NAME || 'Default Name',

  // Using validated env object
  secret: env.API_JWT_SECRET,
};
```

## Configuration Caching

For improved performance in production, configurations can be cached:

### Cache Configuration

```bash
npm run artisan config:cache
```

This creates a cached configuration file in `bootstrap/cache/config.cache.json`.

### Clear Configuration Cache

```bash
npm run artisan config:clear
```

## Adding New Configuration Files

**Configuration files are automatically discovered!** Simply create a new `.ts` file with a Zod schema.

### Step-by-Step Guide

1. **Create config file with Zod schema** (e.g., `mail.ts`):

```typescript
// config/mail.ts
import { z } from 'zod';
import { env } from '$/env';

// Define schema - types are auto-inferred!
export const mailConfigSchema = z.object({
  driver: z.enum(['smtp', 'sendgrid', 'mailgun']),
  host: z.string(),
  port: z.number().positive(),
  encryption: z.enum(['tls', 'ssl']).nullable(),
  from: z.object({
    address: z.string().email(),
    name: z.string(),
  }),
});

// Auto-infer type from schema - no manual typing needed!
export type MailConfig = z.infer<typeof mailConfigSchema>;

// Export validated config
export default mailConfigSchema.parse({
  driver: env.MAIL_DRIVER,
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  encryption: env.MAIL_ENCRYPTION,
  from: {
    address: env.MAIL_FROM_ADDRESS,
    name: env.MAIL_FROM_NAME,
  },
});
```

2. **Add environment variables to `env.ts`**:

```typescript
export const envSchema = z.object({
  // ... existing variables
  MAIL_DRIVER: z.enum(['smtp', 'sendgrid', 'mailgun']).default('smtp'),
  MAIL_HOST: z.string().default('localhost'),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_ENCRYPTION: z.enum(['tls', 'ssl']).nullable().default('tls'),
  MAIL_FROM_ADDRESS: z.string().email().default('noreply@example.com'),
  MAIL_FROM_NAME: z.string().default('App Name'),
});
```

3. **Update type definitions in `@frouvel/kaname/config/types.ts`**:

```typescript
import type { MailConfig } from '$/config/mail';

export type { MailConfig };

export interface Config {
  // ... existing configs
  mail: MailConfig;
}
```

4. **Access with full type safety**:

```typescript
import { config, configObject } from '$/@frouvel/kaname/config';

// Property access (recommended - type-safe)
const driver = configObject.mail.driver; // Type: 'smtp' | 'sendgrid' | 'mailgun'
const port = configObject.mail.port; // Type: number

// Function access (when you need defaults)
const driver = config('mail.driver');
```

**Benefits:**

- ✅ **Zero manual type maintenance** - types auto-inferred from Zod schemas
- ✅ **Runtime validation** - config values validated at startup
- ✅ **Type safety** - full TypeScript support with IntelliSense
- ✅ **Auto-discovery** - no framework changes needed

**Note:** Files are automatically discovered (excluding `.d.ts`, `.test.ts`, `.spec.ts`, `README.md`).

## Best Practices

1. **Use Environment Variables**: Never hardcode sensitive data like secrets or passwords
2. **Provide Defaults**: Always provide sensible default values for non-critical settings
3. **Type Safety**: Export type definitions for your configuration objects
4. **Documentation**: Add JSDoc comments explaining each configuration option
5. **Validation**: Use the `env` object from `$/env` for validated environment variables

## Example: Type-Safe Configuration

```typescript
// config/mail.ts
export interface MailConfig {
  driver: 'smtp' | 'sendgrid' | 'mailgun';
  host: string;
  port: number;
  encryption: 'tls' | 'ssl' | null;
}

export default {
  driver: (process.env.MAIL_DRIVER || 'smtp') as MailConfig['driver'],
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  encryption: (process.env.MAIL_ENCRYPTION || null) as MailConfig['encryption'],
} satisfies MailConfig;
```

Then use it with type safety:

```typescript
import type { MailConfig } from '$/config/mail';

const mailConfig = config<MailConfig>('mail');
// TypeScript knows the exact shape of mailConfig
```
