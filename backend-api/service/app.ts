import server from '$/$server';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { config } from 'dotenv';
import type { FastifyServerFactory } from 'fastify';
import Fastify from 'fastify';
import { NODE_ENV } from '$/env';
import { CORS_ORIGINS } from '$/config/cors';

config();

export const init = (serverFactory?: FastifyServerFactory) => {
  // Sentry.init({
  //   dsn: process.env.SENTRY_DSN,
  //   integrations: [new ProfilingIntegration()],
  //   // Performance Monitoring
  //   tracesSampleRate: 1.0, //  Capture 100% of the transactions
  //   // Set sampling rate for profiling - this is relative to tracesSampleRate
  //   profilesSampleRate: 1.0,
  // });

  const app = Fastify({
    maxParamLength: 1000, // This defaults to 100: returns 404 error params surpass this length
    ...serverFactory,
    logger:
      NODE_ENV === 'production'
        ? undefined
        : {
            level: 'info',
            // Using a simpler logger configuration to avoid worker thread issues
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

  app.register(helmet);
  app.register(cors, { origin: CORS_ORIGINS, credentials: true });
  app.register(cookie);
  app.register(jwt, { secret: process.env.API_JWT_SECRET ?? '' });

  server(app, { basePath: process.env.API_BASE_PATH });

  return app;
};
