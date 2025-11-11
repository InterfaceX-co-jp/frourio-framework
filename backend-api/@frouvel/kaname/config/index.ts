/**
 * Configuration Module
 *
 * Exports configuration helpers and types.
 */

export { config, hasConfig, configAll, configObject } from './config';

// Re-export types from user-space configuration
export type {
  Config,
  ConfigPaths,
  AppConfig,
  AdminConfig,
  CorsConfig,
  DatabaseConfig,
  JwtConfig,
} from '$/config/$types';