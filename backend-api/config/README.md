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

1. Create a new `.ts` file in this directory (e.g., `mail.ts`)
2. Export a default object with your configuration:

```typescript
// config/mail.ts
export default {
  driver: process.env.MAIL_DRIVER || 'smtp',
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
};
```

3. Add the filename (without extension) to the `configFiles` array in `@frouvel/kaname/foundation/bootstrappers/LoadConfiguration.ts`:

```typescript
const configFiles = ['app', 'admin', 'cors', 'database', 'jwt', 'mail'];
```

4. Access it using the config helper:

```typescript
const mailDriver = config('mail.driver');
```

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