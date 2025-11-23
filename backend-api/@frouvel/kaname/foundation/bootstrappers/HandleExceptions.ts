/**
 * Handle Exceptions Bootstrapper
 * 
 * Sets up global exception handlers for the application.
 * Ensures uncaught exceptions and unhandled rejections are properly logged.
 */

import type { Bootstrapper } from '../Bootstrapper.interface';
import type { Application } from '../Application';

export class HandleExceptions implements Bootstrapper {
  bootstrap(app: Application): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('[Bootstrap] Uncaught Exception:', error);
      
      // In production, you might want to send this to a logging service
      // like Sentry, Datadog, etc.
      if (app.isProduction()) {
        // Log to external service
        // Sentry.captureException(error);
      }
      
      // Exit gracefully
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('[Bootstrap] Unhandled Rejection at:', promise, 'reason:', reason);
      
      if (app.isProduction()) {
        // Log to external service
        // Sentry.captureException(reason);
      }
    });

    // Handle process termination signals
    process.on('SIGTERM', () => {
      console.log('[Bootstrap] SIGTERM signal received: closing application');
      this.gracefulShutdown(app);
    });

    process.on('SIGINT', () => {
      console.log('[Bootstrap] SIGINT signal received: closing application');
      this.gracefulShutdown(app);
    });

    console.log('[Bootstrap] Exception handlers registered');
  }

  private async gracefulShutdown(app: Application): Promise<void> {
    try {
      // Close Fastify server if running
      const fastify = app.getFastifyInstance();
      if (fastify) {
        await fastify.close();
        console.log('[Bootstrap] Fastify server closed');
      }

      // Additional cleanup can be added here
      // e.g., close database connections, flush logs, etc.

      process.exit(0);
    } catch (error) {
      console.error('[Bootstrap] Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}