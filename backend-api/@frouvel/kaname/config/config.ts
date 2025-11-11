/**
 * Configuration Helper
 *
 * Laravel-like config() helper function to access configuration values.
 * Supports dot notation for nested values.
 */

import app from '$/bootstrap/app';

/**
 * Get a configuration value using dot notation
 *
 * @example
 * config('app.name') // Returns app name
 * config('database.connections.postgresql.url') // Returns database URL
 * config('jwt.secret') // Returns JWT secret
 * config('non.existent.key', 'default') // Returns 'default'
 */
export function config<T = any>(key: string, defaultValue?: T): T {
  const configs = app.make<Record<string, any>>('config');

  const keys = key.split('.');
  let value: any = configs;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue as T;
    }
  }

  return value as T;
}

/**
 * Check if a configuration key exists
 */
export function hasConfig(key: string): boolean {
  try {
    const configs = app.make<Record<string, any>>('config');
    const keys = key.split('.');
    let value: any = configs;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get all configuration values for a specific file
 */
export function configAll(file: string): Record<string, any> | undefined {
  const configs = app.make<Record<string, any>>('config');
  return configs[file];
}
