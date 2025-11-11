/**
 * HTTP Kernel
 *
 * Handles HTTP requests and manages the application lifecycle for web requests.
 * Bootstraps the application and initializes the Fastify server.
 */

import type { FastifyInstance, FastifyServerFactory } from 'fastify';
import Fastify from 'fastify';
import server from '$/$server';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { Kernel } from './Kernel';
import type { Application } from './Application';
import type { Bootstrapper } from './Bootstrapper.interface';
import {
  LoadEnvironmentVariables,
  LoadConfiguration,
  HandleExceptions,
  RegisterProviders,
  BootProviders,
} from './bootstrappers';
import { AbstractFrourioFrameworkError } from '../error/FrourioFrameworkError';
import { PROBLEM_DETAILS_MEDIA_TYPE } from '../http/ApiResponse';

export class HttpKernel extends Kernel {
  private _fastifyInstance: FastifyInstance | null = null;

  /**
   * Get the bootstrappers for HTTP requests
   */
  protected getBootstrappers(): Array<new () => Bootstrapper> {
    return [
      LoadEnvironmentVariables,
      LoadConfiguration,
      HandleExceptions,
      RegisterProviders,
      BootProviders,
    ];
  }

  /**
   * Initialize and return the Fastify instance
   */
  async handle(serverFactory?: FastifyServerFactory): Promise<FastifyInstance> {
    // Bootstrap the application
    await this.bootstrap();

    // Create Fastify instance if not already created
    if (!this._fastifyInstance) {
      this._fastifyInstance = await this.createFastifyInstance(serverFactory);
      this._app.setFastifyInstance(this._fastifyInstance);
    }

    return this._fastifyInstance;
  }

  /**
   * Create and configure the Fastify instance
   */
  private async createFastifyInstance(
    serverFactory?: FastifyServerFactory,
  ): Promise<FastifyInstance> {
    const env = this._app.environment();

    console.log(`[HttpKernel] Creating Fastify instance in ${env} mode`);

    const app = Fastify({
      maxParamLength: 1000,
      ...serverFactory,
      logger:
        env === 'production'
          ? true
          : {
              level: 'info',
              transport: {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              },
            },
    });

    // Register plugins
    await this.registerPlugins(app);

    // Set up error handler
    this.setupErrorHandler(app);

    // Register routes via Frourio
    server(app, { basePath: process.env.API_BASE_PATH });

    console.log('[HttpKernel] Fastify instance configured');

    return app;
  }

  /**
   * Register Fastify plugins
   */
  private async registerPlugins(app: FastifyInstance): Promise<void> {
    // Security headers
    await app.register(helmet);

    // CORS configuration
    const config = this._app.has('config')
      ? this._app.make<Record<string, any>>('config')
      : {};
    const corsConfig = config.cors || {};

    await app.register(cors, {
      origin: corsConfig.origins || '*',
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Cookie support
    await app.register(cookie);

    // JWT authentication
    await app.register(jwt, {
      secret: process.env.API_JWT_SECRET ?? '',
    });

    console.log('[HttpKernel] Plugins registered');
  }

  /**
   * Set up global error handler
   */
  private setupErrorHandler(app: FastifyInstance): void {
    app.setErrorHandler((error, request, reply) => {
      if (error instanceof AbstractFrourioFrameworkError) {
        console.error({
          error,
          requestId: request.id,
          body: request.body,
          params: request.params,
          query: request.query,
        });

        reply
          .status(error.httpStatusCode)
          .header('Content-Type', PROBLEM_DETAILS_MEDIA_TYPE)
          .send(error.toProblemDetails());
      } else {
        // Let Fastify handle other errors
        reply.send(error);
      }
    });
  }
}
