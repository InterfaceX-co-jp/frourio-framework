/**
 * Sentry Service Provider
 *
 * Framework-level service provider that initializes Sentry error monitoring
 * and performance tracking based on configuration.
 */

import type { Application, ServiceProvider } from '../Application';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import type { FastifyInstance } from 'fastify';

export class SentryServiceProvider implements ServiceProvider {
  /**
   * Register Sentry services
   */
  register(app: Application): void {
    const sentryConfig = this.getSentryConfig(app);

    // Only initialize if enabled and DSN is provided
    if (!sentryConfig?.enabled || !sentryConfig?.dsn) {
      console.log(
        '[SentryServiceProvider] Sentry is disabled or DSN not configured',
      );
      return;
    }

    // Initialize Sentry
    const integrations = [nodeProfilingIntegration()];

    // Add custom integrations if provided in config
    if (sentryConfig.integrations) {
      integrations.push(...sentryConfig.integrations);
    }

    Sentry.init({
      dsn: sentryConfig.dsn,
      environment: sentryConfig.environment,
      release: sentryConfig.release,
      tracesSampleRate: sentryConfig.tracesSampleRate,
      profilesSampleRate: sentryConfig.profilesSampleRate,
      debug: sentryConfig.debug,
      serverName: sentryConfig.serverName,
      attachStacktrace: sentryConfig.attachStacktrace,
      integrations,
      beforeSend: sentryConfig.beforeSend,
      beforeSendTransaction: sentryConfig.beforeSendTransaction,
    });

    // Register Sentry client in container
    app.singleton('sentry', () => Sentry);

    console.log(
      `[SentryServiceProvider] Sentry initialized for environment: ${sentryConfig.environment}`,
    );
  }

  /**
   * Boot Sentry services
   *
   * Sets up Fastify error handlers and request tracing
   */
  async boot(app: Application): Promise<void> {
    const sentryConfig = this.getSentryConfig(app);

    if (!sentryConfig?.enabled || !sentryConfig?.dsn) {
      return;
    }

    try {
      // Get Fastify instance if available (HTTP kernel)
      const fastify = app.getFastifyInstance();

      if (fastify) {
        this.setupFastifyIntegration(fastify, sentryConfig);
        console.log(
          '[SentryServiceProvider] Fastify error handling integrated with Sentry',
        );
      }
    } catch {
      // Fastify instance not available (Console kernel or not yet initialized)
      console.log(
        '[SentryServiceProvider] Fastify instance not available, skipping HTTP integration',
      );
    }
  }

  /**
   * Get Sentry configuration from application container
   */

  private getSentryConfig(app: Application): any {
    try {
      const config = app.make<Record<string, any>>('config');
      return config.sentry;
    } catch {
      // Config not loaded yet (e.g., during bootstrapping or in test environment)
      return null;
    }
  }

  /**
   * Setup Sentry integration with Fastify
   */
  private setupFastifyIntegration(
    fastify: FastifyInstance,

    sentryConfig: any,
  ): void {
    // Add request context
    fastify.addHook('onRequest', async (request) => {
      const scope = Sentry.getCurrentScope();
      scope.setContext('request', {
        method: request.method,
        url: request.url,
        headers: request.headers,
        query: request.query,
      });

      // Set user context if available

      const user = (request as any).user;
      if (user && typeof user === 'object' && 'id' in user) {
        scope.setUser({
          id: String(user.id),
          email: user.email,
        });
      }
    });

    // Capture errors
    fastify.setErrorHandler((error, request) => {
      // Capture error in Sentry
      Sentry.captureException(error, {
        contexts: {
          request: {
            method: request.method,
            url: request.url,
            headers: request.headers,
            query: request.query,
            params: request.params,
            body: request.body,
          },
        },
        tags: {
          path: request.url,
          method: request.method,
        },
      });

      // Re-throw to let the default error handler process it
      throw error;
    });

    // Add response time tracking
    if (sentryConfig.tracesSampleRate > 0) {
      fastify.addHook('onRequest', async (request) => {
        // Start a new span for this request
        const span = Sentry.startInactiveSpan({
          op: 'http.server',
          name: `${request.method} ${request.url}`,
          attributes: {
            'http.method': request.method,
            'http.url': request.url,
          },
        });

        // Store span in request for later use

        (request as any).sentrySpan = span;
      });

      fastify.addHook('onResponse', async (request, reply) => {
        const span = (request as any).sentrySpan;
        if (span) {
          span.setStatus({ code: reply.statusCode >= 400 ? 2 : 1 });
          span.end();
        }
      });
    }
  }
}
