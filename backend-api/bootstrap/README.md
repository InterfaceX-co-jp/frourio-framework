# Application Bootstrap

This directory contains the application-specific bootstrap configuration for your frourio-framework application.

## Overview

The bootstrap system uses the framework provided by [`@frouvel/kaname/foundation`](../@frouvel/kaname/foundation/README.md) to initialize and configure your application.

## Structure

```
backend-api/bootstrap/
├── app.ts                      # Application entry point
├── providers/                  # Application-specific service providers
│   └── DatabaseServiceProvider.ts
├── cache/                      # Bootstrap cache files (.gitignored)
│   └── .gitkeep
└── .gitignore
```

## Application Entry Point (`app.ts`)

This is where your application is created and configured:

```typescript
import { Application, HttpKernel, ConsoleKernel } from '$/@frouvel/kaname/foundation';

// Create application
const app = new Application(basePath);

// Bind kernels
app.singleton('HttpKernel', () => new HttpKernel(app));
app.singleton('ConsoleKernel', () => new ConsoleKernel(app));

// Register service providers
const providers = [
  DatabaseServiceProvider,
  // Add your providers here
];

providers.forEach(Provider => {
  const provider = new Provider();
  app.register(provider);
});

export default app;
```

## Service Providers

Service providers are the central place to configure your application's services. Place your application-specific providers in the `providers/` directory.

### Example: DatabaseServiceProvider

```typescript
import type { ServiceProvider, Application } from '$/@frouvel/kaname/foundation';
import type { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '$/service/getPrismaClient';

export class DatabaseServiceProvider implements ServiceProvider {
  register(app: Application): void {
    app.singleton('prisma', () => getPrismaClient());
  }

  async boot(app: Application): Promise<void> {
    const prisma = app.make<PrismaClient>('prisma');
    await prisma.$connect();
  }
}
```

## Adding a New Service Provider

1. Create your provider in `bootstrap/providers/`:

```typescript
// bootstrap/providers/CacheServiceProvider.ts
import type { ServiceProvider, Application } from '$/@frouvel/kaname/foundation';

export class CacheServiceProvider implements ServiceProvider {
  register(app: Application): void {
    app.singleton('cache', () => new CacheService());
  }

  async boot(app: Application): Promise<void> {
    // Boot logic if needed
  }
}
```

2. Register it in `bootstrap/app.ts`:

```typescript
import { CacheServiceProvider } from './providers/CacheServiceProvider';

const providers = [
  DatabaseServiceProvider,
  CacheServiceProvider, // Add here
];
```

## Configuration Caching

For production performance, cache your configuration:

```bash
npm run cli config:cache
```

This creates `bootstrap/cache/config.cache.json` which is automatically loaded in production.

To clear the cache:

```bash
npm run cli config:clear
```

## Framework Documentation

For detailed information about the bootstrap system, kernels, and bootstrappers, see:

- [`@frouvel/kaname/foundation` Documentation](../@frouvel/kaname/foundation/README.md)