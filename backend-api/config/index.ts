/**
 * Config Index
 *
 * Central export point for all configuration modules.
 * This allows imports like: import { appConfig } from './config'
 */

export { default as adminConfig } from './admin';
export { default as appConfig } from './app';
export { default as corsConfig } from './cors';
export { default as databaseConfig } from './database';
export { default as jwtConfig } from './jwt';
export { default as redisConfig } from './redis';
export { default as sentryConfig } from './sentry';
export { default as swaggerConfig } from './swagger';
export { default as testingConfig } from './testing';

// Re-export types
export type { AdminConfig } from './admin';
export type { AppConfig } from './app';
export type { CorsConfig } from './cors';
export type { DatabaseConfig } from './database';
export type { JwtConfig } from './jwt';
export type { RedisConfig } from './redis';
export type { SentryConfig } from './sentry';
export type { SwaggerConfig } from './swagger';
export type { TestingConfig } from './testing';
