/**
 * Database Service Provider
 *
 * Registers database-related services with the application container.
 * Example service provider showing how to register Prisma client.
 */

import type {
  ServiceProvider,
  Application,
} from '$/@frouvel/kaname/foundation';
import type { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '$/service/getPrismaClient';

export class DatabaseServiceProvider implements ServiceProvider {
  /**
   * Register database services
   */
  register(app: Application): void {
    // Register Prisma client as a singleton
    app.singleton('prisma', () => getPrismaClient());

    console.log('[DatabaseServiceProvider] Database services registered');
  }

  /**
   * Boot database services
   */
  async boot(app: Application): Promise<void> {
    // Connect to database on boot
    const prisma = app.make<PrismaClient>('prisma');

    try {
      await prisma.$connect();
      console.log('[DatabaseServiceProvider] Database connection established');
    } catch (error) {
      console.error(
        '[DatabaseServiceProvider] Failed to connect to database:',
        error,
      );
      throw error;
    }
  }
}
