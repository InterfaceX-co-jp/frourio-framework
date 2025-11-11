/**
 * Database Service Provider
 *
 * Framework-level service provider that registers database services.
 * Registers Prisma client as a singleton and handles connection setup.
 */

import type { Application, ServiceProvider } from '../Application';
import type { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../../database';

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